import type { WorldEvent, WorldEventBus } from './livingWorldEvents';
import type { WorldGameplayDefinition } from './livingWorldGameplay';

export type WorldGameKind = 'arena' | 'challenge' | 'minigame';
export type WorldGameLevelDefinition = {
  id: string;
  locationId: string;
  name: string;
  kind: WorldGameKind;
  gameplayObjectIds: string[];
  minigameId?: string;
  transitionTargetId?: string;
  metadata?: Record<string, unknown>;
};
export type WorldGameState = { gameId: string; started: boolean; completed: boolean; failed: boolean; checkpointId?: string; challengeIndex: number; score: number; plays: number };

const GAME_KINDS = new Set(['game-start', 'checkpoint', 'hazard', 'moving-platform', 'trigger', 'game-over', 'puzzle']);
export function buildWorldGameLevels(locationId: string, objects: WorldGameplayDefinition[]): WorldGameLevelDefinition[] {
  const ids = objects.filter(object => GAME_KINDS.has(object.kind)).map(object => object.id);
  if (!ids.length) return [];
  const start = objects.find(object => object.kind === 'game-start');
  return [{ id: `game:${locationId}`, locationId, name: locationId === 'game-arena' ? 'Chaos Arena' : 'World Challenge', kind: locationId === 'game-arena' ? 'arena' : 'challenge', gameplayObjectIds: ids, minigameId: 'world-reusable-minigame', metadata: { source: 'canonical-gameplay', reusable: true, mechanics: ['movement', 'timing', 'matching', 'investigation', 'choice'] }, transitionTargetId: start?.targetId }];
}

export class LivingWorldGameEngine {
  private readonly levels: WorldGameLevelDefinition[];
  private readonly states = new Map<string, WorldGameState>();
  constructor(private readonly events: WorldEventBus, private readonly locationId: string, objects: WorldGameplayDefinition[]) {
    this.levels = buildWorldGameLevels(locationId, objects);
    for (const level of this.levels) this.states.set(level.id, { gameId: level.id, started: false, completed: false, failed: false, challengeIndex: 0, score: 0, plays: 0 });
  }
  getLevels() { return [...this.levels]; }
  getState(gameId: string) { return this.states.get(gameId) ?? null; }
  getAllStates() { return [...this.states.values()]; }
  start(gameId = this.levels[0]?.id, actorId = 'player') {
    if (!gameId) return null;
    const state = this.states.get(gameId);
    const level = this.levels.find(item => item.id === gameId);
    if (!state || !level) return null;
    state.started = true; state.failed = false; state.plays += 1;
    this.events.emit({ id: `game-start-${Date.now()}-${gameId}`, type: 'game-started', timestamp: Date.now(), locationId: this.locationId, actorId, targetId: gameId, payload: { level } });
    return state;
  }
  checkpoint(gameId: string, checkpointId: string, actorId = 'player') {
    const state = this.states.get(gameId); if (!state || !state.started || state.completed || state.failed) return null;
    state.checkpointId = checkpointId;
    this.events.emit({ id: `checkpoint-${Date.now()}-${checkpointId}`, type: 'checkpoint-reached', timestamp: Date.now(), locationId: this.locationId, objectId: checkpointId, actorId, targetId: gameId, payload: { gameId } });
    return state;
  }
  complete(gameId: string, score = 0, actorId = 'player') {
    const state = this.states.get(gameId); if (!state || state.completed) return state ?? null;
    state.started = true; state.completed = true; state.failed = false; state.score = Math.max(state.score, score);
    this.events.emit({ id: `game-complete-${Date.now()}-${gameId}`, type: 'game-completed', timestamp: Date.now(), locationId: this.locationId, actorId, targetId: gameId, payload: { score: state.score } });
    return state;
  }
  fail(gameId: string, reason?: string, actorId = 'player') {
    const state = this.states.get(gameId); if (!state || state.completed) return state ?? null;
    state.failed = true;
    this.events.emit({ id: `game-fail-${Date.now()}-${gameId}`, type: 'game-failed', timestamp: Date.now(), locationId: this.locationId, actorId, targetId: gameId, payload: { reason } });
    return state;
  }
  handleEvent(event: WorldEvent) {
    const state = [...this.states.values()].find(item => !item.completed && !item.failed && item.started);
    if (!state) return null;
    if (event.type === 'checkpoint-reached') return this.checkpoint(state.gameId, event.objectId ?? 'checkpoint', event.actorId);
    return null;
  }
}
