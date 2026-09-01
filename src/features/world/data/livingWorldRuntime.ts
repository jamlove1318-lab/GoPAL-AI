import type { WorldObjectDefinition } from './livingWorldObjects';
import { buildWorldLocation } from './livingWorldLocationFactory';
import type { WorldLocationDefinition } from './livingWorldLocationSchema';
import { findNearestObjectInteraction, type WorldInteractionDefinition } from './livingWorldInteraction';
import { WorldActionExecutor, type WorldActionResult } from './livingWorldActionExecutor';
import type { WorldActionId } from './livingWorldActionSystem';
import { WorldEventBus } from './livingWorldEvents';

export type WorldRuntimeSnapshot = {
  locationId: string;
  player: { x: number; y: number };
  objects: WorldObjectDefinition[];
  nearby: WorldInteractionDefinition | null;
};

/** Runtime coordinator: composes the reusable world catalogs without owning UI. */
export class LivingWorldRuntime {
  readonly events = new WorldEventBus();
  readonly actions = new WorldActionExecutor(this.events);
  private location: WorldLocationDefinition;
  private player = { x: 50, y: 62 };

  constructor(locationId = 'emerald-village') {
    this.location = buildWorldLocation(locationId);
  }

  loadLocation(locationId: string) {
    this.location = buildWorldLocation(locationId);
    this.player = { x: 50, y: 62 };
  }

  getLocation() { return this.location; }
  getObjects() { return this.location.objects; }
  getPlayer() { return { ...this.player }; }

  setPlayerPosition(x: number, y: number) {
    this.player = { x, y };
  }

  getNearbyInteraction() {
    return findNearestObjectInteraction(this.player, this.location.objects)?.interaction ?? null;
  }

  interact(action: WorldActionId): WorldActionResult | null {
    const nearby = findNearestObjectInteraction(this.player, this.location.objects);
    if (!nearby || !nearby.interaction.actions.includes(action)) return null;
    const object = this.location.objects.find(item => item.id === nearby.interaction.targetId);
    if (!object) return null;
    return this.actions.execute(this.location.id, object, action);
  }

  snapshot(): WorldRuntimeSnapshot {
    return { locationId: this.location.id, player: { ...this.player }, objects: [...this.location.objects], nearby: this.getNearbyInteraction() };
  }
}

export function createLivingWorldRuntime(locationId?: string) {
  return new LivingWorldRuntime(locationId);
}
