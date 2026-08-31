import { LocalStore } from '../../lib/localStore';
import type { WorldPlaceHotspot } from '../../features/learning/components/WorldPlaceHotspots';
import { resolveWorldHotspotExperience } from './worldHotspotExperienceEngine';

export type HotspotProgress = { completed: string[]; revealed: string[] };
const KEY = 'world_hotspot_progress_v1';
const scopedId = (hotspot: Pick<WorldPlaceHotspot,'id'|'placeId'>) => hotspot.placeId ? `${hotspot.placeId}:${hotspot.id}` : hotspot.id;
const has = (items: string[], hotspot: Pick<WorldPlaceHotspot,'id'|'placeId'>) => items.includes(scopedId(hotspot)) || (!hotspot.placeId && items.includes(hotspot.id));

async function read(): Promise<HotspotProgress> { return LocalStore.get<HotspotProgress>(KEY, { completed: [], revealed: [] }); }
async function write(value: HotspotProgress) { await LocalStore.set(KEY, value); }

export async function getHotspotProgress(): Promise<HotspotProgress> { return read(); }

export async function resolveHotspot(hotspot: WorldPlaceHotspot) {
  const experience = resolveWorldHotspotExperience(hotspot);
  const progress = await read();
  const known = has(progress.revealed, hotspot);
  if (!known && experience.mode !== 'locked') {
    progress.revealed.push(scopedId(hotspot));
    await write(progress);
  }
  return { hotspot, experience, progress, newlyRevealed: !known && experience.mode !== 'locked' };
}

export async function completeHotspot(hotspotId: string, placeId?: string) {
  const progress = await read();
  const key = placeId ? `${placeId}:${hotspotId}` : hotspotId;
  if (!progress.completed.includes(key)) progress.completed.push(key);
  if (!progress.revealed.includes(key)) progress.revealed.push(key);
  await write(progress);
  return progress;
}

/** Atomically records completion and reveals the explicit next physical hotspot. */
export async function completeAndRevealHotspot(hotspot: WorldPlaceHotspot, next?: WorldPlaceHotspot) {
  const progress = await read();
  const hotspotKey = scopedId(hotspot);
  if (!progress.completed.includes(hotspotKey)) progress.completed.push(hotspotKey);
  if (!progress.revealed.includes(hotspotKey)) progress.revealed.push(hotspotKey);
  if (next && next.kind !== 'locked') {
    const nextKey = scopedId(next);
    if (!progress.revealed.includes(nextKey)) progress.revealed.push(nextKey);
  }
  await write(progress);
  return { progress, revealed: next && next.kind !== 'locked' ? next : null };
}

export const worldHotspotProgressionEngine = { get: getHotspotProgress, resolve: resolveHotspot, complete: completeHotspot, completeAndReveal: completeAndRevealHotspot };