import type { WorldPlaceHotspot } from './WorldPlaceHotspots';

const catalog: Record<string, WorldPlaceHotspot[]> = {
  default: [
    { id: 'landmark', label: 'Local landmark', kind: 'landmark', x: 22, y: 38 },
    { id: 'market', label: 'Market', kind: 'discovery', x: 70, y: 46 },
    { id: 'resident', label: 'Someone nearby', kind: 'resident', x: 52, y: 62 },
    { id: 'path', label: 'Wandering path', kind: 'path', x: 34, y: 74 },
    { id: 'hidden', label: 'Hidden place', kind: 'locked', x: 79, y: 70 },
  ],
};

export function getWorldPlaceHotspots(placeId: string): WorldPlaceHotspot[] {
  return (catalog[placeId] ?? catalog.default).map((item) => ({ ...item }));
}
