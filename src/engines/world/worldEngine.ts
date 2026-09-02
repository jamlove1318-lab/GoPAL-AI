import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { LocalStore, SEED_WORLD } from '../../lib/localStore';
import { WaveStore, StoryLayerState } from '../../lib/waveStore';
import type { LocationsRow, WorldStateRow, WorldsRow } from '../../types/database';
import { resolveSeason, resolveTimeOfDay } from '../../lib/time';
import { getLanguageWorld, getLanguageWorldLocations } from '../../features/world/data/livingLanguageWorlds';

/** Compatibility shape: weather remains a string at runtime while legacy views may probe a `.type` field. */
type WorldWeatherString = string & { readonly type?: string };
export interface ResolvedWorldState { world: WorldsRow | null; location: LocationsRow | null; timeOfDay: WorldStateRow['time_of_day']; season: WorldStateRow['season']; weather: WorldWeatherString; lastActiveAt: string; }
export interface WorldStatePatch { worldId?: string; locationId?: string; timeOfDay?: WorldStateRow['time_of_day']; season?: WorldStateRow['season']; weather?: string; dailyRefreshToken?: string; lastActiveAt?: string; }

function virtualWorld(worldId: string): WorldsRow | null {
  const world = getLanguageWorld(worldId);
  if (!world || world.homeWorld) return worldId === SEED_WORLD.id ? SEED_WORLD : null;
  return { id: world.id, canonical_key: world.id, display_name: world.name, curriculum_ref: world.locale, created_at: new Date(0).toISOString() };
}

function virtualLanguageLocations(worldId: string): LocationsRow[] {
  if (worldId !== 'japanese' && worldId !== 'french') return [];
  return getLanguageWorldLocations(worldId).map((location) => ({
    id: location.id,
    world_id: location.worldId,
    key: location.id,
    name: location.name,
    familiarity_stage: location.unlockOrder === 1 ? 'discovered' : 'unknown',
    unlocked_at: location.unlockOrder === 1 ? new Date(0).toISOString() : null,
  }));
}

function mergeLocations(primary: LocationsRow[], fallback: LocationsRow[]): LocationsRow[] {
  const byId = new Map(primary.map((location) => [location.id, location]));
  for (const location of fallback) if (!byId.has(location.id)) byId.set(location.id, location);
  return [...byId.values()];
}

export class WorldEngine {
  private async loadLocalState(): Promise<ResolvedWorldState> { const state = await LocalStore.getWorldState(); const locations = await LocalStore.getLocations(); const currentLocation = locations.find((l) => l.id === state.location_id) ?? locations[0] ?? null; return { world: SEED_WORLD, location: currentLocation, timeOfDay: state.time_of_day, season: state.season, weather: state.weather as WorldWeatherString, lastActiveAt: state.last_active_at }; }
  async loadState(userId: string): Promise<ResolvedWorldState | null> { if (!isSupabaseConfigured) return this.loadLocalState(); const { data, error } = await supabase.from('world_state').select('*').eq('user_id', userId).maybeSingle(); if (error || !data) return this.loadLocalState(); const locations = await this.listLocations(data.world_id); return { world: await this.getWorld(data.world_id), location: locations.find(location => location.id === data.location_id) ?? locations[0] ?? null, timeOfDay: data.time_of_day, season: data.season, weather: data.weather as WorldWeatherString, lastActiveAt: data.last_active_at }; }
  async ensureState(userId: string, worldId = 'emerald-valley', locationId = 'loc-study-room'): Promise<ResolvedWorldState> { const current = await this.loadState(userId); if (current) return current; await this.setLocation(userId, locationId, worldId); return (await this.loadState(userId)) ?? this.loadLocalState(); }
  async saveState(userId: string, patch: WorldStatePatch): Promise<void> { if (!isSupabaseConfigured) { const current = await this.loadLocalState(); await LocalStore.saveWorldState({ location_id: patch.locationId ?? current.location?.id ?? 'loc-study-room', time_of_day: patch.timeOfDay ?? current.timeOfDay, season: patch.season ?? current.season, weather: patch.weather ?? current.weather, last_active_at: patch.lastActiveAt ?? new Date().toISOString() }); return; } const current = await this.loadState(userId); const worldId = patch.worldId ?? current?.world?.id ?? 'emerald-valley'; const locationId = patch.locationId ?? current?.location?.id ?? locationIdFallback(worldId); await supabase.from('world_state').upsert({ user_id: userId, world_id: worldId, location_id: locationId, time_of_day: patch.timeOfDay ?? current?.timeOfDay ?? resolveTimeOfDay(), season: patch.season ?? current?.season ?? resolveSeason(), weather: patch.weather ?? current?.weather ?? 'clear', last_active_at: patch.lastActiveAt ?? new Date().toISOString(), daily_refresh_token: patch.dailyRefreshToken ?? new Date().toISOString().slice(0,10) }, { onConflict: 'user_id' }); }
  async setLocation(userId: string, locationId: string, worldId?: string): Promise<void> { const current = await this.loadState(userId); await this.saveState(userId, { worldId: worldId ?? current?.world?.id ?? 'emerald-valley', locationId }); }
  async listLocations(worldId: string): Promise<LocationsRow[]> { const virtual = virtualLanguageLocations(worldId); const local = await LocalStore.getLocations(); const scoped = local.filter(location => !location.world_id || location.world_id === worldId); if (!isSupabaseConfigured) return mergeLocations(scoped, virtual); const { data } = await supabase.from('locations').select('*').eq('world_id', worldId); return mergeLocations(data ?? [], mergeLocations(scoped, virtual)); }
  async getWorld(worldId: string): Promise<WorldsRow | null> { if (!isSupabaseConfigured) return virtualWorld(worldId); const { data } = await supabase.from('worlds').select('*').eq('id', worldId).maybeSingle(); return data ?? virtualWorld(worldId); }
  async getStoryLayer(locationKey: string): Promise<StoryLayerState | null> { return WaveStore.getStoryLayer(locationKey); }
  async saveStoryLayer(layer: StoryLayerState): Promise<StoryLayerState[]> { return WaveStore.saveStoryLayer(layer); }
  async getRevisitDifference(locationKey: string): Promise<{ note: string | null; visitCount: number }> { const stats = await LocalStore.getRevisitStats(); const record = stats[locationKey]; const count = record?.count ?? 0; if (count <= 1) return { note: null, visitCount: count }; const layer = await WaveStore.getStoryLayer(locationKey); const daysSince = record ? Math.floor((Date.now() - new Date(record.lastVisitedAt).getTime()) / 86400000) : 0; const note = daysSince >= 7 ? 'It has been a while — the light feels different here now.' : layer?.layer4_learnerHistory ?? (count >= 5 ? 'You know this place well; something small may have changed.' : null); return { note, visitCount: count }; }
  async getRevisitStats() { return LocalStore.getRevisitStats(); }
}
function locationIdFallback(worldId: string) { return virtualLanguageLocations(worldId)[0]?.id ?? 'loc-study-room'; }
