import { eventBus } from '../events/eventBus';
import { WorldEngine, type ResolvedWorldState } from './worldEngine';
import { livingWorldSimulation, type LivingWorldSnapshot } from './livingWorldSimulation';

export interface WorldContinuity { note: string | null; visitCount: number; newDay: boolean; isNewSeason: boolean; recap: string[]; }
export interface WorldSnapshot { resolved: ResolvedWorldState; simulation: LivingWorldSnapshot; continuity: WorldContinuity; }

/** Canonical bridge between persisted world state and the living-world simulation. */
export class LivingWorldRuntime {
  constructor(private readonly worldEngine = new WorldEngine(), private readonly simulation = livingWorldSimulation) {}

  async load(userId: string): Promise<WorldSnapshot> {
    const resolved = await this.worldEngine.ensureState(userId, 'emerald-valley', 'loc-study-room');
    const previousLastActiveAt = resolved.lastActiveAt;
    const elapsedMinutes = this.elapsedMinutes(previousLastActiveAt);
    const now = new Date().toISOString();
    const simulation = await this.simulation.advance(userId, resolved.world?.id ?? 'emerald-valley', resolved.location?.id ?? null, elapsedMinutes);
    await this.worldEngine.saveState(userId, { lastActiveAt: now });
    const basic = resolved.location ? await this.worldEngine.getRevisitDifference(resolved.location.id) : { note: null, visitCount: 0 };
    return { resolved: { ...resolved, lastActiveAt: now }, simulation, continuity: this.buildContinuity(basic, previousLastActiveAt, simulation.season) };
  }

  async changeLocation(userId: string, locationId: string): Promise<WorldSnapshot> {
    const previous = await this.worldEngine.loadState(userId);
    const worldId = previous?.world?.id ?? 'emerald-valley';
    const locations = await this.worldEngine.listLocations(worldId);
    const destination = locations.find(location => location.id === locationId);
    if (!destination) throw new Error(`Location ${locationId} does not belong to world ${worldId}.`);
    const elapsedMinutes = this.elapsedMinutes(previous?.lastActiveAt);
    await this.worldEngine.setLocation(userId, locationId);
    const now = new Date().toISOString();
    await this.worldEngine.saveState(userId, { lastActiveAt: now });
    const resolved = await this.worldEngine.loadState(userId);
    if (!resolved) throw new Error('World state was not readable after changing location.');
    const simulation = await this.simulation.advance(userId, resolved.world?.id ?? worldId, locationId, elapsedMinutes);
    const basic = await this.worldEngine.getRevisitDifference(locationId);
    eventBus.emit('world:locationChanged', { locationId, userId, previousLocationId: previous?.location?.id ?? undefined }, 'world');
    return { resolved: { ...resolved, lastActiveAt: now }, simulation, continuity: this.buildContinuity(basic, previous?.lastActiveAt, simulation.season) };
  }

  private buildContinuity(basic: { note: string | null; visitCount: number }, previousLastActiveAt: string | undefined, currentSeason: string): WorldContinuity {
    const previous = previousLastActiveAt ? new Date(previousLastActiveAt) : null;
    const now = new Date();
    const newDay = !!previous && previous.toDateString() !== now.toDateString();
    const previousSeason = previous ? this.seasonFor(previous) : currentSeason;
    const isNewSeason = !!previous && previousSeason !== currentSeason;
    const recap: string[] = [];
    if (newDay) recap.push('A new day has begun in Emerald Valley.');
    if (isNewSeason) recap.push(`The valley has entered ${currentSeason}.`);
    if (basic.note) recap.push(basic.note);
    return { ...basic, newDay, isNewSeason, recap };
  }

  private seasonFor(date: Date): string { const month = date.getMonth(); if (month === 11 || month <= 1) return 'winter'; if (month <= 4) return 'spring'; if (month <= 7) return 'summer'; return 'autumn'; }
  private elapsedMinutes(lastActiveAt?: string | null): number { if (!lastActiveAt) return 0; const timestamp = new Date(lastActiveAt).getTime(); if (!Number.isFinite(timestamp)) return 0; const elapsed = Date.now() - timestamp; return elapsed < 0 ? 0 : Math.floor(elapsed / 60000); }
}

export const livingWorldRuntime = new LivingWorldRuntime();
