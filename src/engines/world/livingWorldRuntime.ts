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
    const simulation = await this.simulation.advance(
      userId,
      resolved.world?.id ?? 'emerald-valley',
      resolved.location?.id ?? null,
      this.elapsedMinutes(resolved.lastActiveAt),
    );
    const continuity = resolved.location
      ? await this.worldEngine.getRevisitDifference(resolved.location.id)
      : { note: null, visitCount: 0 };
    return { resolved, simulation, continuity };
  }

  async changeLocation(userId: string, locationId: string): Promise<WorldSnapshot> {
    const previous = await this.worldEngine.loadState(userId);
    await this.worldEngine.setLocation(userId, locationId);
    const resolved = await this.worldEngine.loadState(userId);
    if (!resolved) throw new Error('World state was not readable after changing location.');

    const simulation = await this.simulation.advance(
      userId,
      resolved.world?.id ?? 'emerald-valley',
      locationId,
      this.elapsedMinutes(previous?.lastActiveAt),
    );
    const continuity = await this.worldEngine.getRevisitDifference(locationId);
    return { resolved, simulation, continuity };
  }

  private elapsedMinutes(lastActiveAt?: string | null): number {
    if (!lastActiveAt) return 0;
    const elapsed = Date.now() - new Date(lastActiveAt).getTime();
    if (!Number.isFinite(elapsed) || elapsed < 0) return 0;
    return Math.floor(elapsed / 60000);
  }
}

export const livingWorldRuntime = new LivingWorldRuntime();
