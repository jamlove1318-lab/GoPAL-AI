import { LocalStore } from '../../lib/localStore';
import { auth } from '../../services/auth';
import { getWorldMiniGameCatalog, type WorldMiniGameCatalogEntry } from './worldMiniGameCatalog';
import { worldLearningLocationPolicy } from './worldLearningLocationPolicy';
import type { WorldMiniGameSkill } from './worldMiniGameEngine';

const KEY_PREFIX = 'world_mini_game_history_v2:';
const HISTORY_LIMIT = 40;

type MiniGameHistory = { played: Array<{ id: string; placeId: string; worldId: string; at: number }> };
const userKey = (userId: string) => `${KEY_PREFIX}${userId.trim() || 'local-explorer-user'}`;
async function resolveUserId(userId?: string): Promise<string> {
  if (userId?.trim()) return userId.trim();
  const user = await auth.getCurrentUser();
  return user?.id?.trim() || 'local-explorer-user';
}
async function readHistory(userId?: string): Promise<MiniGameHistory> {
  const resolvedUserId = await resolveUserId(userId);
  return LocalStore.get<MiniGameHistory>(userKey(resolvedUserId), { played: [] });
}
async function writeHistory(value: MiniGameHistory, userId?: string) {
  const resolvedUserId = await resolveUserId(userId);
  await LocalStore.set(userKey(resolvedUserId), value);
}

/** Mini-games belong to fictional locations. Real-world locations are reserved for resident-led learning. */
export type WorldLearningLocationKind = 'real' | 'fictional';
export type WorldMiniGameSelectionContext = {
  worldId: string;
  placeId: string;
  locationKind: WorldLearningLocationKind;
  skills?: WorldMiniGameSkill[];
  preferredFamily?: WorldMiniGameCatalogEntry['family'];
  preferredGameId?: string;
  maxMinutes?: number;
  excludeIds?: string[];
  count?: number;
  userId?: string;
};

export async function rememberMiniGamePlayed(input: { id: string; worldId: string; placeId: string; userId?: string }) {
  const userId = await resolveUserId(input.userId);
  const history = await readHistory(userId);
  const played = [
    ...history.played.filter(item => item.id !== input.id || item.placeId !== input.placeId),
    { id: input.id, worldId: input.worldId, placeId: input.placeId, at: Date.now() },
  ].slice(-HISTORY_LIMIT);
  await writeHistory({ played }, userId);
  return { played };
}

export async function getMiniGameHistory(userId?: string) {
  return readHistory(await resolveUserId(userId));
}

export async function selectMiniGames(context: WorldMiniGameSelectionContext) {
  if (!worldLearningLocationPolicy.canUseMiniGames(context.placeId, context.locationKind)) return [];
  const userId = await resolveUserId(context.userId);
  const history = await readHistory(userId);
  const recentIds = new Set(history.played.slice(-12).map(item => item.id));
  const excluded = new Set(context.excludeIds ?? []);
  const now = Date.now();
  const recentById = new Map<string, number>();
  for (const item of history.played) recentById.set(item.id, item.at);
  const candidates = getWorldMiniGameCatalog().filter(game => !excluded.has(game.id));
  const scored = candidates
    .map(game => {
      const skillScore = context.skills?.length ? game.skills.filter(skill => context.skills!.includes(skill)).length * 12 : 0;
      const familyScore = context.preferredFamily === game.family ? 18 : 0;
      const preferredScore = context.preferredGameId === game.id ? 22 : 0;
      const timeScore = context.maxMinutes === undefined ? 0 : game.estimatedMinutes <= context.maxMinutes ? 6 : -30;
      const last = recentById.get(game.id);
      const cooldownMs = game.repeatCooldown * 60 * 1000;
      const cooldownScore = last === undefined ? 12 : now - last >= cooldownMs ? 5 : -45;
      const noveltyScore = recentIds.has(game.id) ? -35 : 10;
      const worldBonus = history.played.some(item => item.id === game.id && item.worldId === context.worldId) ? -4 : 0;
      return { game, score: skillScore + familyScore + preferredScore + timeScore + cooldownScore + noveltyScore + worldBonus };
    })
    .sort((a, b) => b.score - a.score || a.game.estimatedMinutes - b.game.estimatedMinutes);
  const count = Math.max(1, Math.min(context.count ?? 3, candidates.length));
  const selected: WorldMiniGameCatalogEntry[] = [];
  const families = new Set<WorldMiniGameCatalogEntry['family']>();
  for (const item of scored) {
    if (selected.length >= count) break;
    if (selected.length > 0 && families.has(item.game.family) && scored.length >= count + 2 && item.score < scored[0].score - 20) continue;
    selected.push(item.game);
    families.add(item.game.family);
  }
  for (const item of scored) {
    if (selected.length >= count) break;
    if (!selected.some(game => game.id === item.game.id)) selected.push(item.game);
  }
  return selected;
}

export const worldMiniGameSelectionEngine = {
  select: selectMiniGames,
  remember: rememberMiniGamePlayed,
  history: getMiniGameHistory,
  canUse: worldLearningLocationPolicy.canUseMiniGames,
};
