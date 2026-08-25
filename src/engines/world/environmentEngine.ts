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

export class EnvironmentEngine {
  resolve(date: Date = new Date(), weather: string = 'clear'): EnvironmentContext {
    return {
      timeOfDay: resolveTimeOfDay(date),
      season: resolveSeason(date),
      weather,
    };
  }

  ambientAudioKey(ctx: EnvironmentContext): string {
    return `${ctx.season}.${ctx.timeOfDay}.${ctx.weather}`;
  }
}
