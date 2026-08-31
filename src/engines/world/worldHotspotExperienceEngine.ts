import type { WorldPlaceHotspot } from '../../features/learning/components/WorldPlaceHotspots';

export type WorldHotspotExperience =
  | { kind: 'resident'; title: string; mode: 'resident-encounter' }
  | { kind: 'discovery'; title: string; mode: 'learning-discovery' }
  | { kind: 'landmark'; title: string; mode: 'cultural-discovery' }
  | { kind: 'path'; title: string; mode: 'exploration' }
  | { kind: 'locked'; title: string; mode: 'locked' };

export function resolveWorldHotspotExperience(hotspot: WorldPlaceHotspot): WorldHotspotExperience {
  switch (hotspot.kind) {
    case 'resident': return { kind: 'resident', title: hotspot.label, mode: 'resident-encounter' };
    case 'discovery': return { kind: 'discovery', title: hotspot.label, mode: 'learning-discovery' };
    case 'landmark': return { kind: 'landmark', title: hotspot.label, mode: 'cultural-discovery' };
    case 'path': return { kind: 'path', title: hotspot.label, mode: 'exploration' };
    default: return { kind: 'locked', title: hotspot.label, mode: 'locked' };
  }
}

export const worldHotspotExperienceEngine = { resolve: resolveWorldHotspotExperience };
