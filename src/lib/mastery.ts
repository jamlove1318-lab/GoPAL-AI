const MIN_INTERVAL_DAYS = 1;
const MAX_INTERVAL_DAYS = 365;

export interface MasteryInput {
  masteryScore: number;
  lastSeen: string | null;
  nextReview: string | null;
  quality: number;
}

export interface MasteryOutput {
  masteryScore: number;
  nextReview: string;
  lastSeen: string;
}

export function updateMastery(input: MasteryInput, quality: number, now: Date = new Date()): MasteryOutput {
  const score = Math.max(0, Math.min(1, input.masteryScore + (quality - 0.5) * 0.12));
  const ease = 1 + score * 2.5;
  const days = Math.round(Math.min(MAX_INTERVAL_DAYS, Math.max(MIN_INTERVAL_DAYS, ease)) * (0.5 + quality));
  const next = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return {
    masteryScore: score,
    nextReview: next.toISOString(),
    lastSeen: now.toISOString(),
  };
}

export function isDueForReview(nextReview: string | null, now: Date = new Date()): boolean {
  if (!nextReview) return true;
  return new Date(nextReview).getTime() <= now.getTime();
}
