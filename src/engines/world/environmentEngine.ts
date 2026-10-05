import { resolveSeason, resolveTimeOfDay } from '../../lib/time';
import type { Season, TimeOfDay } from '../../lib/types';

export interface EnvironmentContext {
  timeOfDay: TimeOfDay;
  season: Season;
  weather: string;
}

const WEATHER_BY_SEASON: Record<Season, string[]> = {
  spring: ['clear', 'breeze', 'light-rain'],
  summer: ['clear', 'sunny', 'humid'],
  autumn: ['clear', 'windy', 'rain'],
  winter: ['clear', 'snow', 'cold'],
};

/** Deterministic world weather: changes naturally without introducing random render state. */
function weatherFor(date: Date, season: Season): string {
  const day = Math.floor(date.getTime() / 86_400_000);
  const hour = date.getHours();
  const options = WEATHER_BY_SEASON[season];
  return options[Math.abs(day + Math.floor(hour / 6)) % options.length];
}

export class EnvironmentEngine {
  resolve(date: Date = new Date(), weather?: string): EnvironmentContext {
    const season = resolveSeason(date);
    return {
      timeOfDay: resolveTimeOfDay(date),
      season,
      weather: weather ?? weatherFor(date, season),
    };
  }

  ambientAudioKey(ctx: EnvironmentContext): string {
    return `${ctx.season}.${ctx.timeOfDay}.${ctx.weather}`;
  }
}

export const environmentEngine = new EnvironmentEngine();
