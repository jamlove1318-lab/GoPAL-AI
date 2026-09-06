import { getPhysicalLocationProfile } from './livingPhysicalLocationProfiles';

export type WorldTerrainKind = 'main-path' | 'branch' | 'bridge' | 'road' | 'water' | 'clearing';
export type WorldTerrainDefinition = { id: string; kind: WorldTerrainKind; path: string; width: number; opacity?: number; color?: string; edgeColor?: string; edgeWidth?: number; zIndex?: number };
export type WorldTerrainLayer = { id: string; base?: string; accent?: string; paths: WorldTerrainDefinition[] };

export const LIVING_TERRAIN_LAYERS: Record<string, WorldTerrainLayer> = {
  'emerald-village': {
    id: 'emerald-village-terrain',
    paths: [
      { id: 'emerald-main-path', kind: 'main-path', path: 'M-20 610C70 560 95 450 175 405C235 370 275 330 292 210', width: 50, opacity: 0.22, color: '#8f7a55', edgeColor: '#6b5a3e', edgeWidth: 2, zIndex: 2 },
      { id: 'emerald-main-path-surface', kind: 'main-path', path: 'M-20 610C70 560 95 450 175 405C235 370 275 330 292 210', width: 39, opacity: 0.68, color: '#d5c391', edgeColor: '#aa9569', edgeWidth: 1, zIndex: 3 },
      { id: 'emerald-east-branch', kind: 'branch', path: 'M175 405C235 465 305 500 420 505', width: 31, opacity: 0.68, color: '#d5c391', edgeColor: '#aa9569', edgeWidth: 1, zIndex: 3 },
      { id: 'emerald-south-branch', kind: 'branch', path: 'M175 405C130 505 95 640 70 820', width: 25, opacity: 0.62, color: '#d5c391', edgeColor: '#aa9569', edgeWidth: 1, zIndex: 3 },
    ],
  },
  'learning-campus': {
    id: 'learning-campus-terrain',
    paths: [
      { id: 'campus-central-walk', kind: 'road', path: 'M-10 680C80 610 140 500 205 405C260 325 300 240 410 150', width: 44, opacity: 0.72, color: '#d4c89f', edgeColor: '#a99d78', edgeWidth: 1, zIndex: 3 },
      { id: 'campus-west-walk', kind: 'branch', path: 'M205 405C155 430 100 455 30 470', width: 25, opacity: 0.65, color: '#c9bc91', edgeColor: '#9f936d', edgeWidth: 1, zIndex: 3 },
      { id: 'campus-east-walk', kind: 'branch', path: 'M205 405C270 440 325 500 420 535', width: 27, opacity: 0.65, color: '#c9bc91', edgeColor: '#9f936d', edgeWidth: 1, zIndex: 3 },
    ],
  },
};

function pathFor(pattern: string) {
  switch (pattern) {
    case 'grid': return 'M-20 620L150 500L310 500L440 360';
    case 'promenade': return 'M-20 560C90 540 170 555 270 575C340 588 395 570 440 535';
    case 'path': return 'M-20 650C80 590 130 500 190 420C250 340 320 290 440 260';
    case 'plaza': return 'M-20 610C80 560 145 505 215 445C290 385 350 360 440 345';
    case 'courtyard': return 'M-20 650C65 610 125 545 180 470C235 395 300 390 440 420';
    default: return 'M-20 630C70 590 120 520 195 445C270 370 340 335 440 300';
  }
}

function branchFor(pattern: string) {
  switch (pattern) {
    case 'grid': return 'M195 445L195 760M195 445L370 300';
    case 'promenade': return 'M120 550C115 630 105 710 85 820';
    case 'path': return 'M190 420C135 390 85 350 30 330';
    case 'plaza': return 'M215 445C155 450 105 470 30 500';
    default: return 'M195 445C250 480 310 540 410 570';
  }
}

function profileTerrain(locationId: string): WorldTerrainLayer | null {
  const profile = getPhysicalLocationProfile(locationId);
  if (!profile) return null;

  const mainPath = pathFor(profile.streetPattern);
  const branchPath = branchFor(profile.streetPattern);
  const mainKind: WorldTerrainKind = profile.infrastructure.includes('road') ? 'road' : 'main-path';
  const width = profile.density === 'dense' ? 52 : profile.density === 'neighborhood' ? 42 : 34;
  const surface = profile.infrastructure.includes('garden-path') ? '#b9c28f' : profile.infrastructure.includes('promenade') ? '#c7b98f' : '#b8ad8f';
  const paths: WorldTerrainDefinition[] = [
    { id: `${locationId}-main-shadow`, kind: mainKind, path: mainPath, width: width + 9, opacity: 0.18, color: '#675c49', edgeColor: '#5a503f', edgeWidth: 2, zIndex: 2 },
    { id: `${locationId}-main-surface`, kind: mainKind, path: mainPath, width, opacity: 0.72, color: surface, edgeColor: '#968864', edgeWidth: 1, zIndex: 3 },
    { id: `${locationId}-branch`, kind: 'branch', path: branchPath, width: profile.density === 'dense' ? 29 : 23, opacity: 0.64, color: '#c5b588', edgeColor: '#988761', edgeWidth: 1, zIndex: 3 },
  ];

  if (profile.infrastructure.includes('crosswalk')) paths.push({ id: `${locationId}-crossing`, kind: 'road', path: 'M135 485L255 405', width: 18, opacity: 0.9, color: '#d9d4c1', edgeColor: '#aaa18e', edgeWidth: 1, zIndex: 4 });
  if (profile.infrastructure.includes('canal')) paths.unshift({ id: `${locationId}-canal`, kind: 'water', path: 'M-10 745C80 700 165 710 245 745C315 775 370 775 445 735', width: 86, opacity: 0.36, color: '#70a8b0', edgeColor: '#568c95', edgeWidth: 2, zIndex: 1 });
  if (profile.infrastructure.includes('garden-path')) paths.push({ id: `${locationId}-garden-clearing`, kind: 'clearing', path: 'M95 245C140 210 220 205 270 240C295 270 280 320 235 338C175 350 115 330 95 285Z', width: 30, opacity: 0.5, color: '#b7c58d', zIndex: 2 });
  if (profile.infrastructure.includes('promenade')) paths.push({ id: `${locationId}-waterfront`, kind: 'water', path: 'M-5 710C90 675 180 690 270 720C340 742 395 735 445 700', width: 110, opacity: 0.3, color: '#78adb2', edgeColor: '#5b9198', edgeWidth: 2, zIndex: 1 });

  return { id: `${locationId}-terrain`, base: profile.primaryLandmark === 'waterfront' || profile.primaryLandmark === 'canal' ? '#b8d0c6' : '#9caf7a', accent: surface, paths };
}

export function getLivingTerrainLayer(locationId: string): WorldTerrainLayer {
  return LIVING_TERRAIN_LAYERS[locationId] ?? profileTerrain(locationId) ?? LIVING_TERRAIN_LAYERS['emerald-village'];
}
