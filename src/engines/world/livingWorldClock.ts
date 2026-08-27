export type WorldPeriod = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';

export interface LivingWorldClock {
  period: WorldPeriod;
  hour: number;
  minute: number;
  progress: number;
  ambient: 'quiet' | 'gentle' | 'bright' | 'golden' | 'dreamlike';
  greeting: string;
}

/**
 * A lightweight shared clock for world atmosphere.
 * It intentionally uses local time instead of inventing a separate in-app clock.
 */
export function getLivingWorldClock(date = new Date()): LivingWorldClock {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const minutes = hour * 60 + minute;

  let period: WorldPeriod;
  let ambient: LivingWorldClock['ambient'];
  let greeting: string;

  if (minutes < 6 * 60) {
    period = 'night'; ambient = 'dreamlike'; greeting = 'The valley is still dreaming.';
  } else if (minutes < 9 * 60) {
    period = 'dawn'; ambient = 'gentle'; greeting = 'Morning is arriving softly.';
  } else if (minutes < 13 * 60) {
    period = 'morning'; ambient = 'bright'; greeting = 'The valley is waking with you.';
  } else if (minutes < 17 * 60) {
    period = 'afternoon'; ambient = 'bright'; greeting = 'There is still time to wander.';
  } else if (minutes < 20 * 60) {
    period = 'dusk'; ambient = 'golden'; greeting = 'The valley is turning golden.';
  } else {
    period = 'night'; ambient = 'dreamlike'; greeting = 'Lanterns are beginning to glow.';
  }

  const nextBoundary = period === 'night' && minutes >= 20 * 60 ? 24 * 60 + 6 * 60 :
    period === 'dawn' ? 9 * 60 : period === 'morning' ? 13 * 60 : period === 'afternoon' ? 17 * 60 : period === 'dusk' ? 20 * 60 : 6 * 60;
  const startBoundary = period === 'night' && minutes < 6 * 60 ? 20 * 60 - 24 * 60 :
    period === 'dawn' ? 6 * 60 : period === 'morning' ? 9 * 60 : period === 'afternoon' ? 13 * 60 : period === 'dusk' ? 17 * 60 : 20 * 60;
  const current = minutes + (period === 'night' && minutes < 6 * 60 ? 24 * 60 : 0);
  const progress = Math.max(0, Math.min(1, (current - startBoundary) / Math.max(1, nextBoundary - startBoundary)));

  return { period, hour, minute, progress, ambient, greeting };
}
