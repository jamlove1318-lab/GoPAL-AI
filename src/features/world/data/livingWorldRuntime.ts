import type { WorldObjectDefinition } from './livingWorldObjects';
import { buildWorldLocation } from './livingWorldLocationFactory';
import type { WorldLocationDefinition } from './livingWorldLocationSchema';
import { findNearestObjectInteraction, type WorldInteractionDefinition } from './livingWorldInteraction';
import { getAvailableWorldActions, type WorldActionId } from './livingWorldActionSystem';
import { WorldActionExecutor, type WorldActionResult } from './livingWorldActionExecutor';
import { createWorldEvent, WorldEventBus } from './livingWorldEvents';
import { clampWorldPoint, resolveMovement } from '../geometry/livingWorldGeometry';

export type WorldRuntimeSnapshot = {
  locationId: string;
  player: { x: number; y: number };
  objects: WorldObjectDefinition[];
  nearby: WorldInteractionDefinition | null;
};

export type WorldInteractionState = {
  interaction: WorldInteractionDefinition | null;
  distance: number | null;
  object: WorldObjectDefinition | null;
};

/** UI-independent coordinator for the reusable living-world simulation. */
export class LivingWorldRuntime {
  readonly events = new WorldEventBus();
  readonly actions = new WorldActionExecutor(this.events);
  private location: WorldLocationDefinition;
  private player = { x: 50, y: 62 };

  constructor(locationId = 'emerald-village') {
    this.location = buildWorldLocation(locationId);
    this.spawnPlayer();
  }

  loadLocation(locationId: string) {
    this.location = buildWorldLocation(locationId);
    this.spawnPlayer();
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
    const solidObjects = this.location.objects
      .filter(object => object.collision?.enabled && object.collision.solid !== false)
      .map(object => ({
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

  getInteractionState(): WorldInteractionState {
    const nearest = findNearestObjectInteraction(this.player, this.location.objects);
    if (!nearest) return { interaction: null, distance: null, object: null };
    const object = this.location.objects.find(item => item.id === nearest.interaction.targetId) ?? null;
    if (!object) return { interaction: null, distance: null, object: null };
    const actions = getAvailableWorldActions({
      object,
      distance: nearest.distance,
      unlocked: object.state?.unlocked !== false,
    }).filter(action => !this.isActionConsumed(object, action.id));
    return {
      interaction: { ...nearest.interaction, actions: actions.map(action => action.id) },
      distance: nearest.distance,
      object,
    };
  }

  getNearbyInteraction() { return this.getInteractionState().interaction; }

  getAvailableActions(): WorldActionId[] {
    return this.getInteractionState().interaction?.actions ?? [];
  }

  interact(action: WorldActionId, actorId = 'player'): WorldActionResult | null {
    const state = this.getInteractionState();
    if (!state.object || state.distance === null || !state.interaction?.actions.includes(action)) return null;

    const result = this.actions.execute(this.location.id, state.object, action, actorId);
    if (!result.handled) return result;

    if (Object.keys(result.stateChanges).length > 0) {
      const previousState = { ...(state.object.state ?? {}) };
      const nextState = { ...previousState, ...result.stateChanges };
      this.location = {
        ...this.location,
        objects: this.location.objects.map(object => object.id === state.object!.id
          ? { ...object, state: nextState }
          : object),
      };

      this.events.emit(createWorldEvent({
        type: 'world-state-changed',
        locationId: this.location.id,
        objectId: state.object.id,
        action,
        actorId,
        payload: {
          previousState,
          stateChanges: { ...result.stateChanges },
          nextState,
        },
      }));
    }

    return result;
  }

  snapshot(): WorldRuntimeSnapshot {
    return {
      locationId: this.location.id,
      player: { ...this.player },
      objects: this.location.objects.map(object => ({
        ...object,
        transform: { ...object.transform },
        visual: object.visual ? { ...object.visual } : undefined,
        collision: object.collision ? { ...object.collision } : undefined,
        interaction: object.interaction ? { ...object.interaction, actions: object.interaction.actions ? [...object.interaction.actions] : undefined } : undefined,
        behavior: object.behavior ? { ...object.behavior } : undefined,
        state: object.state ? { ...object.state } : undefined,
        tags: object.tags ? [...object.tags] : undefined,
        metadata: object.metadata ? { ...object.metadata } : undefined,
      })),
      nearby: this.getNearbyInteraction(),
    };
  }

  private isActionConsumed(object: WorldObjectDefinition, action: WorldActionId) {
    if (action === 'collect') return object.state?.collected === true;
    if (action === 'discover') return object.state?.discovered === true;
    if (action === 'save') return object.state?.saved === true;
    return false;
  }

  private spawnPlayer() {
    const spawn = this.location.objects.find(object => object.category === 'gameplay' && object.type === 'spawn');
    if (spawn) this.setPlayerPosition(spawn.transform.x, spawn.transform.y);
    else this.setPlayerPosition(50, 62);
  }
}

export function createLivingWorldRuntime(locationId?: string) { return new LivingWorldRuntime(locationId); }
