import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { LocalStore, SEED_WORLD } from '../../lib/localStore';
import { WaveStore, StoryLayerState } from '../../lib/waveStore';
import { worldRevisitStore } from './worldRevisitStore';
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

const localWorldStateKey = (userId: string) => `gopal:world-state:v2:${userId.trim() || 'local-explorer-user'}`;

export class WorldEngine {
  private async loadLocalState(userId: string): Promise<ResolvedWorldState> {
    const fallback: WorldStateRow = {
      user_id: userId,
      world_id: SEED_WORLD.id,
      location_id: 'loc-study-room',
      time_of_day: resolveTimeOfDay(),
      season: resolveSeason(),
      weather: 'gentle_breeze',
      last_active_at: new Date().toISOString(),
      daily_refresh_token: `token-${new Date().toDateString()}`,
      updated_at: new Date().toISOString(),
    };
    let state = fallback;
    try {
      const raw = await AsyncStorage.getItem(localWorldStateKey(userId));
      if (raw) state = JSON.parse(raw) as WorldStateRow;
    } catch {}
    const locations = await LocalStore.getLocations();
    const currentLocation = locations.find(l => l.id === state.location_id && l.world_id === state.world_id) ?? locations[0] ?? null;
    return { world: SEED_WORLD, location: currentLocation, timeOfDay: state.time_of_day, season: state.season, weather: state.weather, lastActiveAt: state.last_active_at };
  }

  async loadState(userId: string): Promise<ResolvedWorldState | null> {
    if (!isSupabaseConfigured) return this.loadLocalState(userId);
    try {
      const { data: state, error } = await supabase.from('world_state').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      if (!state) return null;
      let world: WorldsRow | null = null;
      if (state.world_id) {
        const result = await supabase.from('worlds').select('*').eq('id', state.world_id).maybeSingle();
        if (result.error) throw result.error;
        world = result.data;
      }
      let location: LocationsRow | null = null;
      if (state.location_id) {
        const result = await supabase.from('locations').select('*').eq('id', state.location_id).eq('world_id', state.world_id).maybeSingle();
        if (result.error) throw result.error;
        location = result.data;
      }
      return { world: world ?? SEED_WORLD, location, timeOfDay: state.time_of_day, season: state.season, weather: state.weather, lastActiveAt: state.last_active_at };
    } catch { return this.loadLocalState(userId); }
  }

  async ensureState(userId: string, worldId: string, locationId: string | null): Promise<ResolvedWorldState> {
    const existing = await this.loadState(userId);
    if (existing) return existing;
    const timeOfDay = resolveTimeOfDay();
    const season = resolveSeason();
    const now = new Date().toISOString();
    const initialPatch: Partial<WorldStateRow> = { user_id: userId, world_id: worldId, location_id: locationId, time_of_day: timeOfDay, season, weather: 'gentle_breeze', last_active_at: now, daily_refresh_token: '' };
    if (!isSupabaseConfigured) { await this.saveLocalState(userId, initialPatch); return this.loadLocalState(userId); }
    try {
      const { error } = await supabase.from('world_state').upsert({ user_id: userId, ...initialPatch, updated_at: now });
      if (error) throw error;
      const state = await this.loadState(userId);
      if (state) return state;
      throw new Error('World state was not readable after initialization.');
    } catch { await this.saveLocalState(userId, initialPatch); return this.loadLocalState(userId); }
  }

  private async saveLocalState(userId: string, patch: Partial<WorldStateRow>): Promise<void> {
    const current = await this.loadLocalState(userId);
    const locations = await LocalStore.getLocations();
    const currentLocation = locations.find(l => l.id === patch.location_id && l.world_id === (patch.world_id ?? current.world?.id)) ?? current.location;
    const state: WorldStateRow = {
      user_id: userId, world_id: patch.world_id ?? current.world?.id ?? SEED_WORLD.id,
      location_id: patch.location_id !== undefined ? patch.location_id : currentLocation?.id ?? null,
      time_of_day: patch.time_of_day ?? current.timeOfDay, season: patch.season ?? current.season,
      weather: patch.weather ?? current.weather, last_active_at: patch.last_active_at ?? current.lastActiveAt,
      daily_refresh_token: patch.daily_refresh_token ?? `token-${new Date().toDateString()}`, updated_at: new Date().toISOString(),
    };
    try { await AsyncStorage.setItem(localWorldStateKey(userId), JSON.stringify(state)); } catch {}
  }

  async saveState(userId: string, patch: WorldStatePatch): Promise<void> {
    if (patch.locationId !== undefined) {
      const current = await this.loadState(userId);
      const worldId = patch.worldId ?? current?.world?.id;
      if (!worldId) throw new Error('Cannot validate a location without an active world.');
      const locations = await this.listLocations(worldId);
      if (!locations.find(location => location.id === patch.locationId && location.world_id === worldId)) throw new Error(`Location ${patch.locationId} does not belong to world ${worldId}.`);
    }
    const snakePatch: Partial<WorldStateRow> = {
      ...(patch.worldId !== undefined ? { world_id: patch.worldId } : {}), ...(patch.locationId !== undefined ? { location_id: patch.locationId } : {}),
      ...(patch.timeOfDay !== undefined ? { time_of_day: patch.timeOfDay } : {}), ...(patch.season !== undefined ? { season: patch.season } : {}),
      ...(patch.weather !== undefined ? { weather: patch.weather } : {}), ...(patch.dailyRefreshToken !== undefined ? { daily_refresh_token: patch.dailyRefreshToken } : {}),
      ...(patch.lastActiveAt !== undefined ? { last_active_at: patch.lastActiveAt } : {}),
    };
    if (!isSupabaseConfigured) { await this.saveLocalState(userId, snakePatch); return; }
    try { const { error } = await supabase.from('world_state').upsert({ user_id: userId, ...snakePatch, updated_at: new Date().toISOString() }); if (error) throw error; }
    catch { await this.saveLocalState(userId, snakePatch); }
  }

  async listLocations(worldId: string): Promise<LocationsRow[]> {
    if (!isSupabaseConfigured) return LocalStore.getLocations();
    try { const { data, error } = await supabase.from('locations').select('*').eq('world_id', worldId); if (error) throw error; return data ?? []; }
    catch { return LocalStore.getLocations(); }
  }

  async setLocation(userId: string, locationId: string): Promise<void> { await this.saveState(userId, { locationId }); }

  async getStoryLayer(locationKey: string, userId?: string): Promise<StoryLayerState | null> {
    if (userId?.trim()) {
      const consequences = await worldRevisitStore.getStats(userId);
      void consequences;
    }
    return WaveStore.getStoryLayer(locationKey);
  }

  async saveStoryLayer(layer: StoryLayerState): Promise<StoryLayerState[]> { return WaveStore.saveStoryLayer(layer); }

  async getRevisitDifference(locationKey: string, userId: string): Promise<{ note: string | null; visitCount: number }> {
    if (!userId.trim()) return { note: null, visitCount: 0 };
    const stats = await worldRevisitStore.getStats(userId);
    const rec = stats[locationKey];
    const count = rec?.count ?? 0;
    if (count <= 1) return { note: null, visitCount: count };
    const layer = await WaveStore.getStoryLayer(locationKey);
    const daysSince = rec ? Math.floor((Date.now() - new Date(rec.lastVisitedAt).getTime()) / 86400000) : 0;
    let note: string | null = null;
    if (daysSince >= 7) note = 'It has been a while — the light feels different here now.';
    else if (layer?.layer4_learnerHistory) note = layer.layer4_learnerHistory;
    else if (count >= 5) note = 'You know this place well; something small may have changed.';
    return { note, visitCount: count };
  }
}
