import type { LocationsRow } from '../../types/database';

/**
 * Canonical activity boundary for the living world.
 * Real locations are resident-led language/culture experiences only.
 * Fictional locations may host games, quests and adventures.
 */
export type WorldLocationKind = 'real' | 'fictional';

export interface WorldActivityPolicy {
  kind: WorldLocationKind;
  residentConversation: true;
  games: boolean;
  quests: boolean;
  adventures: boolean;
  exploration: true;
}

const REAL_KEYS = new Set([
  'real',
  'real-world',
  'real_world',
  'real-location',
  'real_location',
]);

function classify(location: LocationsRow | { key?: string; world_id?: string } | null): WorldLocationKind {
  if (!location) return 'fictional';
  const key = String(location.key ?? '').trim().toLowerCase();
  return REAL_KEYS.has(key) || key.startsWith('real_') || key.startsWith('real-') ? 'real' : 'fictional';
}

export function getWorldActivityPolicy(location: LocationsRow | null): WorldActivityPolicy {
  const kind = classify(location);
  if (kind === 'real') {
    return {
      kind,
      residentConversation: true,
      games: false,
      quests: false,
      adventures: false,
      exploration: true,
    };
  }

  return {
    kind,
    residentConversation: true,
    games: true,
    quests: true,
    adventures: true,
    exploration: true,
  };
}

export function canStartWorldActivity(
  location: LocationsRow | null,
  activity: 'resident-conversation' | 'game' | 'quest' | 'adventure' | 'exploration',
): boolean {
  const policy = getWorldActivityPolicy(location);
  if (activity === 'resident-conversation' || activity === 'exploration') return true;
  return policy[`${activity}s` as 'games' | 'quests' | 'adventures'];
}

export const worldActivityPolicy = { get: getWorldActivityPolicy, canStart: canStartWorldActivity };
