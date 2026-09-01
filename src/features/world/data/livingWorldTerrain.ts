export type WorldTerrainKind = 'main-path' | 'branch' | 'bridge' | 'road' | 'water' | 'clearing';

export type WorldTerrainDefinition = {
  id: string;
  kind: WorldTerrainKind;
  path: string;
  width: number;
  opacity?: number;
  color?: string;
  edgeColor?: string;
  edgeWidth?: number;
  zIndex?: number;
};

export type WorldTerrainLayer = {
  id: string;
  base?: string;
  accent?: string;
  paths: WorldTerrainDefinition[];
};

export const LIVING_TERRAIN_LAYERS: Record<string, WorldTerrainLayer> = {
  'emerald-village': {
    id: 'emerald-village-terrain',
    paths: [
      {
        id: 'emerald-main-path',
        kind: 'main-path',
        path: 'M-20 610C70 560 95 450 175 405C235 370 275 330 292 210',
        width: 50,
        opacity: 0.22,
        color: '#8f7a55',
        zIndex: 2,
      },
      {
        id: 'emerald-main-path-surface',
        kind: 'main-path',
        path: 'M-20 610C70 560 95 450 175 405C235 370 275 330 292 210',
        width: 39,
        opacity: 0.68,
        color: '#d5c391',
        zIndex: 3,
      },
      {
        id: 'emerald-east-branch',
        kind: 'branch',
        path: 'M175 405C235 465 305 500 420 505',
        width: 31,
        opacity: 0.68,
        color: '#d5c391',
        zIndex: 3,
      },
      {
        id: 'emerald-south-branch',
        kind: 'branch',
        path: 'M175 405C130 505 95 640 70 820',
        width: 25,
        opacity: 0.62,
        color: '#d5c391',
        zIndex: 3,
      },
    ],
  },
  'learning-campus': {
    id: 'learning-campus-terrain',
    paths: [
      {
        id: 'campus-central-walk',
        kind: 'road',
        path: 'M-10 680C80 610 140 500 205 405C260 325 300 240 410 150',
        width: 44,
        opacity: 0.72,
        color: '#d4c89f',
        zIndex: 3,
      },
      {
        id: 'campus-west-walk',
        kind: 'branch',
        path: 'M205 405C155 430 100 455 30 470',
        width: 25,
        opacity: 0.65,
        color: '#c9bc91',
        zIndex: 3,
      },
      {
        id: 'campus-east-walk',
        kind: 'branch',
        path: 'M205 405C270 440 325 500 420 535',
        width: 27,
        opacity: 0.65,
        color: '#c9bc91',
        zIndex: 3,
      },
    ],
  },
};

export function getLivingTerrainLayer(locationId: string): WorldTerrainLayer {
  return LIVING_TERRAIN_LAYERS[locationId] ?? LIVING_TERRAIN_LAYERS['emerald-village'];
}
