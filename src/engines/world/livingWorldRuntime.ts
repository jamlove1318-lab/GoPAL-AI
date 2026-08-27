import { WorldEngine, type ResolvedWorldState } from './worldEngine';
import { EnvironmentEngine, type EnvironmentContext } from './environmentEngine';
import { computeContinuity, type ContinuityResult } from './continuityEngine';
import { eventBus } from '../events/eventBus';
import { loadCassidySnapshot, type CassidySnapshot } from '../../characters/cassidyContext';
import type { TimeOfDay, Season } from '../../lib/types';

export interface ReturnMoment {
  kind: 'none' | 'welcome' | 'continuity' | 'discovery';
  title: string;
  message: string;
}

/**
 * The read-model of GoPAL-AI's living world.
 * Engines continue to own domain state. This runtime composes their current
 * state into one coherent snapshot for the experience layer.
 */
export interface WorldSnapshot {
  generatedAt: string;
  worldId: string | null;
  worldName: string | null;
  locationId: string | null;
  locationName: string | null;
  timeOfDay: TimeOfDay;
  season: Season;
  weather: string;
  ambientAudioKey: string;
  lastActiveAt: string;
  elapsedMs: number;
  continuity: ContinuityResult;
  cassidy: CassidySnapshot;
  returnMoment: ReturnMoment;
}

export interface LivingWorldLoadOptions {
  now?: Date;
  includeCassidy?: boolean;
}

export class LivingWorldRuntime {
  private readonly worldEngine = new WorldEngine();
  private readonly environmentEngine = new EnvironmentEngine();

  async load(userId: string, options: LivingWorldLoadOptions = {}): Promise<WorldSnapshot | null> {
    const now = options.now ?? new Date();
    const world = await this.worldEngine.loadState(userId);
    if (!world) return null;

    const continuity = computeContinuity(world.lastActiveAt, now);
    const environment = this.environmentEngine.resolve(now, world.weather);
    const cassidy = options.includeCassidy === false
      ? emptyCassidySnapshot()
      : await loadCassidySnapshot();
    const snapshot = this.compose(world, environment, continuity, cassidy, now);

    // Arrival is a real world event. Other engines may observe it without the
    // runtime needing to know how they choose to react.
    eventBus.emit('world:returned', {
      userId,
      lastActiveAt: world.lastActiveAt,
    }, 'world');

    return snapshot;
  }

  /** Persist the fact that the learner has returned after the snapshot exists. */
  async markActive(userId: string, now: Date = new Date()): Promise<void> {
    const environment = this.environmentEngine.resolve(now);
    await this.worldEngine.saveState(userId, {
      timeOfDay: environment.timeOfDay,
      season: environment.season,
      lastActiveAt: now.toISOString(),
    });
  }

  private compose(
    world: ResolvedWorldState,
    environment: EnvironmentContext,
    continuity: ContinuityResult,
    cassidy: CassidySnapshot,
    now: Date,
  ): WorldSnapshot {
    const returnMoment = selectReturnMoment(continuity, cassidy);

    return {
      generatedAt: now.toISOString(),
      worldId: world.world?.id ?? null,
      worldName: world.world?.name ?? null,
      locationId: world.location?.id ?? null,
      locationName: world.location?.name ?? null,
      timeOfDay: environment.timeOfDay,
      season: environment.season,
      weather: environment.weather,
      ambientAudioKey: this.environmentEngine.ambientAudioKey(environment),
      lastActiveAt: world.lastActiveAt,
      elapsedMs: continuity.elapsedMs,
      continuity,
      cassidy,
      returnMoment,
    };
  }
}

function selectReturnMoment(continuity: ContinuityResult, cassidy: CassidySnapshot): ReturnMoment {
  if (continuity.newDay || continuity.isNewSeason) {
    const detail = continuity.recap[0] ?? 'Your world continued while you were away.';
    return {
      kind: 'continuity',
      title: 'Welcome back',
      message: detail,
    };
  }

  if (cassidy.souvenirs > 0 || cassidy.threads > 0) {
    return {
      kind: 'discovery',
      title: 'Something is waiting for you',
      message: 'There is a thread of your journey worth revisiting.',
    };
  }

  return {
    kind: 'welcome',
    title: 'You are back',
    message: 'Your world is here, exactly where you left it.',
  };
}

function emptyCassidySnapshot(): CassidySnapshot {
  return {
    returns: 0,
    lastMode: null,
    echoes: 0,
    worldEchoes: 0,
    souvenirs: 0,
    threads: 0,
    decisions: 0,
    bonsaiGrowth: 0,
    radioGrowth: 0,
  };
}
