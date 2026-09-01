export type WorldBehaviorKind = 'idle' | 'wander' | 'patrol' | 'follow-route' | 'schedule' | 'traffic' | 'orbit' | 'animate' | 'spawn' | 'despawn' | 'custom';

export type WorldBehaviorDefinition = {
  id: string;
  kind: WorldBehaviorKind;
  speed?: number;
  radius?: number;
  routeId?: string;
  scheduleId?: string;
  intervalMs?: number;
  enabled?: boolean;
  loop?: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

export const LIVING_WORLD_BEHAVIORS: WorldBehaviorDefinition[] = [
  { id: 'resident-wander', kind: 'wander', speed: 0.6, radius: 8, enabled: true, tags: ['npc'] },
  { id: 'resident-patrol', kind: 'patrol', speed: 0.8, radius: 10, enabled: true, tags: ['npc'] },
  { id: 'vehicle-route', kind: 'follow-route', speed: 1, loop: true, enabled: true, tags: ['vehicle'] },
  { id: 'traffic-flow', kind: 'traffic', speed: 1, enabled: true, tags: ['road'] },
  { id: 'ambient-animation', kind: 'animate', intervalMs: 2400, enabled: true, loop: true, tags: ['world'] },
  { id: 'dynamic-spawn', kind: 'spawn', intervalMs: 12000, enabled: true, tags: ['world'] },
];

export function getWorldBehavior(id: string) { return LIVING_WORLD_BEHAVIORS.find(behavior => behavior.id === id) ?? null; }
