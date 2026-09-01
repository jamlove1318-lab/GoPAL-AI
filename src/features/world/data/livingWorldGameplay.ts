import type { WorldTheme } from '../components/LivingWorldPrimitives';

export type WorldGameplayKind =
  | 'spawn'
  | 'checkpoint'
  | 'collectible'
  | 'trigger'
  | 'portal'
  | 'door'
  | 'switch'
  | 'pressure-plate'
  | 'quest-marker'
  | 'save-point'
  | 'shop'
  | 'loot-container'
  | 'puzzle'
  | 'moving-platform'
  | 'hazard';

export type WorldGameplayDefinition = {
  id: string;
  kind: WorldGameplayKind;
  x: number;
  y: number;
  radius?: number;
  scale?: number;
  theme?: WorldTheme;
  label?: string;
  tags?: string[];
  targetId?: string;
  oneShot?: boolean;
  stateful?: boolean;
  interactive?: boolean;
};

const LOCATION_GAMEPLAY: Record<string, WorldGameplayDefinition[]> = {
  'emerald-village': [
    { id: 'emerald-spawn', kind: 'spawn', x: 50, y: 62, radius: 4, theme: 'emerald', label: 'Village Spawn' },
    { id: 'emerald-checkpoint-station', kind: 'checkpoint', x: 62, y: 52, radius: 5, theme: 'emerald', label: 'Station Checkpoint', stateful: true, interactive: true },
    { id: 'emerald-garden-collectible', kind: 'collectible', x: 76, y: 76, radius: 4, theme: 'emerald', label: 'Garden Discovery', oneShot: true, interactive: true, tags: ['discovery', 'learning'] },
    { id: 'emerald-village-save', kind: 'save-point', x: 28, y: 48, radius: 4, theme: 'emerald', label: 'Village Save Point', interactive: true },
  ],
  'learning-campus': [
    { id: 'campus-spawn', kind: 'spawn', x: 50, y: 62, radius: 4, theme: 'emerald', label: 'Campus Spawn' },
    { id: 'campus-checkpoint', kind: 'checkpoint', x: 52, y: 54, radius: 5, theme: 'emerald', label: 'Campus Checkpoint', stateful: true, interactive: true },
    { id: 'campus-quest-marker', kind: 'quest-marker', x: 67, y: 38, radius: 4, theme: 'emerald', label: 'Learning Quest', interactive: true, tags: ['lesson', 'quest'] },
    { id: 'campus-puzzle', kind: 'puzzle', x: 27, y: 70, radius: 5, theme: 'emerald', label: 'Campus Puzzle', stateful: true, interactive: true, tags: ['game', 'learning'] },
  ],
};

export function getLocationGameplay(locationId: string): WorldGameplayDefinition[] {
  return LOCATION_GAMEPLAY[locationId] ?? [];
}

export function gameplayByKind(locationId: string, kind: WorldGameplayKind): WorldGameplayDefinition[] {
  return getLocationGameplay(locationId).filter(item => item.kind === kind);
}

export function nearestGameplay(point: { x: number; y: number }, objects: WorldGameplayDefinition[], maxDistance = 12): WorldGameplayDefinition | null {
  let nearest: WorldGameplayDefinition | null = null;
  let best = maxDistance;
  for (const object of objects) {
    const distance = Math.hypot(point.x - object.x, (point.y - object.y) * 0.92);
    const radius = object.radius ?? 4;
    const effective = Math.max(0, distance - radius);
    if (effective <= best) {
      best = effective;
      nearest = object;
    }
  }
  return nearest;
}
