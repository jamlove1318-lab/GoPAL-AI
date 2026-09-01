import type { WorldObjectDefinition } from './livingWorldObjects';
import { buildWorldLocation } from './livingWorldLocationFactory';
import type { WorldLocationDefinition } from './livingWorldLocationSchema';
import { findNearestObjectInteraction, type WorldInteractionDefinition } from './livingWorldInteraction';
import { WorldActionExecutor, type WorldActionResult } from './livingWorldActionExecutor';
import type { WorldActionId } from './livingWorldActionSystem';
import { WorldEventBus } from './livingWorldEvents';
import { clampWorldPoint, resolveMovement } from '../geometry/livingWorldGeometry';

export type WorldRuntimeSnapshot = {
  locationId: string;
  player: { x: number; y: number };
  objects: WorldObjectDefinition[];
  nearby: WorldInteractionDefinition | null;
};

/** UI-independent coordinator for the reusable living-world simulation. */
export class LivingWorldRuntime {
  readonly events = new WorldEventBus();
  readonly actions = new WorldActionExecutor(this.events);
  private location: WorldLocationDefinition;
  private player = { x: 50, y: 62 };

  constructor(locationId = 'emerald-village') { this.location = buildWorldLocation(locationId); }

  loadLocation(locationId: string) {
    this.location = buildWorldLocation(locationId);
    this.player = { x: 50, y: 62 };
  }

  getLocation() { return this.location; }
  getObjects() { return this.location.objects; }
  getPlayer() { return { ...this.player }; }

  setPlayerPosition(x: number, y: number) {
    const bounds = this.location.rules?.walkableBounds;
    this.player = clampWorldPoint({ x, y }, bounds?.minX ?? 6, bounds?.maxX ?? 94, bounds?.minY ?? 12, bounds?.maxY ?? 91);
  }

  movePlayer(dx: number, dy: number) {
    const desired = { x: this.player.x + dx, y: this.player.y + dy };
    const solidObjects = this.location.objects.filter(object => object.collision?.enabled && object.collision.solid !== false).map(object => ({
      x: object.transform.x,
      y: object.transform.y,
      width: object.collision?.width ?? 0,
      height: object.collision?.height ?? 0,
      padding: object.collision?.padding ?? 0,
    }));
    const resolved = resolveMovement(this.player, desired, solidObjects);
    this.setPlayerPosition(resolved.x, resolved.y);
    return this.getPlayer();
  }

  getNearbyInteraction() { return findNearestObjectInteraction(this.player, this.location.objects)?.interaction ?? null; }

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

export function createLivingWorldRuntime(locationId?: string) { return new LivingWorldRuntime(locationId); }
