export type WorldLearningLocationKind = 'real' | 'fictional';

/**
 * Real-world physical destinations are resident-first experiences.
 * Mini-games belong to fictional locations and must never be selected for
 * a known real destination merely because legacy hotspot data contains a
 * miniGameId.
 */
const REAL_WORLD_PLACE_IDS = new Set([
  'kyoto-gion',
  'shibuya-crossing',
  'osaka-dotonbori',
  'kanazawa',
  'fukuoka-hakata',
]);

export function getWorldLearningLocationKind(placeId: string): WorldLearningLocationKind {
  return REAL_WORLD_PLACE_IDS.has(placeId) ? 'real' : 'fictional';
}

export function canUseMiniGamesAtLocation(placeId: string, kind?: WorldLearningLocationKind): boolean {
  const resolved = kind ?? getWorldLearningLocationKind(placeId);
  return resolved === 'fictional';
}

export function isRealWorldPlace(placeId: string): boolean {
  return getWorldLearningLocationKind(placeId) === 'real';
}

export const worldLearningLocationPolicy = {
  getKind: getWorldLearningLocationKind,
  canUseMiniGames: canUseMiniGamesAtLocation,
  isReal: isRealWorldPlace,
};
