import type { WorldTheme } from '../components/LivingWorldPrimitives';

export type WorldEntranceKind = 'door' | 'gate' | 'arch' | 'portal' | 'boarding-gate' | 'entrance';
export type WorldEntranceDefinition = {
  id: string;
  kind: WorldEntranceKind;
  x: number;
  y: number;
  targetId?: string;
  targetType?: 'building' | 'location' | 'interior' | 'world' | 'game';
  label?: string;
  width?: number;
  rotation?: number;
  scale?: number;
  theme?: WorldTheme;
  locked?: boolean;
  interactive?: boolean;
  tags?: string[];
};

export const LIVING_WORLD_ENTRANCES: Record<string, WorldEntranceDefinition[]> = {
  'emerald-village': [
    { id: 'sanctuary-door', kind: 'door', x: 16, y: 75, targetId: 'sanctuary-interior', targetType: 'interior', label: 'Enter Sanctuary', interactive: true },
    { id: 'cafe-door', kind: 'door', x: 50, y: 44, targetId: 'cafe-interior', targetType: 'interior', label: 'Enter Café', interactive: true },
    { id: 'library-door', kind: 'door', x: 76, y: 26, targetId: 'library-interior', targetType: 'interior', label: 'Enter Library', interactive: true },
    { id: 'market-gate', kind: 'gate', x: 82, y: 72, targetId: 'market-interior', targetType: 'interior', label: 'Enter Market', interactive: true },
    { id: 'station-entrance', kind: 'entrance', x: 72, y: 76, targetId: 'emerald-rail-platform', targetType: 'location', label: 'Enter Station', interactive: true, tags: ['transport'] },
  ],
  'learning-campus': [
    { id: 'academy-door', kind: 'door', x: 46, y: 31, targetId: 'academy-interior', targetType: 'interior', label: 'Enter Academy', interactive: true },
    { id: 'campus-library-door', kind: 'door', x: 71, y: 54, targetId: 'campus-library-interior', targetType: 'interior', label: 'Enter Library', interactive: true },
    { id: 'airport-terminal', kind: 'boarding-gate', x: 22, y: 23, targetId: 'campus-airport-interior', targetType: 'location', label: 'Enter Airport', interactive: true, tags: ['transport'] },
  ],
};

export function getWorldEntrances(locationId: string) { return LIVING_WORLD_ENTRANCES[locationId] ?? []; }
export function findWorldEntrance(locationId: string, id: string) { return getWorldEntrances(locationId).find(entrance => entrance.id === id) ?? null; }
