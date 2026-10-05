import type { MemoriesRow } from '../types/database';
import { LocalStore, SEED_MEMORIES } from './localStore';

const KEY_PREFIX = 'learner:memories:v2:';
const LEGACY_KEY = 'memories';
const LOCAL_USER_ID = 'local-explorer-user';

const keyFor = (userId: string) => `${KEY_PREFIX}${userId.trim() || LOCAL_USER_ID}`;

export async function getLearnerMemories(userId: string): Promise<MemoriesRow[]> {
  const safeUserId = userId.trim() || LOCAL_USER_ID;
  const scoped = await LocalStore.get<MemoriesRow[] | null>(keyFor(safeUserId), null);
  if (scoped) return scoped;

  // Migrate the old single-user local store only for the local fallback identity.
  if (safeUserId === LOCAL_USER_ID) {
    const legacy = await LocalStore.get<MemoriesRow[] | null>(LEGACY_KEY, null);
    if (legacy) {
      await LocalStore.set(keyFor(safeUserId), legacy);
      return legacy;
    }
  }

  return safeUserId === LOCAL_USER_ID ? SEED_MEMORIES : [];
}

export async function addLearnerMemory(
  userId: string,
  layer: MemoriesRow['layer'],
  fact: string,
  sourceEventId?: string,
): Promise<MemoriesRow> {
  const safeUserId = userId.trim() || LOCAL_USER_ID;
  const memories = await getLearnerMemories(safeUserId);
  const normalizedFact = fact.trim();
  const existing = memories.find(
    memory => memory.layer === layer && memory.canonical_fact === normalizedFact,
  );
  if (existing) return existing;

  const newMemory: MemoriesRow = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user_id: safeUserId,
    layer,
    canonical_fact: normalizedFact,
    occurred_at: new Date().toISOString(),
    source_event_id: sourceEventId ?? null,
  };
  await LocalStore.set(keyFor(safeUserId), [newMemory, ...memories]);
  return newMemory;
}
