import type { WorldActionId } from './livingWorldActionSystem';
import { eventForAction, WorldEventBus, type WorldEvent } from './livingWorldEvents';
import type { WorldObjectDefinition } from './livingWorldObjects';

export type WorldActionResult = {
  handled: boolean;
  event: WorldEvent;
  stateChanges: Record<string, unknown>;
};

/** Side-effect boundary for world actions. Domain engines can subscribe to the emitted events. */
export class WorldActionExecutor {
  constructor(private readonly events: WorldEventBus = new WorldEventBus()) {}

  get eventBus() { return this.events; }

  execute(locationId: string, object: WorldObjectDefinition, action: WorldActionId, actorId = 'player'): WorldActionResult {
    const stateChanges: Record<string, unknown> = {};
    if (action === 'collect') stateChanges.collected = true;
    if (action === 'discover') stateChanges.discovered = true;
    if (action === 'enter') stateChanges.active = true;
    if (action === 'exit') stateChanges.active = false;
    if (action === 'activate') stateChanges.active = !object.state?.active;
    if (action === 'save') stateChanges.saved = true;
    if (action === 'learn') stateChanges.learningStarted = true;
    if (action === 'quest') stateChanges.questStarted = true;
    if (action === 'travel') stateChanges.travelRequested = true;

    const event = this.events.emit(eventForAction(locationId, object.id, action, actorId, { stateChanges }));
    return { handled: true, event, stateChanges };
  }
}
