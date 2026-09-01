import type { WorldActionId } from './livingWorldActionSystem';

export type WorldEventType =
  | 'interaction' | 'entered' | 'exited' | 'discovered' | 'collected' | 'learned'
  | 'dialogue-started' | 'quest-started' | 'quest-completed' | 'travel-requested'
  | 'vehicle-boarded' | 'vehicle-ridden' | 'object-activated' | 'world-state-changed';

export type WorldEvent = {
  id: string;
  type: WorldEventType;
  timestamp: number;
  locationId: string;
  objectId?: string;
  action?: WorldActionId;
  actorId?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
};

export type WorldEventListener = (event: WorldEvent) => void;

export class WorldEventBus {
  private listeners = new Set<WorldEventListener>();

  subscribe(listener: WorldEventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: WorldEvent) {
    for (const listener of this.listeners) listener(event);
    return event;
  }

  clear() { this.listeners.clear(); }
}

export function createWorldEvent(input: Omit<WorldEvent, 'id' | 'timestamp'>): WorldEvent {
  return {
    ...input,
    id: `world-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };
}

export function eventForAction(locationId: string, objectId: string, action: WorldActionId, actorId = 'player', payload?: Record<string, unknown>) {
  const type: WorldEventType = action === 'enter' ? 'entered'
    : action === 'exit' ? 'exited'
    : action === 'discover' ? 'discovered'
    : action === 'collect' ? 'collected'
    : action === 'learn' ? 'learned'
    : action === 'talk' ? 'dialogue-started'
    : action === 'quest' ? 'quest-started'
    : action === 'travel' ? 'travel-requested'
    : action === 'board' ? 'vehicle-boarded'
    : action === 'ride' ? 'vehicle-ridden'
    : action === 'activate' ? 'object-activated'
    : 'interaction';
  return createWorldEvent({ type, locationId, objectId, action, actorId, payload });
}
