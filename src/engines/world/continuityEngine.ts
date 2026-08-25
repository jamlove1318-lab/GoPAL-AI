import { deterministicChance, deterministicPick } from '../../lib/rng';

export interface ContinuityResult {
  elapsedMs: number;
  newDay: boolean;
  isNewSeason: boolean;
  recap: string[];
}

const RECAP_POOL = [
  'Your world entered a new day',
  'A seasonal event became available',
  'Your review session was prepared',
  'Cassidy has something new to show you',
  'A location now has a new activity',
];

export function computeContinuity(lastActiveAt: string, now: Date = new Date()): ContinuityResult {
  const last = new Date(lastActiveAt);
  const elapsedMs = now.getTime() - last.getTime();
  const newDay = last.toDateString() !== now.toDateString();
  const isNewSeason = last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear();

  const recap: string[] = [];
  if (newDay) recap.push('Your world entered a new day');
  if (isNewSeason) recap.push('The season has changed');

  const seed = `${lastActiveAt}:${now.toISOString()}`;
  if (deterministicChance(seed, 0.4)) {
    recap.push(deterministicPick(RECAP_POOL, seed));
  }

  return { elapsedMs, newDay, isNewSeason, recap };
}
