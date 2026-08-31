import { LocalStore } from '../../lib/localStore';
import type { WorldPlaceHotspot } from '../../features/learning/components/WorldPlaceHotspots';
import { resolveWorldHotspotExperience } from './worldHotspotExperienceEngine';

export type HotspotProgress = { completed: string[]; revealed: string[] };
const KEY = 'world_hotspot_progress_v1';

async function read(): Promise<HotspotProgress> {
  return LocalStore.get<HotspotProgress>(KEY, { completed: [], revealed: [] });
}
async function write(value: HotspotProgress) { await LocalStore.set(KEY, value); }

export async function getHotspotProgress(): Promise<HotspotProgress> { return read(); }

export async function resolveHotspot(hotspot: WorldPlaceHotspot) {
  const experience = resolveWorldHotspotExperience(hotspot);
  const progress = await read();
  const known = progress.revealed.includes(hotspot.id);
  if (!known && experience.mode !== 'locked') {
    progress.revealed.push(hotspot.id);
    await write(progress);
  }
  return { hotspot, experience, progress, newlyRevealed: !known && experience.mode !== 'locked' };
}

export async function completeHotspot(hotspotId: string) {
  const progress = await read();
  if (!progress.completed.includes(hotspotId)) progress.completed.push(hotspotId);
  if (!progress.revealed.includes(hotspotId)) progress.revealed.push(hotspotId);
  await write(progress);
  return progress;
}

/** Atomically records completion and reveals the explicit next hotspot. */
export async function completeAndRevealHotspot(hotspot: WorldPlaceHotspot, next?: WorldPlaceHotspot) {
  const progress = await read();
  if (!progress.completed.includes(hotspot.id)) progress.completed.push(hotspot.id);
  if (!progress.revealed.includes(hotspot.id)) progress.revealed.push(hotspot.id);
  if (next && next.kind !== 'locked' && !progress.revealed.includes(next.id)) {
    progress.revealed.push(next.id);
  }
  await write(progress);
  return { progress, revealed: next && next.kind !== 'locked' ? next : null };
}

export const worldHotspotProgressionEngine = { get: getHotspotProgress, resolve: resolveHotspot, complete: completeHotspot, completeAndReveal: completeAndRevealHotspot };