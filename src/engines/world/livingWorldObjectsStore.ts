import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LivingWorldObject {
  id: string;
  name: string;
  kind: 'plant' | 'companion' | 'artifact';
  growth: number;
  memory: string[];
  lastTickAt: number;
}

const PREFIX = 'gopal:living-world:objects:v2:';
const LEGACY_KEY = 'gopal:wave:living_objects';

const SEEDS: LivingWorldObject[] = [
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

const keyFor = (userId: string) => `${PREFIX}${encodeURIComponent(userId)}`;

function cloneSeeds(): LivingWorldObject[] {
  return SEEDS.map((object) => ({ ...object, memory: [...object.memory] }));
}

async function read(userId: string): Promise<LivingWorldObject[]> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    if (!raw) return cloneSeeds();
    const parsed = JSON.parse(raw) as LivingWorldObject[];
    if (!Array.isArray(parsed)) return cloneSeeds();
    return parsed;
  } catch {
    return cloneSeeds();
  }
}

async function write(userId: string, objects: LivingWorldObject[]): Promise<void> {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(objects));
}

export const livingWorldObjectsStore = {
  async getAll(userId: string): Promise<LivingWorldObject[]> {
    return read(userId);
  },
  async tick(userId: string, id: string, note?: string): Promise<LivingWorldObject[]> {
    if (!userId.trim()) throw new Error('livingWorldObjectsStore.tick requires a userId');
    const list = await read(userId);
    const updated = list.map((object) => object.id !== id ? object : {
      ...object,
      growth: Math.min(100, object.growth + 1),
      memory: note ? [...object.memory, note].slice(-10) : object.memory,
      lastTickAt: Date.now(),
    });
    await write(userId, updated);
    return updated;
  },
  async reset(userId: string): Promise<void> { await AsyncStorage.removeItem(keyFor(userId)); },
  async migrateLegacyLocalState(userId: string): Promise<void> {
    if (userId !== 'local-explorer-user') return;
    const scopedKey = keyFor(userId);
    const alreadyScoped = await AsyncStorage.getItem(scopedKey);
    if (alreadyScoped) return;
    const legacy = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacy) await AsyncStorage.setItem(scopedKey, legacy);
  },
};
