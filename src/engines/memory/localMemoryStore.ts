import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEED_MEMORIES } from '../../lib/localStore';
import type { MemoriesRow } from '../../types/database';

const KEY_PREFIX = 'gopal:memory:user:v2:';
const LEGACY_KEY = 'gopal:store:memories';
const LOCAL_USER_ID = 'local-explorer-user';

const keyFor = (userId: string) => `${KEY_PREFIX}${userId.trim() || LOCAL_USER_ID}`;

async function read(userId: string): Promise<MemoriesRow[]> {
  const safeUserId = userId.trim() || LOCAL_USER_ID;
  try {
    const raw = await AsyncStorage.getItem(`gopal:store:${keyFor(safeUserId)}`);
    if (raw) return JSON.parse(raw) as MemoriesRow[];

    // Only the local explorer may inherit the old unscoped cache. Never copy
    // device-local memories into a real authenticated learner's namespace.
    if (safeUserId === LOCAL_USER_ID) {
      const legacy = await AsyncStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const migrated = JSON.parse(legacy) as MemoriesRow[];
        await write(safeUserId, migrated);
        return migrated;
      }
    }
  } catch {
    // Fall through to seed data so local mode remains usable.
  }
  return safeUserId === LOCAL_USER_ID ? SEED_MEMORIES : [];
}

async function write(userId: string, memories: MemoriesRow[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`gopal:store:${keyFor(userId)}`, JSON.stringify(memories));
  } catch {
    // Local persistence is best-effort, matching the existing LocalStore contract.
  }
}

export async function getLocalMemories(userId: string): Promise<MemoriesRow[]> {
  return read(userId);
}

export async function addLocalMemory(
  userId: string,
  layer: MemoriesRow['layer'],
  fact: string,
): Promise<MemoriesRow> {
  const safeUserId = userId.trim() || LOCAL_USER_ID;
  const memories = await read(safeUserId);
  const newMemory: MemoriesRow = {
    id: `mem-${Date.now()}`,
    user_id: safeUserId,
    layer,
    canonical_fact: fact,
    occurred_at: new Date().toISOString(),
    source_event_id: null,
  };
  await write(safeUserId, [newMemory, ...memories]);
  return newMemory;
}
