import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  WorldsRow,
  LocationsRow,
  WorldStateRow,
  CharactersRow,
  CharacterStateRow,
  CharacterRelationshipsRow,
  MemoriesRow,
  JourneyEventsRow,
  EnvironmentObjectsRow,
  KnowledgeItemsRow,
  KnowledgeMasteryRow,
  ProfilesRow,
  Json,
} from '../types/database';
import type { Mood, Season, TimeOfDay } from './types';
import { resolveSeason, resolveTimeOfDay } from './time';

const STORE_KEY_PREFIX = 'gopal:store:';

export interface PostcardItem {
  id: string;
  title: string;
  locationKey: string;
  locationName: string;
  unlockedAt: string;
  cassidyNote: string;
  imageTheme: string;
}

export interface ReviewStory {
  id: string;
  title: string;
  location: string;
  content: string;
  targetVocab: string[];
  grammarFocus: string;
  completed: boolean;
}

export interface StudyObjectState {
  plantStage: number; // 1 to 5
  plantWaterCount: number;
  lastWateredAt: string | null;
  activeRadioStation: string; // 'lofi' | 'nature' | 'cafe' | 'zen'
  isRadioPlaying: boolean;
  notes: { id: string; term: string; note: string; createdAt: string }[];
}

export interface SessionBookmark {
  id: string;
  activityType: 'scenario' | 'study' | 'exploration' | 'culture';
  locationKey: string;
  locationName: string;
  scenarioKey?: string;
  title: string;
  promptSnippet: string;
  savedAt: string;
}

export interface CustomCreation {
  id: string;
  type: 'postcard' | 'phrase_card' | 'memory_board' | 'comic_strip';
  title: string;
  subtitle: string;
  content: string;
  visualTheme: string;
  tags: string[];
  createdAt: string;
}

export interface TimeCapsule {
  id: string;
  message: string;
  targetUnlockDate: string;
  unlocked: boolean;
  theme: string;
  createdAt: string;
}

export interface WonderPromptData {
  question: string;
  hint1: string;
  hint2: string;
  solution: string;
  culturalFact: string;
}

export interface CulturalArtifact {
  id: string;
  key: string;
  name: string;
  locationKey: string;
  locationName: string;
  japaneseName: string;
  romaji: string;
  description: string;
  wonderPrompt: WonderPromptData;
  unlocked: boolean;
  discoveredAt: string | null;
}

export interface KnowledgeNode {
  id: string;
  key: string;
  term: string;
  reading: string;
  meaning: string;
  category: 'beverage' | 'greeting' | 'environment' | 'reading' | 'culture' | 'action';
  relatedKeys: string[];
  masteryLevel: number; // 0 - 100
  locationKey: string;
  examples: string[];
}

export interface RevisitRecord {
  count: number;
  lastVisitedAt: string;
}

export const SEED_WORLD: WorldsRow = {
  id: 'world-emerald-valley',
  canonical_key: 'emerald_valley',
  display_name: 'Emerald Valley & Old Tokyo',
  curriculum_ref: 'curriculum-jp-foundations',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
};

export const SEED_LOCATIONS: LocationsRow[] = [
  {
    id: 'loc-study-room',
    world_id: 'world-emerald-valley',
    key: 'study_room',
    name: 'The Sunlit Study',
    familiarity_stage: 'personal',
    unlocked_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'loc-cozy-cafe',
    world_id: 'world-emerald-valley',
    key: 'cozy_cafe',
    name: 'Café Komorebi',
    familiarity_stage: 'familiar',
    unlocked_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'loc-whispering-library',
    world_id: 'world-emerald-valley',
    key: 'whispering_library',
    name: 'The Whispering Library',
    familiarity_stage: 'discovered',
    unlocked_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'loc-lantern-market',
    world_id: 'world-emerald-valley',
    key: 'lantern_market',
    name: 'Lantern Night Market',
    familiarity_stage: 'discovered',
    unlocked_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'loc-zen-garden',
    world_id: 'world-emerald-valley',
    key: 'zen_garden',
    name: 'Moonlit Zen Garden',
    familiarity_stage: 'unknown',
    unlocked_at: null,
  },
];

export const SEED_CASSIDY: CharactersRow = {
  id: 'char-cassidy-01',
  key: 'cassidy',
  role: 'Companion & Guide',
  personality: { warmth: 95, curiosity: 90, patience: 95 },
  dialogue_style: 'encouraging, warm, culturally nuanced',
  memory_access_policy: { access: 'full_shared' },
  preferred_locations: ['loc-study-room', 'loc-cozy-cafe'],
};

export const SEED_CASSIDY_STATE: CharacterStateRow = {
  character_id: 'char-cassidy-01',
  mood: 'curious',
  energy: 85,
  current_activity: 'Arranging fresh cultural postcards by the window',
  routine_schedule: {
    morning: 'Morning tea & reflection',
    afternoon: 'Visiting Café Komorebi',
    evening: 'Tending Bonsai plant',
    night: 'Moonlit stargazing',
  },
  updated_at: new Date().toISOString(),
};

export const SEED_CASSIDY_RELATIONSHIP: CharacterRelationshipsRow = {
  user_id: 'local-explorer-user',
  character_id: 'char-cassidy-01',
  trust: 85,
  friendship: 90,
  familiarity: 80,
  shared_history: { summary: 'Guided your first 10 dialogues and explored Café Komorebi together.' },
  updated_at: new Date().toISOString(),
};

export const SEED_MEMORIES: MemoriesRow[] = [
  {
    id: 'mem-1',
    user_id: 'local-explorer-user',
    layer: 'character',
    canonical_fact: 'Met Cassidy under the sunlit cedar tree in Emerald Valley on Day 1.',
    occurred_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    source_event_id: null,
  },
  {
    id: 'mem-2',
    user_id: 'local-explorer-user',
    layer: 'learning',
    canonical_fact: 'Learned the term "Komorebi" (sunlight filtering through trees) at Café Komorebi.',
    occurred_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    source_event_id: null,
  },
  {
    id: 'mem-3',
    user_id: 'local-explorer-user',
    layer: 'world',
    canonical_fact: 'Explored the Whispering Library and read ancient folklore scrolls with Librarian Emi.',
    occurred_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    source_event_id: null,
  },
  {
    id: 'mem-4',
    user_id: 'local-explorer-user',
    layer: 'story',
    canonical_fact: 'Completed Chapter 1: First Whispers of Emerald Valley with high naturalness score.',
    occurred_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    source_event_id: null,
  },
];

export const SEED_POSTCARDS: PostcardItem[] = [
  {
    id: 'post-1',
    title: 'Warm Matcha Morning',
    locationKey: 'cozy_cafe',
    locationName: 'Café Komorebi',
    unlockedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    cassidyNote: 'Your first polite order with Barista Ren was smooth and confident!',
    imageTheme: 'emerald',
  },
  {
    id: 'post-2',
    title: 'The Whispering Scrolls',
    locationKey: 'whispering_library',
    locationName: 'The Whispering Library',
    unlockedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    cassidyNote: 'Librarian Emi was impressed by how quickly you picked up greeting idioms.',
    imageTheme: 'indigo',
  },
];

export const SEED_JOURNEY_EVENTS: JourneyEventsRow[] = [
  {
    id: 'jrn-1',
    user_id: 'local-explorer-user',
    producer: 'world_engine',
    type: 'world:arrival',
    payload: { worldName: 'Emerald Valley' },
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'jrn-2',
    user_id: 'local-explorer-user',
    producer: 'tutor_engine',
    type: 'scenario:completed',
    payload: { scenario: 'scen-cafe-order', score: 94 },
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'jrn-3',
    user_id: 'local-explorer-user',
    producer: 'quest_engine',
    type: 'quest:completed',
    payload: { questTitle: 'Lantern Market Pass' },
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const SEED_REVIEW_STORIES: ReviewStory[] = [
  {
    id: 'rev-1',
    title: 'Rainy Afternoon at Café Komorebi',
    location: 'Café Komorebi',
    content:
      'The rain taps softly against the glass. You step inside, shake your umbrella, and walk up to Barista Ren. The aroma of roasted beans fills the room.',
    targetVocab: ['Kore o kudasai', 'Arigatou gozaimasu', 'Komorebi'],
    grammarFocus: 'Polite requests in public venues',
    completed: true,
  },
  {
    id: 'rev-2',
    title: 'The Whispering Scrolls of Kyoto',
    location: 'The Whispering Library',
    content:
      'Librarian Emi unrolls a map of ancient trails. She whispers an encouraging greeting and hands you a scroll with cultural idioms.',
    targetVocab: ['Otsukaresama deshita', 'Itadakimasu'],
    grammarFocus: 'Contextual appreciation & daily rituals',
    completed: false,
  },
];

export const SEED_BOOKMARK: SessionBookmark = {
  id: 'bm-initial',
  activityType: 'scenario',
  locationKey: 'cozy_cafe',
  locationName: 'Café Komorebi',
  scenarioKey: 'scen-cafe-order',
  title: 'Ordering Matcha at Café Komorebi',
  promptSnippet: 'Ren asks if you would like hot or iced matcha.',
  savedAt: new Date().toISOString(),
};

export const SEED_CREATIONS: CustomCreation[] = [
  {
    id: 'cr-1',
    type: 'postcard',
    title: 'Morning Sun at Komorebi',
    subtitle: 'Created during Japanese Foundations Chapter 1',
    content: 'I ordered a warm matcha latte and exchanged morning greetings with Ren!',
    visualTheme: 'emerald',
    tags: ['Matcha', 'Café', 'Morning'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'cr-2',
    type: 'phrase_card',
    title: 'Polite Café Phrases',
    subtitle: 'Curated Study Notes with Cassidy',
    content: 'Sumimasen (Excuse me) · O-kudasai (Please give me) · Arigatou gozaimasu (Thank you very much)',
    visualTheme: 'indigo',
    tags: ['Grammar', 'Phrases'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const SEED_TIME_CAPSULES: TimeCapsule[] = [
  {
    id: 'tc-1',
    message:
      'My first week in Emerald Valley: Today Cassidy and I learned our first 10 Japanese phrases. In six months, I want to carry out a full natural dialogue with Ren and Emi without checking hints!',
    targetUnlockDate: new Date(Date.now() + 90 * 86400000).toISOString(),
    unlocked: false,
    theme: 'emerald',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const SEED_CULTURAL_ARTIFACTS: CulturalArtifact[] = [
  {
    id: 'art-1',
    key: 'matcha_whisk',
    name: 'Artisan Bamboo Whisk (Chasen)',
    locationKey: 'cozy_cafe',
    locationName: 'Café Komorebi',
    japaneseName: '茶筅',
    romaji: 'Chasen',
    description:
      'A traditional whisk carved from a single piece of bamboo, used to froth powdered matcha into a creamy green foam.',
    wonderPrompt: {
      question: 'Why do you think the bamboo tines are curled at the very tip?',
      hint1: 'Notice how the foam gets velvety smooth when whisked in a W pattern.',
      hint2: 'The curvature prevents scratching the handmade ceramic bowl (Chawan).',
      solution:
        'The fine curled tines aerate the tea and create micro-foam without damaging the delicate ceramic bowl.',
      culturalFact:
        'In Japanese tea ceremony (Chado), whisks are crafted by master artisans who split bamboo into up to 120 individual delicate bristles.',
    },
    unlocked: true,
    discoveredAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'art-2',
    key: 'wooden_ema',
    name: 'Votive Wish Plaque (Ema)',
    locationKey: 'zen_garden',
    locationName: 'Moonlit Zen Garden',
    japaneseName: '絵馬',
    romaji: 'Ema',
    description:
      'A small wooden plaque where visitors write personal prayers, learning goals, or hopes and hang them under cedar eaves.',
    wonderPrompt: {
      question: 'What do the two characters "絵" (picture) and "馬" (horse) signify in ancient tradition?',
      hint1: 'In ancient times, horses were considered sacred messengers of the kami.',
      hint2: 'People originally donated real horses, which later evolved into wooden pictures.',
      solution:
        'Ema literally means "Picture Horse"—substituting wooden painted plaques for sacred living horses.',
      culturalFact:
        'Learners and students commonly write their examination aspirations on Ema plaques at educational shrines throughout Japan.',
    },
    unlocked: true,
    discoveredAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'art-3',
    key: 'festival_lantern',
    name: 'Paper Festival Lantern (Chōchin)',
    locationKey: 'lantern_market',
    locationName: 'Lantern Night Market',
    japaneseName: '提灯',
    romaji: 'Chōchin',
    description:
      'A collapsible washi-paper lantern wrapped with bamboo rings, illuminating evening street stalls with a warm golden glow.',
    wonderPrompt: {
      question: 'What practical design innovation allowed travelers in the Edo period to carry lanterns in their pockets?',
      hint1: 'Look at the spiral bamboo ribs.',
      hint2: 'The paper folds like an accordion when not in use.',
      solution:
        'Chōchin collapse flat like an accordion, making them lightweight and portable for night journeys.',
      culturalFact:
        'Red lanterns (Aka-chōchin) hung outside traditional taverns signal welcoming hospitality to evening travelers.',
    },
    unlocked: true,
    discoveredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'art-4',
    key: 'ancient_scroll',
    name: 'Picture Scroll (Emakimono)',
    locationKey: 'whispering_library',
    locationName: 'The Whispering Library',
    japaneseName: '絵巻物',
    romaji: 'Emakimono',
    description:
      'An illuminated narrative scroll combining calligraphy and paintings, read horizontally from right to left.',
    wonderPrompt: {
      question: 'Why are traditional Japanese scrolls read from right to left in continuous sequence?',
      hint1: 'Notice how the left hand unrolls new scenes as the right hand rolls up past scenes.',
      hint2: 'It creates a cinematic time-lapse progression.',
      solution:
        'Reading right-to-left unrolls time naturally, revealing the visual narrative like an early animation strip.',
      culturalFact:
        'Emakimono created in the 12th century, such as Chōjū-giga, are considered the historic ancestors of modern manga.',
    },
    unlocked: true,
    discoveredAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

export const SEED_KNOWLEDGE_NODES: KnowledgeNode[] = [
  {
    id: 'kn-1',
    key: 'matcha',
    term: '抹茶',
    reading: 'まっちゃ (Matcha)',
    meaning: 'Finely ground powdered green tea',
    category: 'beverage',
    relatedKeys: ['ocha', 'sumimasen'],
    masteryLevel: 90,
    locationKey: 'cozy_cafe',
    examples: ['Matcha latte o kudasai (A matcha latte please)'],
  },
  {
    id: 'kn-2',
    key: 'ocha',
    term: 'お茶',
    reading: 'おちゃ (Ocha)',
    meaning: 'Tea / Japanese green tea',
    category: 'beverage',
    relatedKeys: ['matcha'],
    masteryLevel: 95,
    locationKey: 'cozy_cafe',
    examples: ['Ocha o nomimasu (I drink tea)'],
  },
  {
    id: 'kn-3',
    key: 'sumimasen',
    term: 'すみません',
    reading: 'すみません (Sumimasen)',
    meaning: 'Excuse me / Sorry / Thank you for your trouble',
    category: 'greeting',
    relatedKeys: ['arigatou', 'matcha'],
    masteryLevel: 85,
    locationKey: 'cozy_cafe',
    examples: ['Sumimasen, kore o kudasai (Excuse me, this please)'],
  },
  {
    id: 'kn-4',
    key: 'arigatou',
    term: 'ありがとう',
    reading: 'ありがとう (Arigatou)',
    meaning: 'Thank you',
    category: 'greeting',
    relatedKeys: ['sumimasen'],
    masteryLevel: 100,
    locationKey: 'cozy_cafe',
    examples: ['Doumo arigatou gozaimasu (Thank you very much)'],
  },
  {
    id: 'kn-5',
    key: 'komorebi',
    term: '木漏れ日',
    reading: 'こもれび (Komorebi)',
    meaning: 'Sunlight filtering through trees',
    category: 'environment',
    relatedKeys: ['shizuka'],
    masteryLevel: 80,
    locationKey: 'zen_garden',
    examples: ['Komorebi ga kirei desu (The filtered sunlight is beautiful)'],
  },
  {
    id: 'kn-6',
    key: 'shizuka',
    term: '静か',
    reading: 'しずか (Shizuka)',
    meaning: 'Quiet / Peaceful / Calm',
    category: 'environment',
    relatedKeys: ['komorebi', 'hon'],
    masteryLevel: 75,
    locationKey: 'whispering_library',
    examples: ['Koko wa totemo shizuka desu (Here is very peaceful)'],
  },
  {
    id: 'kn-7',
    key: 'hon',
    term: '本',
    reading: 'ほん (Hon)',
    meaning: 'Book',
    category: 'reading',
    relatedKeys: ['shizuka'],
    masteryLevel: 90,
    locationKey: 'whispering_library',
    examples: ['Hon o yomimasu (I read a book)'],
  },
  {
    id: 'kn-8',
    key: 'lantern',
    term: '提灯',
    reading: 'ちょうちん (Chouchin)',
    meaning: 'Paper festival lantern',
    category: 'culture',
    relatedKeys: ['arigatou'],
    masteryLevel: 70,
    locationKey: 'lantern_market',
    examples: ['Aka-chouchin ga narandeimasu (Red lanterns are lined up)'],
  },
];

export class LocalStore {
  public static async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(STORE_KEY_PREFIX + key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  public static async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(STORE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStore save error for key:', key, e);
    }
  }

  // World State
  static async getWorldState(): Promise<WorldStateRow> {
    const defaultState: WorldStateRow = {
      user_id: 'local-explorer-user',
      world_id: SEED_WORLD.id,
      location_id: SEED_LOCATIONS[0].id,
      time_of_day: resolveTimeOfDay(),
      season: resolveSeason(),
      weather: 'gentle_breeze',
      last_active_at: new Date().toISOString(),
      daily_refresh_token: 'token-' + new Date().toDateString(),
      updated_at: new Date().toISOString(),
    };
    return this.get<WorldStateRow>('world_state', defaultState);
  }

  static async saveWorldState(patch: Partial<WorldStateRow>): Promise<WorldStateRow> {
    const current = await this.getWorldState();
    const updated: WorldStateRow = {
      ...current,
      ...patch,
      updated_at: new Date().toISOString(),
    };
    await this.set('world_state', updated);
    return updated;
  }

  // Locations
  static async getLocations(): Promise<LocationsRow[]> {
    return this.get<LocationsRow[]>('locations', SEED_LOCATIONS);
  }

  static async unlockLocation(locationKey: string): Promise<LocationsRow[]> {
    const list = await this.getLocations();
    const updated = list.map((loc) =>
      loc.key === locationKey
        ? { ...loc, familiarity_stage: 'discovered' as const, unlocked_at: new Date().toISOString() }
        : loc
    );
    await this.set('locations', updated);
    return updated;
  }

  // Cassidy & Character State
  static async getCassidyView(): Promise<{
    character: CharactersRow;
    state: CharacterStateRow;
    relationship: CharacterRelationshipsRow;
  }> {
    const character = await this.get<CharactersRow>('cassidy_char', SEED_CASSIDY);
    const state = await this.get<CharacterStateRow>('cassidy_state', SEED_CASSIDY_STATE);
    const relationship = await this.get<CharacterRelationshipsRow>(
      'cassidy_rel',
      SEED_CASSIDY_RELATIONSHIP
    );
    return { character, state, relationship };
  }

  static async updateCassidyState(patch: Partial<CharacterStateRow>): Promise<CharacterStateRow> {
    const { state } = await this.getCassidyView();
    const updated = { ...state, ...patch, updated_at: new Date().toISOString() };
    await this.set('cassidy_state', updated);
    return updated;
  }

  static async updateCassidyRelationship(
    patch: Partial<CharacterRelationshipsRow>
  ): Promise<CharacterRelationshipsRow> {
    const { relationship } = await this.getCassidyView();
    const updated = { ...relationship, ...patch, updated_at: new Date().toISOString() };
    await this.set('cassidy_rel', updated);
    return updated;
  }

  // Study Objects
  static async getStudyState(): Promise<StudyObjectState> {
    return this.get<StudyObjectState>('study_state', {
      plantStage: 1,
      plantWaterCount: 1,
      lastWateredAt: new Date().toISOString(),
      activeRadioStation: 'lofi',
      isRadioPlaying: true,
      notes: [
        {
          id: 'note-1',
          term: 'Komorebi (木漏れ日)',
          note: 'Sunlight filtering through trees. Cassidy said this reflects finding joy in small learning moments.',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }

  static async saveStudyState(patch: Partial<StudyObjectState>): Promise<StudyObjectState> {
    const current = await this.getStudyState();
    const updated = { ...current, ...patch };
    await this.set('study_state', updated);
    return updated;
  }

  static async waterPlant(): Promise<StudyObjectState> {
    const current = await this.getStudyState();
    const newCount = current.plantWaterCount + 1;
    const newStage = Math.min(5, Math.floor(newCount / 3) + 1);
    const updated = {
      ...current,
      plantWaterCount: newCount,
      plantStage: newStage,
      lastWateredAt: new Date().toISOString(),
    };
    await this.set('study_state', updated);
    return updated;
  }

  // Memories
  static async getMemories(): Promise<MemoriesRow[]> {
    return this.get<MemoriesRow[]>('memories', SEED_MEMORIES);
  }

  static async addMemory(layer: MemoriesRow['layer'], fact: string): Promise<MemoriesRow> {
    const memories = await this.getMemories();
    const newMem: MemoriesRow = {
      id: 'mem-' + Date.now(),
      user_id: 'local-explorer-user',
      layer,
      canonical_fact: fact,
      occurred_at: new Date().toISOString(),
      source_event_id: null,
    };
    await this.set('memories', [newMem, ...memories]);
    return newMem;
  }

  // Journey Events
  static async getJourneyEvents(): Promise<JourneyEventsRow[]> {
    return this.get<JourneyEventsRow[]>('journey_events', SEED_JOURNEY_EVENTS);
  }

  static async addJourneyEvent(
    type: string,
    payload: Record<string, unknown>,
    producer = 'system'
  ): Promise<JourneyEventsRow> {
    const events = await this.getJourneyEvents();
    const newEvent: JourneyEventsRow = {
      id: 'jrn-' + Date.now(),
      user_id: 'local-explorer-user',
      producer,
      type,
      payload: payload as unknown as Json,
      created_at: new Date().toISOString(),
    };
    await this.set('journey_events', [newEvent, ...events]);
    return newEvent;
  }

  // Postcards
  static async getPostcards(): Promise<PostcardItem[]> {
    return this.get<PostcardItem[]>('postcards', SEED_POSTCARDS);
  }

  static async addPostcard(postcard: Omit<PostcardItem, 'id' | 'unlockedAt'>): Promise<PostcardItem> {
    const current = await this.getPostcards();
    const newItem: PostcardItem = {
      ...postcard,
      id: 'post-' + Date.now(),
      unlockedAt: new Date().toISOString(),
    };
    await this.set('postcards', [newItem, ...current]);
    return newItem;
  }

  // Review Stories
  static async getReviewStories(): Promise<ReviewStory[]> {
    return this.get<ReviewStory[]>('review_stories', SEED_REVIEW_STORIES);
  }

  // Session Bookmarks (Wave 4K)
  static async getSessionBookmark(): Promise<SessionBookmark | null> {
    return this.get<SessionBookmark | null>('session_bookmark', SEED_BOOKMARK);
  }

  static async saveSessionBookmark(bookmark: SessionBookmark | null): Promise<void> {
    await this.set('session_bookmark', bookmark);
  }

  // Custom Creations (Creative Studio - Wave 4A)
  static async getCreations(): Promise<CustomCreation[]> {
    return this.get<CustomCreation[]>('user_creations', SEED_CREATIONS);
  }

  static async addCreation(creation: Omit<CustomCreation, 'id' | 'createdAt'>): Promise<CustomCreation> {
    const current = await this.getCreations();
    const newItem: CustomCreation = {
      ...creation,
      id: 'cr-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    await this.set('user_creations', [newItem, ...current]);
    return newItem;
  }

  // Time Capsules (Blueprint #71)
  static async getTimeCapsules(): Promise<TimeCapsule[]> {
    return this.get<TimeCapsule[]>('time_capsules', SEED_TIME_CAPSULES);
  }

  static async addTimeCapsule(capsule: Omit<TimeCapsule, 'id' | 'unlocked' | 'createdAt'>): Promise<TimeCapsule> {
    const current = await this.getTimeCapsules();
    const newItem: TimeCapsule = {
      ...capsule,
      id: 'tc-' + Date.now(),
      unlocked: false,
      createdAt: new Date().toISOString(),
    };
    await this.set('time_capsules', [newItem, ...current]);
    return newItem;
  }

  static async unlockTimeCapsule(id: string): Promise<void> {
    const current = await this.getTimeCapsules();
    const updated = current.map((c) => (c.id === id ? { ...c, unlocked: true } : c));
    await this.set('time_capsules', updated);
  }

  // Cultural Artifacts & Wonder Prompts (Blueprint #48, #49, Wave 5E, 5F)
  static async getCulturalArtifacts(): Promise<CulturalArtifact[]> {
    return this.get<CulturalArtifact[]>('cultural_artifacts', SEED_CULTURAL_ARTIFACTS);
  }

  static async unlockCulturalArtifact(key: string): Promise<CulturalArtifact[]> {
    const current = await this.getCulturalArtifacts();
    const updated = current.map((a) =>
      a.key === key ? { ...a, unlocked: true, discoveredAt: a.discoveredAt || new Date().toISOString() } : a
    );
    await this.set('cultural_artifacts', updated);
    return updated;
  }

  // Knowledge Nodes & Constellation (Blueprint #99, #159)
  static async getKnowledgeNodes(): Promise<KnowledgeNode[]> {
    return this.get<KnowledgeNode[]>('knowledge_nodes', SEED_KNOWLEDGE_NODES);
  }

  static async updateKnowledgeMastery(key: string, delta: number): Promise<KnowledgeNode[]> {
    const current = await this.getKnowledgeNodes();
    const updated = current.map((k) =>
      k.key === key ? { ...k, masteryLevel: Math.min(100, Math.max(0, k.masteryLevel + delta)) } : k
    );
    await this.set('knowledge_nodes', updated);
    return updated;
  }

  // Revisit Tracking (Wave 5Y)
  static async getRevisitStats(): Promise<Record<string, RevisitRecord>> {
    return this.get<Record<string, RevisitRecord>>('revisit_stats', {
      study_room: { count: 12, lastVisitedAt: new Date(Date.now() - 86400000).toISOString() },
      cozy_cafe: { count: 6, lastVisitedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
      whispering_library: { count: 3, lastVisitedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
      lantern_market: { count: 2, lastVisitedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
      zen_garden: { count: 1, lastVisitedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
    });
  }

  static async recordLocationVisit(locationKey: string): Promise<void> {
    const stats = await this.getRevisitStats();
    const prev = stats[locationKey] || { count: 0, lastVisitedAt: new Date().toISOString() };
    stats[locationKey] = { count: prev.count + 1, lastVisitedAt: new Date().toISOString() };
    await this.set('revisit_stats', stats);
  }

  // Preferences
  static async getPreferences(): Promise<{
    targetLanguage: string;
    learningIntention: string;
    sessionLength: number;
    audioEnabled: boolean;
    reducedMotion: boolean;
    companionPresence: 'quiet' | 'natural' | 'active';
  }> {
    return this.get('user_preferences', {
      targetLanguage: 'Japanese (日本語)',
      learningIntention: 'Conversation & Cultural Exploration',
      sessionLength: 5,
      audioEnabled: true,
      reducedMotion: false,
      companionPresence: 'natural',
    });
  }

  static async savePreferences(
    patch: Partial<{
      targetLanguage: string;
      learningIntention: string;
      sessionLength: number;
      audioEnabled: boolean;
      reducedMotion: boolean;
      companionPresence: 'quiet' | 'natural' | 'active';
    }>
  ): Promise<void> {
    const current = await this.getPreferences();
    await this.set('user_preferences', { ...current, ...patch });
  }

  // Reset / Reseed Demo Data
  static async resetToSeedData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORE_KEY_PREFIX + 'world_state',
      STORE_KEY_PREFIX + 'locations',
      STORE_KEY_PREFIX + 'cassidy_char',
      STORE_KEY_PREFIX + 'cassidy_state',
      STORE_KEY_PREFIX + 'cassidy_rel',
      STORE_KEY_PREFIX + 'study_state',
      STORE_KEY_PREFIX + 'knowledge_items',
      STORE_KEY_PREFIX + 'memories',
      STORE_KEY_PREFIX + 'journey_events',
      STORE_KEY_PREFIX + 'postcards',
      STORE_KEY_PREFIX + 'review_stories',
      STORE_KEY_PREFIX + 'user_preferences',
      STORE_KEY_PREFIX + 'session_bookmark',
      STORE_KEY_PREFIX + 'user_creations',
      STORE_KEY_PREFIX + 'time_capsules',
      STORE_KEY_PREFIX + 'cultural_artifacts',
      STORE_KEY_PREFIX + 'knowledge_nodes',
      STORE_KEY_PREFIX + 'revisit_stats',
      STORE_KEY_PREFIX + 'user_quests',
      STORE_KEY_PREFIX + 'economy_state',
    ]);
  }
}
