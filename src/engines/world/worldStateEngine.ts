import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'gopal:living-world:state:v2:';
export type WorldFlag = { key: string; value: string | number | boolean; updatedAt: string };
type Stored = { flags: Record<string, WorldFlag>; history: string[] };
const empty = (): Stored => ({ flags: {}, history: [] });
const keyFor = (userId: string) => `${KEY_PREFIX}${encodeURIComponent(userId)}`;

/** Persistent world consequences shared by residents, opportunities and future callbacks, scoped to one learner. */
export class WorldStateEngine {
  private async read(userId: string): Promise<Stored> {
    try {
      const raw = await AsyncStorage.getItem(keyFor(userId));
      if (!raw) return empty();
      const parsed = JSON.parse(raw) as Stored;
      if (!parsed || typeof parsed !== 'object' || !parsed.flags || !Array.isArray(parsed.history)) return empty();
      return parsed;
    } catch {
      return empty();
    }
  }

  private async write(userId: string, state: Stored) {
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(state));
  }

  async get(userId: string, key: string) {
    return (await this.read(userId)).flags[key]?.value;
  }

  async has(userId: string, key: string) {
    return typeof (await this.get(userId, key)) !== 'undefined';
  }

  async set(userId: string, key: string, value: WorldFlag['value']) {
    const state = await this.read(userId);
    state.flags[key] = { key, value, updatedAt: new Date().toISOString() };
    if (!state.history.includes(key)) state.history.unshift(key);
    state.history = state.history.slice(0, 80);
    await this.write(userId, state);
    return state.flags[key];
  }

  async mark(userId: string, key: string) {
    return this.set(userId, key, true);
  }

  async all(userId: string) {
    return (await this.read(userId)).flags;
  }

  async history(userId: string) {
    return (await this.read(userId)).history;
  }

  async reset(userId: string) {
    await AsyncStorage.removeItem(keyFor(userId));
  }
}

export const worldStateEngine = new WorldStateEngine();
