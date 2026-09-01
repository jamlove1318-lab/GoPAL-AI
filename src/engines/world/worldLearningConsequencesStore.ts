import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoryLayerState } from '../../lib/waveStore';

const PREFIX = 'gopal:world:learning-consequences:v1:';
const keyFor = (userId: string) => `${PREFIX}${encodeURIComponent(userId)}`;

type Stored = Record<string, StoryLayerState>;

async function read(userId: string): Promise<Stored> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Stored;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function write(userId: string, value: Stored): Promise<void> {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(value));
}

export const worldLearningConsequencesStore = {
  async get(userId: string, locationKey: string): Promise<StoryLayerState | null> {
    if (!userId.trim()) throw new Error('World learning consequences require a userId');
    return (await read(userId))[locationKey] ?? null;
  },

  async save(userId: string, layer: StoryLayerState): Promise<StoryLayerState> {
    if (!userId.trim()) throw new Error('World learning consequences require a userId');
    const state = await read(userId);
    state[layer.locationKey] = layer;
    await write(userId, state);
    return layer;
  },

  async reset(userId: string): Promise<void> {
    if (!userId.trim()) throw new Error('World learning consequences require a userId');
    await AsyncStorage.removeItem(keyFor(userId));
  },
};
