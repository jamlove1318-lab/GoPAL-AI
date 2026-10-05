export type WorldTerrainKind = 'main-path' | 'branch' | 'bridge' | 'road' | 'water' | 'clearing';
export type WorldTerrainDefinition = { id: string; kind: WorldTerrainKind; path: string; width: number; opacity?: number; color?: string; edgeColor?: string; edgeWidth?: number; zIndex?: number };
export type WorldTerrainLayer = { id: string; base?: string; accent?: string; paths: WorldTerrainDefinition[] };

export const LIVING_TERRAIN_LAYERS: Record<string, WorldTerrainLayer> = {
  'emerald-village': { id: 'emerald-village-terrain', paths: [
    { id: 'emerald-main-path', kind: 'main-path', path: 'M-20 610C70 560 95 450 175 405C235 370 275 330 292 210', width: 50, opacity: 0.22, color: '#8f7a55', edgeColor: '#6b5a3e', edgeWidth: 2, zIndex: 2 },
    { id: 'emerald-main-path-surface', kind: 'main-path', path: 'M-20 610C70 560 95 450 175 405C235 370 275 330 292 210', width: 39, opacity: 0.68, color: '#d5c391', edgeColor: '#aa9569', edgeWidth: 1, zIndex: 3 },
    { id: 'emerald-east-branch', kind: 'branch', path: 'M175 405C235 465 305 500 420 505', width: 31, opacity: 0.68, color: '#d5c391', edgeColor: '#aa9569', edgeWidth: 1, zIndex: 3 },
    { id: 'emerald-south-branch', kind: 'branch', path: 'M175 405C130 505 95 640 70 820', width: 25, opacity: 0.62, color: '#d5c391', edgeColor: '#aa9569', edgeWidth: 1, zIndex: 3 },
  ] },
  'learning-campus': { id: 'learning-campus-terrain', paths: [
    { id: 'campus-central-walk', kind: 'road', path: 'M-10 680C80 610 140 500 205 405C260 325 300 240 410 150', width: 44, opacity: 0.72, color: '#d4c89f', edgeColor: '#a99d78', edgeWidth: 1, zIndex: 3 },
    { id: 'campus-west-walk', kind: 'branch', path: 'M205 405C155 430 100 455 30 470', width: 25, opacity: 0.65, color: '#c9bc91', edgeColor: '#9f936d', edgeWidth: 1, zIndex: 3 },
    { id: 'campus-east-walk', kind: 'branch', path: 'M205 405C270 440 325 500 420 535', width: 27, opacity: 0.65, color: '#c9bc91', edgeColor: '#9f936d', edgeWidth: 1, zIndex: 3 },
  ] },
};

function hasAny(tags: Set<string>, values: string[]) { return values.some(value => tags.has(value)); }

function semanticTerrain(locationId: string): WorldTerrainLayer {
  const lower = locationId.toLowerCase();
  const tags = new Set(lower.split('-'));
  const isCoastal = hasAny(tags, ['coast', 'nice', 'promenade']) || lower.includes('mediterranean');
  const isGarden = hasAny(tags, ['garden', 'nature', 'bamboo']);
  const isMarket = hasAny(tags, ['market', 'yatai', 'bakery', 'cafe']);
  const isHistoric = hasAny(tags, ['gion', 'montmartre', 'lyon', 'strasbourg', 'kanazawa', 'hakata']);
  const isCity = hasAny(tags, ['tokyo', 'shibuya', 'osaka', 'paris', 'city']);
  const mainKind: WorldTerrainKind = isCoastal || isCity || isHistoric ? 'road' : 'main-path';
  const mainColor = isCoastal ? '#b8aa83' : isCity || isHistoric ? '#b9ad8e' : '#c9b783';
  const edgeColor = isCoastal ? '#8f876f' : '#998862';
  const mainPath = isCoastal ? 'M-20 610C70 570 115 500 180 470C250 438 315 390 420 370' : isCity || isHistoric ? 'M-20 650C70 610 120 525 205 430C270 360 330 300 420 250' : 'M-20 620C65 575 110 480 190 420C245 380 300 325 420 305';
  const branchA = isGarden ? 'M190 420C145 390 95 355 35 345' : isMarket ? 'M205 430C220 490 285 545 410 570' : 'M205 430C155 455 100 475 20 475';
  const branchB = isCoastal ? 'M180 470C145 535 105 625 75 820' : isCity ? 'M205 430C265 465 325 500 420 515' : 'M190 420C240 485 290 570 330 820';
  const paths: WorldTerrainDefinition[] = [
    { id: `${locationId}-main-shadow`, kind: mainKind, path: mainPath, width: 48, opacity: 0.2, color: '#75664b', edgeColor: '#66583f', edgeWidth: 2, zIndex: 2 },
    { id: `${locationId}-main-surface`, kind: mainKind, path: mainPath, width: 38, opacity: 0.72, color: mainColor, edgeColor, edgeWidth: 1, zIndex: 3 },
    { id: `${locationId}-branch-a`, kind: 'branch', path: branchA, width: isMarket ? 28 : 24, opacity: 0.66, color: '#c5b486', edgeColor: '#988760', edgeWidth: 1, zIndex: 3 },
    { id: `${locationId}-branch-b`, kind: 'branch', path: branchB, width: 24, opacity: 0.62, color: '#c5b486', edgeColor: '#988760', edgeWidth: 1, zIndex: 3 },
  ];
  if (isCoastal) paths.unshift({ id: `${locationId}-water-edge`, kind: 'water', path: 'M-10 735C75 700 150 710 225 735C300 760 350 770 420 750', width: 74, opacity: 0.32, color: '#79aeb3', edgeColor: '#5c8f96', edgeWidth: 2, zIndex: 1 });
  if (isGarden) paths.push({ id: `${locationId}-clearing`, kind: 'clearing', path: 'M105 250C145 220 220 215 260 245C285 275 275 315 235 330C180 345 120 325 105 290Z', width: 28, opacity: 0.5, color: '#b8c88b', zIndex: 2 });
  return { id: `${locationId}-terrain`, base: isCoastal ? '#b9d1c5' : '#9caf79', accent: mainColor, paths };
}

export function getLivingTerrainLayer(locationId: string): WorldTerrainLayer { return LIVING_TERRAIN_LAYERS[locationId] ?? semanticTerrain(locationId); }
