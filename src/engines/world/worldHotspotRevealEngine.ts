import { getWorldPlaceHotspots, type WorldPlaceHotspot } from '../../features/learning/components/worldPlaceHotspotCatalog';
import { worldHotspotProgressionEngine } from './worldHotspotProgressionEngine';

export type WorldHotspotRevealState = { visible: WorldPlaceHotspot[]; newlyRevealed: string[]; completed: string[] };
const progressKey = (placeId: string, hotspotId: string) => `${placeId}:${hotspotId}`;
const contains = (items: string[], placeId: string, hotspotId: string) => items.includes(progressKey(placeId, hotspotId)) || items.includes(hotspotId);

export async function getVisibleWorldHotspots(placeId: string): Promise<WorldHotspotRevealState> {
  const all = getWorldPlaceHotspots(placeId);
  const progress = await worldHotspotProgressionEngine.get();
  const visible: WorldPlaceHotspot[] = [];
  const addVisible = (hotspot: WorldPlaceHotspot) => { if (!visible.some(item => item.id === hotspot.id)) visible.push({ ...hotspot, enabled: true }); };

  all.filter(h => h.kind === 'locked').forEach(h => visible.push({ ...h, enabled: false }));
  all.filter(h => h.kind !== 'locked' && contains(progress.revealed, placeId, h.id)).forEach(addVisible);
  if (visible.filter(item => item.kind !== 'locked').length === 0 && all[0] && all[0].kind !== 'locked') addVisible(all[0]);

  const newlyRevealed: string[] = [];
  for (const current of all) {
    if (!contains(progress.completed, placeId, current.id) || !current.nextHotspotId) continue;
    const next = all.find(item => item.id === current.nextHotspotId);
    if (next && next.kind !== 'locked' && !contains(progress.revealed, placeId, next.id)) newlyRevealed.push(next.id);
  }
  return { visible, newlyRevealed, completed: progress.completed };
}

export async function getHotspotProgress() { return worldHotspotProgressionEngine.get(); }

export async function completeAndRevealNext(placeId: string, hotspotId: string) {
  const all = getWorldPlaceHotspots(placeId);
  const current = all.find(item => item.id === hotspotId);
  if (!current) throw new Error(`Unknown hotspot "${hotspotId}" for place "${placeId}"`);
  const next = current.nextHotspotId ? all.find(item => item.id === current.nextHotspotId) : undefined;
  return worldHotspotProgressionEngine.completeAndReveal(current, next);
}

export const worldHotspotRevealEngine = { getVisible: getVisibleWorldHotspots, getProgress: getHotspotProgress, completeAndRevealNext };