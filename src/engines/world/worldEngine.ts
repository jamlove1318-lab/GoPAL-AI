import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { LocalStore, SEED_WORLD } from '../../lib/localStore';
import type { LocationsRow, WorldStateRow, WorldsRow } from '../../types/database';
import { resolveSeason, resolveTimeOfDay } from '../../lib/time';

export interface ResolvedWorldState {
  world: WorldsRow | null;
  location: LocationsRow | null;
  timeOfDay: WorldStateRow['time_of_day'];
  season: WorldStateRow['season'];
  weather: string;
  lastActiveAt: string;
}

export interface WorldStatePatch {
  worldId?: string;
  locationId?: string;
  timeOfDay?: WorldStateRow['time_of_day'];
  season?: WorldStateRow['season'];
  weather?: string;
  dailyRefreshToken?: string;
}

export class WorldEngine {
  async loadState(userId: string): Promise<ResolvedWorldState | null> {
    if (!isSupabaseConfigured) {
      const state = await LocalStore.getWorldState();
      const locations = await LocalStore.getLocations();
      const currentLocation = locations.find((l) => l.id === state.location_id) ?? locations[0] ?? null;
      return {
        world: SEED_WORLD,
        location: currentLocation,
        timeOfDay: state.time_of_day,
        season: state.season,
        weather: state.weather,
        lastActiveAt: state.last_active_at,
      };
    }

    try {
      const { data: state } = await supabase
        .from('world_state')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!state) return null;

      const { data: world } = state.world_id
        ? await supabase.from('worlds').select('*').eq('id', state.world_id).maybeSingle()
        : { data: null };

      const { data: location } = state.location_id
        ? await supabase.from('locations').select('*').eq('id', state.location_id).maybeSingle()
        : { data: null };

      return {
        world: world ?? SEED_WORLD,
        location: location ?? null,
        timeOfDay: state.time_of_day,
        season: state.season,
        weather: state.weather,
        lastActiveAt: state.last_active_at,
      };
    } catch {
      const state = await LocalStore.getWorldState();
      const locations = await LocalStore.getLocations();
      const currentLocation = locations.find((l) => l.id === state.location_id) ?? locations[0] ?? null;
      return {
        world: SEED_WORLD,
        location: currentLocation,
        timeOfDay: state.time_of_day,
        season: state.season,
        weather: state.weather,
        lastActiveAt: state.last_active_at,
      };
    }
  }

  async ensureState(userId: string, worldId: string, locationId: string | null): Promise<ResolvedWorldState> {
    const existing = await this.loadState(userId);
    if (existing) return existing;

    const timeOfDay = resolveTimeOfDay();
    const season = resolveSeason();

    if (!isSupabaseConfigured) {
      await LocalStore.saveWorldState({
        world_id: worldId,
        location_id: locationId,
        time_of_day: timeOfDay,
        season,
        weather: 'gentle_breeze',
        last_active_at: new Date().toISOString(),
      });
      return (await this.loadState(userId))!;
    }

    try {
      await supabase.from('world_state').upsert({
        user_id: userId,
        world_id: worldId,
        location_id: locationId,
        time_of_day: timeOfDay,
        season,
        weather: 'gentle_breeze',
        last_active_at: new Date().toISOString(),
        daily_refresh_token: '',
        updated_at: new Date().toISOString(),
      });
      return (await this.loadState(userId))!;
    } catch {
      return (await this.loadState(userId))!;
    }
  }

  async saveState(userId: string, patch: WorldStatePatch): Promise<void> {
    const snakePatch: Partial<WorldStateRow> = {
      ...(patch.worldId ? { world_id: patch.worldId } : {}),
      ...(patch.locationId ? { location_id: patch.locationId } : {}),
      ...(patch.timeOfDay ? { time_of_day: patch.timeOfDay } : {}),
      ...(patch.season ? { season: patch.season } : {}),
      ...(patch.weather ? { weather: patch.weather } : {}),
      ...(patch.dailyRefreshToken ? { daily_refresh_token: patch.dailyRefreshToken } : {}),
    };

    if (!isSupabaseConfigured) {
      await LocalStore.saveWorldState(snakePatch);
      return;
    }

    try {
      await supabase
        .from('world_state')
        .upsert({ user_id: userId, ...snakePatch, updated_at: new Date().toISOString() });
    } catch {
      await LocalStore.saveWorldState(snakePatch);
    }
  }

  async listLocations(worldId: string): Promise<LocationsRow[]> {
    if (!isSupabaseConfigured) {
      return LocalStore.getLocations();
    }
    try {
      const { data } = await supabase.from('locations').select('*').eq('world_id', worldId);
      return data && data.length ? data : LocalStore.getLocations();
    } catch {
      return LocalStore.getLocations();
    }
  }

  async setLocation(userId: string, locationId: string): Promise<void> {
    await this.saveState(userId, { locationId });
  }
}
