import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { LocalStore, SEED_WORLD } from '../../lib/localStore';
import { WaveStore, StoryLayerState } from '../../lib/waveStore';
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
  lastActiveAt?: string;
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
      ...(patch.lastActiveAt ? { last_active_at: patch.lastActiveAt } : {}),
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

  /* ------------------------------------------------------------
   * Wave 5C: STORY LAYERS IN SPACE
   * Every location carries four optional layers rather than duplicate
   * versions for every story/learner.
   * ------------------------------------------------------------ */
  async getStoryLayer(locationKey: string): Promise<StoryLayerState | null> {
    return WaveStore.getStoryLayer(locationKey);
  }

  async saveStoryLayer(layer: StoryLayerState): Promise<StoryLayerState[]> {
    return WaveStore.saveStoryLayer(layer);
  }

  /* ------------------------------------------------------------
   * Wave 5Y: REVISIT DIFFERENCE SYSTEM
   * When revisiting, surface subtle differences from familiarity,
   * time since last visit, changed knowledge, and story state.
   * Deterministic and explicit — the location stays recognizable.
   * ------------------------------------------------------------ */
  async getRevisitDifference(locationKey: string): Promise<{ note: string | null; visitCount: number }> {
    const stats = await LocalStore.getRevisitStats();
    const rec = stats[locationKey];
    const count = rec?.count ?? 0;
    if (count <= 1) return { note: null, visitCount: count };

    const layer = await WaveStore.getStoryLayer(locationKey);
    const daysSince = rec
      ? Math.floor((Date.now() - new Date(rec.lastVisitedAt).getTime()) / 86400000)
      : 0;

    let note: string | null = null;
    if (daysSince >= 7) note = 'It has been a while — the light feels different here now.';
    else if (layer?.layer4_learnerHistory) note = layer.layer4_learnerHistory;
    else if (count >= 5) note = 'You know this place well; something small may have changed.';

    return { note, visitCount: count };
  }
}
