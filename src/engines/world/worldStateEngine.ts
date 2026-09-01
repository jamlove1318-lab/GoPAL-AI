import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'gopal:living-world:state:v2:';
const LOCAL_USER = 'local-explorer-user';
export type WorldFlag = { key: string; value: string | number | boolean; updatedAt: string };
type Stored = { flags: Record<string, WorldFlag>; history: string[] };
const empty = (): Stored => ({ flags: {}, history: [] });
const keyFor = (userId: string) => `${KEY_PREFIX}${encodeURIComponent(userId || LOCAL_USER)}`;

/** Persistent world consequences. New callers should always provide userId; the legacy overloads keep existing engine consumers source-compatible. */
export class WorldStateEngine {
  private async read(userId: string): Promise<Stored> {
    try {
      const raw = await AsyncStorage.getItem(keyFor(userId));
      if (!raw) return empty();
      const parsed = JSON.parse(raw) as Stored;
      if (!parsed || typeof parsed !== 'object' || !parsed.flags || !Array.isArray(parsed.history)) return empty();
      return parsed;
    } catch { return empty(); }
  }
  private async write(userId: string, state: Stored) { await AsyncStorage.setItem(keyFor(userId), JSON.stringify(state)); }

  async get(userId: string, key: string): Promise<string | number | boolean | undefined>;
  async get(key: string): Promise<string | number | boolean | undefined>;
  async get(userOrKey: string, maybeKey?: string) {
    const userId = maybeKey === undefined ? LOCAL_USER : userOrKey;
    const key = maybeKey === undefined ? userOrKey : maybeKey;
    return (await this.read(userId)).flags[key]?.value;
  }

  async has(userId: string, key: string): Promise<boolean>;
  async has(key: string): Promise<boolean>;
  async has(userOrKey: string, maybeKey?: string) {
    const userId = maybeKey === undefined ? LOCAL_USER : userOrKey;
    const key = maybeKey === undefined ? userOrKey : maybeKey;
    return typeof (await this.get(userId, key)) !== 'undefined';
  }

  async set(userId: string, key: string, value: WorldFlag['value']): Promise<WorldFlag>;
  async set(key: string, value: WorldFlag['value']): Promise<WorldFlag>;
  async set(userOrKey: string, keyOrValue: string | WorldFlag['value'], maybeValue?: WorldFlag['value']) {
    const userId = maybeValue === undefined ? LOCAL_USER : userOrKey;
    const key = maybeValue === undefined ? userOrKey : keyOrValue as string;
    const value = maybeValue === undefined ? keyOrValue as WorldFlag['value'] : maybeValue;
    const state = await this.read(userId);
    state.flags[key] = { key, value, updatedAt: new Date().toISOString() };
    if (!state.history.includes(key)) state.history.unshift(key);
    state.history = state.history.slice(0, 80);
    await this.write(userId, state);
    return state.flags[key];
  }

  async mark(userId: string, key: string): Promise<WorldFlag>;
  async mark(key: string): Promise<WorldFlag>;
  async mark(userOrKey: string, maybeKey?: string) {
    return maybeKey === undefined ? this.set(userOrKey, true) : this.set(userOrKey, maybeKey, true);
  }

  async all(userId: string): Promise<Record<string, WorldFlag>>;
  async all(): Promise<Record<string, WorldFlag>>;
  async all(userId = LOCAL_USER) { return (await this.read(userId)).flags; }

  async history(userId: string): Promise<string[]>;
  async history(): Promise<string[]>;
  async history(userId = LOCAL_USER) { return (await this.read(userId)).history; }

  async reset(userId: string): Promise<void>;
  async reset(): Promise<void>;
  async reset(userId = LOCAL_USER) { await AsyncStorage.removeItem(keyFor(userId)); }
}

export const worldStateEngine = new WorldStateEngine();
