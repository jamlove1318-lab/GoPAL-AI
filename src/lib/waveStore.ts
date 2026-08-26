import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'gopal:wave:';

function key(k: string) {
  return PREFIX + k;
}

async function get<T>(k: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key(k));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function set<T>(k: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key(k), JSON.stringify(value));
  } catch (e) {
    console.warn('waveStore save error for', k, e);
  }
}

/* ============================================================
 * Wave 4W: LEARNING ECHOES
 * A learned concept quietly reappears later in another context.
 * ============================================================ */
export interface LearningEcho {
  id: string;
  conceptKey: string;
  conceptLabel: string;
  firstSeenAt: string;
  echoCount: number;
  lastEchoAt: string | null;
  contexts: string[];
}

/* ============================================================
 * Wave 4X: WORLD ECHOES
 * A world event creates future learning context.
 * ============================================================ */
export interface WorldEcho {
  id: string;
  worldEvent: string;
  unlockedConceptKey: string;
  unlockedConceptLabel: string;
  discoveredAt: string;
  revealed: boolean;
}

/* ============================================================
 * Wave 4G: EXPERIENCE PLAYLISTS
 * ============================================================ */
export interface ExperiencePlaylist {
  id: string;
  title: string;
  userCreated: boolean;
  steps: { label: string; intent: string; durationMinutes: number }[];
}

/* ============================================================
 * Wave 4V: RETURN SIGNATURE
 * Adaptive arrival based on explicit preferences + history.
 * ============================================================ */
export interface ReturnSignature {
  prefersResumeFirst: boolean;
  prefersExploreFirst: boolean;
  prefersCalmReturn: boolean;
  lastMode: 'resume' | 'explore' | 'calm' | 'study';
  samples: number;
}

/* ============================================================
 * Wave 4E: LIVING LIBRARY
 * Curated personal library of saved learning artifacts.
 * ============================================================ */
export interface LibraryItem {
  id: string;
  kind: 'lesson' | 'explanation' | 'conversation' | 'pronunciation' | 'story' | 'culture' | 'playlist' | 'creation' | 'bookmark';
  title: string;
  subtitle: string;
  sourceRef?: string;
  addedAt: string;
  shelf: 'recent' | 'continue' | 'favorites' | 'revisit' | 'by_world' | 'by_skill';
}

/* ============================================================
 * Wave 4H: WORLD EDITORIAL MOMENTS
 * Curated collections assembled from verified content.
 * ============================================================ */
export interface EditorialMoment {
  id: string;
  title: string;
  theme: string;
  items: { label: string; detail: string }[];
  generatedAt: string;
}

/* ============================================================
 * Wave 4AA: PERSONAL TRADITIONS
 * Voluntary recurring rituals chosen by the learner.
 * ============================================================ */
export interface PersonalTradition {
  id: string;
  title: string;
  cadence: 'daily' | 'weekly' | 'monthly';
  description: string;
  enabled: boolean;
  lastObservedAt: string | null;
}

/* ============================================================
 * Wave 5Y: MEMORY THREADS
 * A meaningful theme connecting events across time.
 * ============================================================ */
export interface MemoryThread {
  id: string;
  title: string;
  theme: string;
  eventRefs: string[];
  createdAt: string;
}

/* ============================================================
 * Wave 5Z: EXPERIENCE MEMORY DISTILLATION
 * ============================================================ */
export interface DistilledMemory {
  id: string;
  sourceEventId: string;
  summary: string;
  retainedAt: string;
  rank: number;
}

/* ============================================================
 * Wave 5X: LEARNING SOUVENIRS
 * ============================================================ */
export interface LearningSouvenir {
  id: string;
  title: string;
  kind: 'postcard' | 'quote_card' | 'artifact' | 'photo' | 'memory';
  detail: string;
  earnedAt: string;
}

/* ============================================================
 * Wave 5Q: DECISION ECHOES
 * ============================================================ */
export interface DecisionEcho {
  id: string;
  decision: string;
  acknowledgedIn: string[];
  madeAt: string;
}

/* ============================================================
 * Wave 5C: STORY LAYERS IN SPACE
 * ============================================================ */
export interface StoryLayerState {
  locationKey: string;
  layer1_identity: string;
  layer2_history: string;
  layer3_activeStory: string;
  layer4_learnerHistory: string;
}

// Wave 3: Living Object Contract — objects that hold state and remember the learner.
export interface LivingObject {
  id: string;
  name: string;
  kind: 'plant' | 'companion' | 'artifact';
  growth: number; // 0..100
  memory: string[]; // things it "remembers" about the learner
  lastTickAt: number;
}

export const SEED_ECHOES: LearningEcho[] = [];
export const SEED_WORLD_ECHOES: WorldEcho[] = [];
export const SEED_PLAYLISTS: ExperiencePlaylist[] = [
  {
    id: 'pl-morning-jp',
    title: 'My Morning Japanese',
    userCreated: false,
    steps: [
      { label: 'Warm-up greeting with Cassidy', intent: 'conversation', durationMinutes: 2 },
      { label: 'Listen to a café scene', intent: 'relax', durationMinutes: 2 },
      { label: 'Short review of yesterday’s words', intent: 'focus', durationMinutes: 1 },
    ],
  },
  {
    id: 'pl-travel-5',
    title: 'Five-Minute Travel Practice',
    userCreated: false,
    steps: [
      { label: 'Order practice at Café Komorebi', intent: 'conversation', durationMinutes: 3 },
      { label: 'Station vocabulary flash', intent: 'focus', durationMinutes: 2 },
    ],
  },
];
export const SEED_RETURN_SIGNATURE: ReturnSignature = {
  prefersResumeFirst: false,
  prefersExploreFirst: false,
  prefersCalmReturn: false,
  lastMode: 'study',
  samples: 0,
};
export const SEED_LIBRARY: LibraryItem[] = [];
export const SEED_EDITORIAL: EditorialMoment[] = [
  {
    id: 'ed-rainy-walk',
    title: 'A Rainy-Day Language Walk',
    theme: 'emerald',
    items: [
      { label: 'Shizuka (静か) — quiet', detail: 'Used when describing the library or garden.' },
      { label: 'Ame (雨) — rain', detail: 'Common in seasonal greetings.' },
    ],
    generatedAt: new Date().toISOString(),
  },
];
export const SEED_TRADITIONS: PersonalTradition[] = [
  {
    id: 'tr-sunday-cafe',
    title: 'Sunday Cultural Café',
    cadence: 'weekly',
    description: 'A relaxed café conversation every Sunday with Barista Ren.',
    enabled: true,
    lastObservedAt: null,
  },
];
export const SEED_THREADS: MemoryThread[] = [];
export const SEED_DISTILLED: DistilledMemory[] = [];
export const SEED_SOUVENIRS: LearningSouvenir[] = [
  {
    id: 'sv-1',
    title: 'First Matcha Morning',
    kind: 'postcard',
    detail: 'Your first confident order with Ren at Café Komorebi.',
    earnedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];
export const SEED_DECISIONS: DecisionEcho[] = [];
export const SEED_STORY_LAYERS: StoryLayerState[] = [
  {
    locationKey: 'cozy_cafe',
    layer1_identity: 'Café Komorebi — a warm neighborhood coffee and matcha house.',
    layer2_history: 'Founded by Ren’s grandmother; the cedar counter is over 60 years old.',
    layer3_activeStory: 'Ren is testing a new seasonal matcha blend.',
    layer4_learnerHistory: 'You placed your first full order here without hints.',
  },
];

const SEED_LIVING_OBJECTS: LivingObject[] = [
  {
    id: 'living-bonsai',
    name: 'The Study Bonsai',
    kind: 'plant',
    growth: 18,
    memory: ['Watered on the day the learner finished their first scenario.', 'Heard a lot of café practice.'],
    lastTickAt: Date.now(),
  },
  {
    id: 'living-radio',
    name: 'The Study Radio',
    kind: 'artifact',
    growth: 40,
    memory: ['Plays softer music after long sessions.', 'Learned the learner prefers quiet mornings.'],
    lastTickAt: Date.now(),
  },
];

export const WaveStore = {
  // Learning Echoes
  async getLearningEchoes(): Promise<LearningEcho[]> {
    return get<LearningEcho[]>('learning_echoes', SEED_ECHOES);
  },
  async recordLearningEcho(conceptKey: string, conceptLabel: string, context: string): Promise<LearningEcho[]> {
    const list = await this.getLearningEchoes();
    const existing = list.find((e) => e.conceptKey === conceptKey);
    const now = new Date().toISOString();
    let updated: LearningEcho[];
    if (existing) {
      const contexts = existing.contexts.includes(context) ? existing.contexts : [...existing.contexts, context];
      updated = list.map((e) =>
        e.conceptKey === conceptKey ? { ...e, echoCount: e.echoCount + 1, lastEchoAt: now, contexts } : e
      );
    } else {
      updated = [
        ...list,
        {
          id: 'le-' + Date.now(),
          conceptKey,
          conceptLabel,
          firstSeenAt: now,
          echoCount: 1,
          lastEchoAt: now,
          contexts: [context],
        },
      ];
    }
    await set('learning_echoes', updated);
    return updated;
  },

  // World Echoes
  async getWorldEchoes(): Promise<WorldEcho[]> {
    return get<WorldEcho[]>('world_echoes', SEED_WORLD_ECHOES);
  },
  async recordWorldEcho(worldEvent: string, conceptKey: string, conceptLabel: string): Promise<WorldEcho[]> {
    const list = await this.getWorldEchoes();
    const now = new Date().toISOString();
    const updated = [
      ...list,
      { id: 'we-' + Date.now(), worldEvent, unlockedConceptKey: conceptKey, unlockedConceptLabel: conceptLabel, discoveredAt: now, revealed: false },
    ];
    await set('world_echoes', updated);
    return updated;
  },
  async revealWorldEcho(id: string): Promise<WorldEcho[]> {
    const list = await this.getWorldEchoes();
    const updated = list.map((e) => (e.id === id ? { ...e, revealed: true } : e));
    await set('world_echoes', updated);
    return updated;
  },

  // Experience Playlists
  async getPlaylists(): Promise<ExperiencePlaylist[]> {
    return get<ExperiencePlaylist[]>('playlists', SEED_PLAYLISTS);
  },
  async addPlaylist(p: Omit<ExperiencePlaylist, 'id'>): Promise<ExperiencePlaylist[]> {
    const list = await this.getPlaylists();
    const updated = [{ ...p, id: 'pl-' + Date.now() }, ...list];
    await set('playlists', updated);
    return updated;
  },

  // Return Signature
  async getReturnSignature(): Promise<ReturnSignature> {
    return get<ReturnSignature>('return_signature', SEED_RETURN_SIGNATURE);
  },
  async recordReturn(mode: ReturnSignature['lastMode']): Promise<ReturnSignature> {
    const sig = await this.getReturnSignature();
    const samples = sig.samples + 1;
    const next: ReturnSignature = {
      prefersResumeFirst: sig.prefersResumeFirst || mode === 'resume',
      prefersExploreFirst: sig.prefersExploreFirst || mode === 'explore',
      prefersCalmReturn: sig.prefersCalmReturn || mode === 'calm',
      lastMode: mode,
      samples,
    };
    await set('return_signature', next);
    return next;
  },

  // Living Library
  async getLibrary(): Promise<LibraryItem[]> {
    return get<LibraryItem[]>('library', SEED_LIBRARY);
  },
  async addLibraryItem(item: Omit<LibraryItem, 'id' | 'addedAt'>): Promise<LibraryItem[]> {
    const list = await this.getLibrary();
    const updated = [{ ...item, id: 'lib-' + Date.now(), addedAt: new Date().toISOString() }, ...list];
    await set('library', updated);
    return updated;
  },
  async removeLibraryItem(id: string): Promise<LibraryItem[]> {
    const list = await this.getLibrary();
    const updated = list.filter((i) => i.id !== id);
    await set('library', updated);
    return updated;
  },

  // Editorial Moments
  async getEditorialMoments(): Promise<EditorialMoment[]> {
    return get<EditorialMoment[]>('editorial', SEED_EDITORIAL);
  },

  // Personal Traditions
  async getTraditions(): Promise<PersonalTradition[]> {
    return get<PersonalTradition[]>('traditions', SEED_TRADITIONS);
  },
  async toggleTradition(id: string): Promise<PersonalTradition[]> {
    const list = await this.getTraditions();
    const updated = list.map((t) =>
      t.id === id ? { ...t, enabled: !t.enabled, lastObservedAt: t.enabled ? t.lastObservedAt : new Date().toISOString() } : t
    );
    await set('traditions', updated);
    return updated;
  },

  // Memory Threads
  async getThreads(): Promise<MemoryThread[]> {
    return get<MemoryThread[]>('threads', SEED_THREADS);
  },
  async addThread(t: Omit<MemoryThread, 'id' | 'createdAt'>): Promise<MemoryThread[]> {
    const list = await this.getThreads();
    const updated = [{ ...t, id: 'th-' + Date.now(), createdAt: new Date().toISOString() }, ...list];
    await set('threads', updated);
    return updated;
  },

  // Distilled Memory
  async getDistilled(): Promise<DistilledMemory[]> {
    return get<DistilledMemory[]>('distilled', SEED_DISTILLED);
  },
  async addDistilled(d: Omit<DistilledMemory, 'id' | 'retainedAt'>): Promise<DistilledMemory[]> {
    const list = await this.getDistilled();
    const updated = [{ ...d, id: 'dm-' + Date.now(), retainedAt: new Date().toISOString() }, ...list];
    await set('distilled', updated);
    return updated;
  },

  // Souvenirs
  async getSouvenirs(): Promise<LearningSouvenir[]> {
    return get<LearningSouvenir[]>('souvenirs', SEED_SOUVENIRS);
  },
  async addSouvenir(s: Omit<LearningSouvenir, 'id' | 'earnedAt'>): Promise<LearningSouvenir[]> {
    const list = await this.getSouvenirs();
    const updated = [{ ...s, id: 'sv-' + Date.now(), earnedAt: new Date().toISOString() }, ...list];
    await set('souvenirs', updated);
    return updated;
  },

  // Decision Echoes
  async getDecisions(): Promise<DecisionEcho[]> {
    return get<DecisionEcho[]>('decisions', SEED_DECISIONS);
  },
  async recordDecision(decision: string): Promise<DecisionEcho[]> {
    const list = await this.getDecisions();
    const updated = [{ id: 'de-' + Date.now(), decision, acknowledgedIn: [], madeAt: new Date().toISOString() }, ...list];
    await set('decisions', updated);
    return updated;
  },
  async acknowledgeDecision(id: string, reference: string): Promise<DecisionEcho[]> {
    const list = await this.getDecisions();
    const updated = list.map((d) =>
      d.id === id ? { ...d, acknowledgedIn: d.acknowledgedIn.includes(reference) ? d.acknowledgedIn : [...d.acknowledgedIn, reference] } : d
    );
    await set('decisions', updated);
    return updated;
  },

  // Story Layers
  async getStoryLayers(): Promise<StoryLayerState[]> {
    return get<StoryLayerState[]>('story_layers', SEED_STORY_LAYERS);
  },
  async getStoryLayer(locationKey: string): Promise<StoryLayerState | null> {
    const list = await this.getStoryLayers();
    return list.find((l) => l.locationKey === locationKey) ?? null;
  },
  async saveStoryLayer(layer: StoryLayerState): Promise<StoryLayerState[]> {
    const list = await this.getStoryLayers();
    const exists = list.some((l) => l.locationKey === layer.locationKey);
    const updated = exists ? list.map((l) => (l.locationKey === layer.locationKey ? layer : l)) : [...list, layer];
    await set('story_layers', updated);
    return updated;
  },

  // Living Object Contract
  async getLivingObjects(): Promise<LivingObject[]> {
    return get<LivingObject[]>('living_objects', SEED_LIVING_OBJECTS);
  },
  async tickLivingObject(id: string, note?: string): Promise<LivingObject[]> {
    const list = await this.getLivingObjects();
    const updated = list.map((o) => {
      if (o.id !== id) return o;
      const growth = Math.min(100, o.growth + 1);
      const memory = note ? [...o.memory, note].slice(-10) : o.memory;
      return { ...o, growth, memory, lastTickAt: Date.now() };
    });
    await set('living_objects', updated);
    return updated;
  },
};
