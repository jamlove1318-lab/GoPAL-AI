import { eventBus } from '../events/eventBus';
import { WorldEngine, type ResolvedWorldState } from './worldEngine';
import { livingWorldSimulation, type LivingWorldSnapshot } from './livingWorldSimulation';

export interface WorldSnapshot {
  resolved: ResolvedWorldState;
  simulation: LivingWorldSnapshot;
  continuity: { note: string | null; visitCount: number };
}

/** Canonical bridge between persisted world state and the living-world simulation. */
export class LivingWorldRuntime {
  constructor(
    private readonly worldEngine = new WorldEngine(),
    private readonly simulation = livingWorldSimulation,
  ) {}

  async load(userId: string): Promise<WorldSnapshot> {
    const resolved = await this.worldEngine.ensureState(userId, 'emerald-valley', 'loc-study-room');

    // Capture the persisted timestamp BEFORE touching it. Otherwise every load
    // reports zero elapsed world time and the simulation never observes time
    // spent away from the app.
    const previousLastActiveAt = resolved.lastActiveAt;
    const elapsedMinutes = this.elapsedMinutes(previousLastActiveAt);
    const now = new Date().toISOString();

    const simulation = await this.simulation.advance(
      userId,
      resolved.world?.id ?? 'emerald-valley',
      resolved.location?.id ?? null,
      elapsedMinutes,
    );

    await this.worldEngine.saveState(userId, { lastActiveAt: now });
    const continuity = resolved.location
      ? await this.worldEngine.getRevisitDifference(resolved.location.id)
      : { note: null, visitCount: 0 };

    return { resolved: { ...resolved, lastActiveAt: now }, simulation, continuity };
  }

  async changeLocation(userId: string, locationId: string): Promise<WorldSnapshot> {
    const previous = await this.worldEngine.loadState(userId);
    const worldId = previous?.world?.id ?? 'emerald-valley';
    const locations = await this.worldEngine.listLocations(worldId);
    const destination = locations.find((location) => location.id === locationId);
    if (!destination) throw new Error(`Location ${locationId} does not belong to world ${worldId}.`);

    const elapsedMinutes = this.elapsedMinutes(previous?.lastActiveAt);
    await this.worldEngine.setLocation(userId, locationId);
    const now = new Date().toISOString();
    await this.worldEngine.saveState(userId, { lastActiveAt: now });
    const resolved = await this.worldEngine.loadState(userId);
    if (!resolved) throw new Error('World state was not readable after changing location.');

    const simulation = await this.simulation.advance(
      userId,
      resolved.world?.id ?? worldId,
      locationId,
      elapsedMinutes,
    );
    const continuity = await this.worldEngine.getRevisitDifference(locationId);
    eventBus.emit('world:locationChanged', {
      locationId,
      userId,
      previousLocationId: previous?.location?.id ?? undefined,
    }, 'world');
    return { resolved: { ...resolved, lastActiveAt: now }, simulation, continuity };
  }

  private elapsedMinutes(lastActiveAt?: string | null): number {
    if (!lastActiveAt) return 0;
    const timestamp = new Date(lastActiveAt).getTime();
    if (!Number.isFinite(timestamp)) return 0;
    const elapsed = Date.now() - timestamp;
    if (elapsed < 0) return 0;
    return Math.floor(elapsed / 60000);
  }
}

export const livingWorldRuntime = new LivingWorldRuntime();
