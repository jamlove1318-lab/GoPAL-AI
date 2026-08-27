import { LocalStore, KnowledgeNode, CulturalArtifact, PostcardItem, CustomCreation } from '../../lib/localStore';
import { WaveStore, LearningEcho, WorldEcho } from '../../lib/waveStore';

export interface SearchResultCategory {
  title: string;
  category: 'knowledge' | 'locations' | 'characters' | 'memories' | 'artifacts' | 'creations';
  items: {
    id: string;
    title: string;
    subtitle: string;
    badge?: string;
    payload?: any;
  }[];
}

export interface KnowledgeRecallEvidence {
  success: boolean;
  accuracy?: number;
  confidence?: number;
  hintDependency?: 'none' | 'light' | 'moderate' | 'high';
  partialUnderstanding?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export class KnowledgeEngine {
  /** Universal Search "Ask / Find / Go" (Blueprint Wave 4J, 4U) */
  static async searchAll(query: string): Promise<SearchResultCategory[]> {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const results: SearchResultCategory[] = [];

    const knowledgeNodes = await LocalStore.getKnowledgeNodes();
    const matchedNodes = knowledgeNodes.filter(
      (n) => n.term.toLowerCase().includes(q) || n.reading.toLowerCase().includes(q) || n.meaning.toLowerCase().includes(q)
    );
    if (matchedNodes.length > 0) {
      results.push({
        title: 'Vocabulary & Concepts', category: 'knowledge',
        items: matchedNodes.map((n) => ({ id: n.id, title: `${n.term} (${n.reading})`, subtitle: `${n.meaning} · Mastery: ${n.masteryLevel}%`, badge: n.category, payload: n })),
      });
    }

    const locations = await LocalStore.getLocations();
    const matchedLocs = locations.filter((l) => l.name.toLowerCase().includes(q) || l.key.toLowerCase().includes(q));
    if (matchedLocs.length > 0) {
      results.push({ title: 'World Locations', category: 'locations', items: matchedLocs.map((l) => ({ id: l.id, title: l.name, subtitle: `Familiarity: ${l.familiarity_stage.toUpperCase()}`, badge: 'World', payload: l })) });
    }

    const artifacts = await LocalStore.getCulturalArtifacts();
    const matchedArts = artifacts.filter((a) => a.name.toLowerCase().includes(q) || a.japaneseName.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    if (matchedArts.length > 0) {
      results.push({ title: 'Cultural Artifacts', category: 'artifacts', items: matchedArts.map((a) => ({ id: a.id, title: `${a.name} (${a.japaneseName})`, subtitle: `${a.locationName} · ${a.description.slice(0, 60)}...`, badge: 'Artifact', payload: a })) });
    }

    const memories = await LocalStore.getMemories();
    const matchedMems = memories.filter((m) => m.canonical_fact.toLowerCase().includes(q));
    if (matchedMems.length > 0) {
      results.push({ title: 'Personal Memories', category: 'memories', items: matchedMems.map((m) => ({ id: m.id, title: m.canonical_fact, subtitle: `Recorded on ${new Date(m.occurred_at).toLocaleDateString()}`, badge: `${m.layer} memory`, payload: m })) });
    }
    return results;
  }

  static async getKnowledgeConstellation(): Promise<{ nodes: KnowledgeNode[]; categories: string[]; averageMastery: number }> {
    const nodes = await LocalStore.getKnowledgeNodes();
    const categories = Array.from(new Set(nodes.map((n) => n.category)));
    const totalMastery = nodes.reduce((acc, curr) => acc + curr.masteryLevel, 0);
    return { nodes, categories, averageMastery: nodes.length > 0 ? Math.round(totalMastery / nodes.length) : 0 };
  }

  static async getCulturalArtifacts(): Promise<CulturalArtifact[]> { return LocalStore.getCulturalArtifacts(); }

  /**
   * Updates mastery from actual learner evidence instead of a fixed +/- delta.
   * The legacy two-argument form remains supported for existing callers.
   */
  static async recordKnowledgeRecall(key: string, success: boolean, evidence?: Omit<KnowledgeRecallEvidence, 'success'>): Promise<KnowledgeNode[]> {
    const accuracy = Math.max(0, Math.min(100, evidence?.accuracy ?? (success ? 100 : 0)));
    const confidence = Math.max(0, Math.min(1, evidence?.confidence ?? (success ? 1 : 0)));
    const hintPenalty = evidence?.hintDependency === 'high' ? 0.45 : evidence?.hintDependency === 'moderate' ? 0.25 : evidence?.hintDependency === 'light' ? 0.1 : 0;
    const difficultyBonus = evidence?.difficulty === 'advanced' ? 1.25 : evidence?.difficulty === 'intermediate' ? 1.1 : 1;
    const partialFactor = evidence?.partialUnderstanding ? 0.55 : 1;

    const signal = (accuracy / 100) * (0.55 + confidence * 0.45) * (1 - hintPenalty) * partialFactor;
    const delta = success
      ? Math.max(1, Math.round((2 + signal * 6) * difficultyBonus))
      : Math.min(-1, Math.round(-1 - (1 - signal) * 3));

    return LocalStore.updateKnowledgeMastery(key, delta);
  }

  static async recordLearningEcho(conceptKey: string, conceptLabel: string, context: string): Promise<LearningEcho[]> {
    return WaveStore.recordLearningEcho(conceptKey, conceptLabel, context);
  }
  static async getLearningEchoes(): Promise<LearningEcho[]> { return WaveStore.getLearningEchoes(); }
  static async recordWorldEcho(worldEvent: string, conceptKey: string, conceptLabel: string): Promise<WorldEcho[]> { return WaveStore.recordWorldEcho(worldEvent, conceptKey, conceptLabel); }
  static async getWorldEchoes(): Promise<WorldEcho[]> { return WaveStore.getWorldEchoes(); }
  static async revealWorldEcho(id: string): Promise<WorldEcho[]> { return WaveStore.revealWorldEcho(id); }

  static async isConceptRevealed(conceptKey: string, gate = 40): Promise<boolean> {
    const nodes = await LocalStore.getKnowledgeNodes();
    const node = nodes.find((n) => n.key === conceptKey);
    return !!node && node.masteryLevel >= gate;
  }

  static async getRevealableConcepts(gate = 40): Promise<KnowledgeNode[]> {
    const nodes = await LocalStore.getKnowledgeNodes();
    return nodes.filter((n) => n.masteryLevel >= gate);
  }
}