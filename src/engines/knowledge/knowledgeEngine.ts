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

export class KnowledgeEngine {
  /**
   * Universal Search "Ask / Find / Go" (Blueprint Wave 4J, 4U)
   */
  static async searchAll(query: string): Promise<SearchResultCategory[]> {
    if (!query.trim()) {
      return [];
    }

    const q = query.toLowerCase().trim();
    const results: SearchResultCategory[] = [];

    // 1. Search Knowledge Nodes (Vocabulary & Grammar)
    const knowledgeNodes = await LocalStore.getKnowledgeNodes();
    const matchedNodes = knowledgeNodes.filter(
      (n) =>
        n.term.toLowerCase().includes(q) ||
        n.reading.toLowerCase().includes(q) ||
        n.meaning.toLowerCase().includes(q)
    );

    if (matchedNodes.length > 0) {
      results.push({
        title: 'Vocabulary & Concepts',
        category: 'knowledge',
        items: matchedNodes.map((n) => ({
          id: n.id,
          title: `${n.term} (${n.reading})`,
          subtitle: `${n.meaning} · Mastery: ${n.masteryLevel}%`,
          badge: n.category,
          payload: n,
        })),
      });
    }

    // 2. Search Locations
    const locations = await LocalStore.getLocations();
    const matchedLocs = locations.filter(
      (l) => l.name.toLowerCase().includes(q) || l.key.toLowerCase().includes(q)
    );

    if (matchedLocs.length > 0) {
      results.push({
        title: 'World Locations',
        category: 'locations',
        items: matchedLocs.map((l) => ({
          id: l.id,
          title: l.name,
          subtitle: `Familiarity: ${l.familiarity_stage.toUpperCase()}`,
          badge: 'World',
          payload: l,
        })),
      });
    }

    // 3. Search Cultural Artifacts
    const artifacts = await LocalStore.getCulturalArtifacts();
    const matchedArts = artifacts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.japaneseName.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );

    if (matchedArts.length > 0) {
      results.push({
        title: 'Cultural Artifacts',
        category: 'artifacts',
        items: matchedArts.map((a) => ({
          id: a.id,
          title: `${a.name} (${a.japaneseName})`,
          subtitle: `${a.locationName} · ${a.description.slice(0, 60)}...`,
          badge: 'Artifact',
          payload: a,
        })),
      });
    }

    // 4. Search Memories
    const memories = await LocalStore.getMemories();
    const matchedMems = memories.filter((m) => m.canonical_fact.toLowerCase().includes(q));

    if (matchedMems.length > 0) {
      results.push({
        title: 'Personal Memories',
        category: 'memories',
        items: matchedMems.map((m) => ({
          id: m.id,
          title: m.canonical_fact,
          subtitle: `Recorded on ${new Date(m.occurred_at).toLocaleDateString()}`,
          badge: `${m.layer} memory`,
          payload: m,
        })),
      });
    }

    return results;
  }

  /**
   * Returns Knowledge Constellation network for visual exploration (Blueprint #99, #159)
   */
  static async getKnowledgeConstellation(): Promise<{
    nodes: KnowledgeNode[];
    categories: string[];
    averageMastery: number;
  }> {
    const nodes = await LocalStore.getKnowledgeNodes();
    const categories = Array.from(new Set(nodes.map((n) => n.category)));
    const totalMastery = nodes.reduce((acc, curr) => acc + curr.masteryLevel, 0);
    const averageMastery = nodes.length > 0 ? Math.round(totalMastery / nodes.length) : 0;

    return {
      nodes,
      categories,
      averageMastery,
    };
  }

  /**
   * Retrieves Cultural Artifacts with Wonder Prompts (Blueprint Wave 5E, 5F)
   */
  static async getCulturalArtifacts(): Promise<CulturalArtifact[]> {
    return LocalStore.getCulturalArtifacts();
  }

  /**
   * Increments mastery and checks for learning echoes (Blueprint Wave 4W)
   */
  static async recordKnowledgeRecall(key: string, success: boolean): Promise<KnowledgeNode[]> {
    const delta = success ? 5 : -2;
    return LocalStore.updateKnowledgeMastery(key, delta);
  }

  /**
   * Learning Echoes (Wave 4W): schedule a quiet contextual reappearance of a concept.
   * The engine records the echo; the UI may later surface it in a different context.
   */
  static async recordLearningEcho(conceptKey: string, conceptLabel: string, context: string): Promise<LearningEcho[]> {
    return WaveStore.recordLearningEcho(conceptKey, conceptLabel, context);
  }

  static async getLearningEchoes(): Promise<LearningEcho[]> {
    return WaveStore.getLearningEchoes();
  }

  /**
   * World Echoes (Wave 4X): a world event unlocks future learning context.
   */
  static async recordWorldEcho(worldEvent: string, conceptKey: string, conceptLabel: string): Promise<WorldEcho[]> {
    return WaveStore.recordWorldEcho(worldEvent, conceptKey, conceptLabel);
  }

  static async getWorldEchoes(): Promise<WorldEcho[]> {
    return WaveStore.getWorldEchoes();
  }

  static async revealWorldEcho(id: string): Promise<WorldEcho[]> {
    return WaveStore.revealWorldEcho(id);
  }

  /**
   * Knowledge-Gated Progressive Revelation (Wave 5E/5Y): a concept becomes
   * readable/visible only once verified mastery crosses a gate. This is the
   * engine-owned rule; "learning literally reveals more of the world."
   */
  static async isConceptRevealed(conceptKey: string, gate = 40): Promise<boolean> {
    const nodes = await LocalStore.getKnowledgeNodes();
    const node = nodes.find((n) => n.key === conceptKey);
    if (!node) return false;
    return node.masteryLevel >= gate;
  }

  static async getRevealableConcepts(gate = 40): Promise<KnowledgeNode[]> {
    const nodes = await LocalStore.getKnowledgeNodes();
    return nodes.filter((n) => n.masteryLevel >= gate);
  }
}
