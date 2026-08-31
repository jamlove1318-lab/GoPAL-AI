import { getWorldPlaceHotspots, type WorldPlaceHotspot } from '../../features/learning/components/worldPlaceHotspotCatalog';
import { worldHotspotProgressionEngine } from './worldHotspotProgressionEngine';

export type WorldHotspotRevealState = {
  visible: WorldPlaceHotspot[];
  newlyRevealed: string[];
};

/** Reveals world objects in sequence without making the whole destination available at once. */
export async function getVisibleWorldHotspots(placeId: string): Promise<WorldHotspotRevealState> {
  const all = getWorldPlaceHotspots(placeId);
  const progress = await worldHotspotProgressionEngine.get();
  const completed = new Set(progress.completed);
  const revealed = new Set(progress.revealed);
  const visible: WorldPlaceHotspot[] = [];

  for (const hotspot of all) {
    if (hotspot.kind === 'locked') {
      visible.push({ ...hotspot, enabled: false });
      continue;
    }
    if (revealed.has(hotspot.id) || visible.length === 0) {
      visible.push({ ...hotspot, enabled: true });
    }
  }

  const newlyRevealed: string[] = [];
  for (let index = 0; index < all.length - 1; index += 1) {
    const current = all[index];
    const next = all[index + 1];
    if (completed.has(current.id) && !revealed.has(next.id) && next.kind !== 'locked') {
      newlyRevealed.push(next.id);
    }
  }

  return { visible, newlyRevealed };
}

export async function completeAndRevealNext(placeId: string, hotspotId: string) {
  const progress = await worldHotspotProgressionEngine.complete(hotspotId);
  const all = getWorldPlaceHotspots(placeId);
  const index = all.findIndex(item => item.id === hotspotId);
  const next = index >= 0 ? all[index + 1] : undefined;
  if (next && next.kind !== 'locked') {
    const latest = await worldHotspotProgressionEngine.resolve(next);
    return { progress: latest.progress, revealed: next };
  }
  return { progress, revealed: null };
}

export const worldHotspotRevealEngine = { getVisible: getVisibleWorldHotspots, completeAndRevealNext };
