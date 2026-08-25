import { LocalStore } from '../lib/localStore';
import { WorldEngine } from './world/worldEngine';
import { computeContinuity } from './world/continuityEngine';
import { CharacterEngine } from './character/characterEngine';
import { MemoryEngine } from './memory/memoryEngine';
import { JourneyEngine } from './journey/journeyEngine';
import { tutorEngine, SCENARIOS } from './tutor/tutorEngine';
import { ExperienceDirector } from './director/experienceDirector';
import { CreationStudio } from './creation/creationStudio';
import { KnowledgeEngine } from './knowledge/knowledgeEngine';
import { QuestEngine } from './quest/questEngine';
import { EconomyEngine } from './economy/economyEngine';
import { AudioEngine } from './audio/audioEngine';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
  durationMs: number;
}

export interface TestSuiteReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
}

export class EngineTestRunner {
  static async runAllTests(): Promise<TestSuiteReport> {
    const results: TestResult[] = [];

    // Test 1: LocalStore Resilient Persistence
    await this.runTest(results, 'LocalStore', 'getWorldState returns valid default world state', async () => {
      const state = await LocalStore.getWorldState();
      if (!state || !state.user_id || !state.time_of_day) throw new Error('Invalid world state returned');
    });

    await this.runTest(results, 'LocalStore', 'getCassidyView returns character, state and relationship', async () => {
      const { character, state, relationship } = await LocalStore.getCassidyView();
      if (!character || !state || !relationship) throw new Error('Missing Cassidy sub-entities');
      if (character.key !== 'cassidy') throw new Error('Expected character key "cassidy"');
    });

    // Test 2: Continuity Engine
    await this.runTest(results, 'ContinuityEngine', 'computeContinuity calculates elapsed time and recap', async () => {
      const past = new Date(Date.now() - 4 * 3600 * 1000).toISOString();
      const res = computeContinuity(past);
      if (res.elapsedMs <= 0) throw new Error('Unexpected elapsed hours');
    });

    // Test 3: Tutor Engine & Socratic Dialogue
    await this.runTest(results, 'TutorEngine', 'evaluateInput returns accurate naturalness score and hints', async () => {
      const step = SCENARIOS[0].steps[0];
      const evalRes = tutorEngine.evaluateInput('ホット抹茶ラテをこれをください。', step);
      if (evalRes.score < 80) throw new Error(`Expected score >= 80, got ${evalRes.score}`);
      if (!evalRes.feedback) throw new Error('Expected feedback message');
    });

    await this.runTest(results, 'TutorEngine', 'World DJ prompt matcher recommends appropriate scenario', async () => {
      const djRes = tutorEngine.interpretExperienceRequest('I want to order something delicious at a café');
      if (!djRes.recommendation || !djRes.targetLocationKey) throw new Error('World DJ failed to recommend scenario');
    });

    // Test 4: Experience Director
    await this.runTest(results, 'ExperienceDirector', 'getTodayPrimaryMoment returns curated encounter', async () => {
      const moment = await ExperienceDirector.getTodayPrimaryMoment();
      if (!moment.headline || !moment.targetLocationKey) throw new Error('Invalid primary moment');
    });

    await this.runTest(results, 'ExperienceDirector', 'composeSession generates structured plan with explainability', async () => {
      const plan = await ExperienceDirector.composeSession('conversation', 5);
      if (plan.steps.length === 0) throw new Error('Plan steps are empty');
      if (!plan.reason) throw new Error('Explainability reason is missing');
    });

    // Test 5: Creation Studio
    await this.runTest(results, 'CreationStudio', 'createArtifact saves to LocalStore and MemoryMuseum', async () => {
      const creation = await CreationStudio.createArtifact({
        type: 'phrase_card',
        title: 'Diagnostic Test Card',
        subtitle: 'Auto-Verification',
        content: 'Arigatou gozaimasu',
        visualTheme: 'emerald',
        tags: ['Diagnostic', 'Test'],
      });
      if (!creation.id || creation.title !== 'Diagnostic Test Card') throw new Error('Failed to create creation');
    });

    // Test 6: Knowledge Engine & Universal Search
    await this.runTest(results, 'KnowledgeEngine', 'searchAll finds matching terms and locations', async () => {
      const searchRes = await KnowledgeEngine.searchAll('matcha');
      if (searchRes.length === 0) throw new Error('Expected search to return at least 1 match');
    });

    await this.runTest(results, 'KnowledgeEngine', 'getKnowledgeConstellation returns connected nodes', async () => {
      const constellation = await KnowledgeEngine.getKnowledgeConstellation();
      if (constellation.nodes.length === 0) throw new Error('Constellation nodes empty');
    });

    // Test 7: Quest & Economy Engines
    await this.runTest(results, 'QuestEngine', 'completeQuest awards sparkles and marks completed', async () => {
      const quests = await QuestEngine.getQuests();
      if (quests.length === 0) throw new Error('No quests found');
      const updated = await QuestEngine.completeQuest(quests[0].id);
      const target = updated.find((q) => q.id === quests[0].id);
      if (!target?.completed) throw new Error('Quest was not marked completed');
    });

    await this.runTest(results, 'EconomyEngine', 'awardSparkles increases balance correctly', async () => {
      const before = await EconomyEngine.getEconomyState();
      const after = await EconomyEngine.awardSparkles(25, 'Diagnostic test reward');
      if (after.sparkles !== before.sparkles + 25) throw new Error('Sparkle increment mismatch');
    });

    // Test 8: Journey Engine
    await this.runTest(results, 'JourneyEngine', 'buildBook returns timeline and ThenVsNow growth items', async () => {
      const journey = new JourneyEngine();
      const book = await journey.buildBook('local-explorer-user');
      if (book.timeline.length === 0) throw new Error('Timeline is empty');
      if (book.thenVsNow.length === 0) throw new Error('ThenVsNow comparisons empty');
    });

    const passedTests = results.filter((r) => r.passed).length;
    return {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedTests,
      failedTests: results.length - passedTests,
      results,
    };
  }

  private static async runTest(
    results: TestResult[],
    suite: string,
    name: string,
    fn: () => Promise<void>
  ): Promise<void> {
    const start = Date.now();
    try {
      await fn();
      results.push({
        suite,
        name,
        passed: true,
        durationMs: Date.now() - start,
      });
    } catch (err: any) {
      results.push({
        suite,
        name,
        passed: false,
        message: err?.message || String(err),
        durationMs: Date.now() - start,
      });
    }
  }
}
