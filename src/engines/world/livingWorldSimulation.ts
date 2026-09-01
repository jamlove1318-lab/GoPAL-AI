import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventBus } from '../events/eventBus';

export type WorldSimulationPhase = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
export type WorldWeather = 'clear' | 'cloudy' | 'rain' | 'wind' | 'snow';

export interface LivingWorldSnapshot {
  worldId: string;
  locationId: string | null;
  phase: WorldSimulationPhase;
  weather: WorldWeather;
  season: string;
  day: number;
  visits: number;
  lastUpdatedAt: string;
}

const keyFor = (userId: string) => `gopal:living-world:v1:${userId.trim() || 'local-explorer-user'}`;

const phaseFromHour = (hour: number): WorldSimulationPhase => {
  if (hour < 6) return 'night';
  if (hour < 12) return hour < 9 ? 'dawn' : 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
};

const weatherFor = (seed: number): WorldWeather => {
  const options: WorldWeather[] = ['clear', 'cloudy', 'wind', 'rain', 'snow'];
  return options[Math.abs(seed) % options.length];
};

export class LivingWorldSimulation {
  async hydrate(userId: string, fallbackWorldId = 'emerald-valley', fallbackLocationId: string | null = null): Promise<LivingWorldSnapshot> {
    const existing = await this.get(userId);
    if (existing) return existing;
    return this.advance(userId, fallbackWorldId, fallbackLocationId, 0);
  }

  async get(userId: string): Promise<LivingWorldSnapshot | null> {
    try {
      const raw = await AsyncStorage.getItem(keyFor(userId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as LivingWorldSnapshot;
      if (!parsed || typeof parsed !== 'object' || typeof parsed.worldId !== 'string') return null;
      return parsed;
    } catch {
      return null;
    }
  }

  async advance(
    userId: string,
    worldId: string,
    locationId: string | null,
    elapsedMinutes = 0,
  ): Promise<LivingWorldSnapshot> {
    const previous = await this.get(userId);
    const now = new Date();
    const day = Math.floor(now.getTime() / 86400000);
    const seed = Math.floor(now.getTime() / 3600000) + day;
    const snapshot: LivingWorldSnapshot = {
      worldId,
      locationId,
      phase: phaseFromHour(now.getHours()),
      weather: weatherFor(seed),
      season: this.resolveSeason(now),
      day,
      visits: (previous?.visits ?? 0) + (locationId && previous?.locationId !== locationId ? 1 : 0),
      lastUpdatedAt: now.toISOString(),
    };

    try {
      await AsyncStorage.setItem(keyFor(userId), JSON.stringify(snapshot));
    } catch {
      // The in-memory result is still useful if persistence is temporarily unavailable.
    }

    if (locationId && previous?.locationId !== locationId) {
      eventBus.emit('world:destinationLifeShifted', {
        worldId,
        placeId: locationId,
        elapsedMinutes: Math.max(0, elapsedMinutes),
        visits: snapshot.visits,
        phase: snapshot.visits <= 1 ? 'first-visit' : snapshot.visits >= 5 ? 'returning' : 'recent',
      }, 'world');
    }

    return snapshot;
  }

  private resolveSeason(date: Date): string {
    const month = date.getMonth();
    if (month === 11 || month <= 1) return 'winter';
    if (month <= 4) return 'spring';
    if (month <= 7) return 'summer';
    if (month <= 10) return 'autumn';
    return 'winter';
  }
}

export const livingWorldSimulation = new LivingWorldSimulation();
