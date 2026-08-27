import { deterministicChance, deterministicPick } from '../../lib/rng';
import { resolveSeason } from '../../lib/time';
import type { Season } from '../../lib/types';

export interface ContinuityResult {
  elapsedMs: number;
  newDay: boolean;
  isNewSeason: boolean;
  recap: string[];
}

const RECAP_POOL = [
  'Your review session was prepared',
  'Cassidy has something new to show you',
  'A location now has a new activity',
];

/**
 * Calculate bounded, explainable changes since the last active session.
 * The optional recap is seeded by the calendar day rather than the exact
 * current timestamp, so repeated reads during one return stay stable.
 */
export function computeContinuity(lastActiveAt: string, now: Date = new Date()): ContinuityResult {
  const last = new Date(lastActiveAt);
  const safeLast = Number.isNaN(last.getTime()) ? now : last;
  const elapsedMs = Math.max(0, now.getTime() - safeLast.getTime());
  const newDay = safeLast.toDateString() !== now.toDateString();
  const previousSeason = resolveSeason(safeLast);
  const currentSeason = resolveSeason(now);
  const isNewSeason = previousSeason !== currentSeason;

  const recap: string[] = [];
  if (newDay) recap.push('Your world entered a new day');
  if (isNewSeason) recap.push(`The world entered ${currentSeason}`);

  const dayKey = now.toISOString().slice(0, 10);
  const seed = `${safeLast.toISOString().slice(0, 10)}:${dayKey}:${currentSeason}`;
  if (deterministicChance(seed, 0.4)) {
    const candidates = RECAP_POOL.filter((item) => !recap.includes(item));
    if (candidates.length) recap.push(deterministicPick(candidates, seed));
  }

  return { elapsedMs, newDay, isNewSeason, recap };
}

export type { Season };
