import { getWorldPlaceHotspots, type WorldPlaceHotspot } from '../../features/learning/components/worldPlaceHotspotCatalog';
import { worldHotspotProgressionEngine } from './worldHotspotProgressionEngine';

export type WorldHotspotRevealState = { visible: WorldPlaceHotspot[]; newlyRevealed: string[] };

export async function getVisibleWorldHotspots(placeId: string): Promise<WorldHotspotRevealState> {
  const all = getWorldPlaceHotspots(placeId);
  const progress = await worldHotspotProgressionEngine.get();
  const completed = new Set(progress.completed);
  const revealed = new Set(progress.revealed);
  const visible: WorldPlaceHotspot[] = [];
  const addVisible = (hotspot: WorldPlaceHotspot) => { if (!visible.some(item => item.id === hotspot.id)) visible.push({ ...hotspot, enabled: true }); };

  all.filter(h => h.kind === 'locked').forEach(h => visible.push({ ...h, enabled: false }));
  all.filter(h => h.kind !== 'locked' && revealed.has(h.id)).forEach(addVisible);
  if (visible.filter(item => item.kind !== 'locked').length === 0 && all[0] && all[0].kind !== 'locked') addVisible(all[0]);

  const newlyRevealed: string[] = [];
  for (const current of all) {
    if (!completed.has(current.id) || !current.nextHotspotId) continue;
    const next = all.find(item => item.id === current.nextHotspotId);
    if (next && next.kind !== 'locked' && !revealed.has(next.id)) newlyRevealed.push(next.id);
  }
  return { visible, newlyRevealed };
}

export async function completeAndRevealNext(placeId: string, hotspotId: string) {
  const all = getWorldPlaceHotspots(placeId);
  const current = all.find(item => item.id === hotspotId);
  const next = current?.nextHotspotId ? all.find(item => item.id === current.nextHotspotId) : undefined;
  return worldHotspotProgressionEngine.completeAndReveal(current ?? { id: hotspotId } as WorldPlaceHotspot, next);
}

export const worldHotspotRevealEngine = { getVisible: getVisibleWorldHotspots, completeAndRevealNext };
