import { getWorldPlaceHotspots, type WorldPlaceHotspot } from '../../features/learning/components/worldPlaceHotspotCatalog';
import { worldHotspotProgressionEngine } from './worldHotspotProgressionEngine';

export type WorldHotspotRevealState = {
  visible: WorldPlaceHotspot[];
  newlyRevealed: string[];
};

/**
 * Destination progression is dependency-driven: the first object is available,
 * and each object's explicit nextHotspotId is revealed only after completion.
 */
export async function getVisibleWorldHotspots(placeId: string): Promise<WorldHotspotRevealState> {
  const all = getWorldPlaceHotspots(placeId);
  const progress = await worldHotspotProgressionEngine.get();
  const completed = new Set(progress.completed);
  const revealed = new Set(progress.revealed);
  const visible: WorldPlaceHotspot[] = [];

  const addVisible = (hotspot: WorldPlaceHotspot) => {
    if (!visible.some(item => item.id === hotspot.id)) visible.push({ ...hotspot, enabled: true });
  };

  // Preserve intentionally locked discoveries in the scene without making them interactive.
  all.filter(hotspot => hotspot.kind === 'locked').forEach(hotspot => {
    visible.push({ ...hotspot, enabled: false });
  });

  // Previously revealed objects remain visible as part of the destination's memory.
  all.filter(hotspot => hotspot.kind !== 'locked' && revealed.has(hotspot.id)).forEach(addVisible);

  // A brand-new destination starts with exactly one actionable object.
  if (visible.filter(item => item.kind !== 'locked').length === 0 && all[0] && all[0].kind !== 'locked') {
    addVisible(all[0]);
  }

  const newlyRevealed: string[] = [];
  for (const current of all) {
    if (!completed.has(current.id) || !current.nextHotspotId) continue;
    const next = all.find(item => item.id === current.nextHotspotId);
    if (!next || next.kind === 'locked' || revealed.has(next.id)) continue;
    newlyRevealed.push(next.id);
  }

  return { visible, newlyRevealed };
}

export async function completeAndRevealNext(placeId: string, hotspotId: string) {
  const all = getWorldPlaceHotspots(placeId);
  const current = all.find(item => item.id === hotspotId);
  const progress = await worldHotspotProgressionEngine.complete(hotspotId);
  const next = current?.nextHotspotId
    ? all.find(item => item.id === current.nextHotspotId)
    : undefined;

  if (next && next.kind !== 'locked') {
    const latest = await worldHotspotProgressionEngine.resolve(next);
    return { progress: latest.progress, revealed: next };
  }

  return { progress, revealed: null };
}

export const worldHotspotRevealEngine = { getVisible: getVisibleWorldHotspots, completeAndRevealNext };
