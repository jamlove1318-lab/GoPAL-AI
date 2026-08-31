import type { WorldPlaceHotspot } from './WorldPlaceHotspots';

const catalog: Record<string, WorldPlaceHotspot[]> = {
  'kyoto-gion': [
    { id: 'gion-street', label: 'Gion street', kind: 'landmark', x: 25, y: 40, scenarioIds: ['kyoto-gion'] },
    { id: 'tea-house', label: 'Tea house', kind: 'discovery', x: 69, y: 45, scenarioIds: ['kyoto-gion'] },
    { id: 'local-resident', label: 'Local resident', kind: 'resident', x: 51, y: 62, scenarioIds: ['kyoto-gion'] },
    { id: 'lantern-path', label: 'Lantern path', kind: 'path', x: 34, y: 75, scenarioIds: ['kyoto-gion'] },
    { id: 'hidden-alley', label: 'Hidden alley', kind: 'locked', x: 79, y: 71, nextHotspotId: 'tea-house' },
  ],
  'shibuya-crossing': [
    { id: 'crossing', label: 'Shibuya Crossing', kind: 'landmark', x: 27, y: 40, scenarioIds: ['shibuya-crossing'] },
    { id: 'cafe', label: 'Café', kind: 'discovery', x: 69, y: 46, scenarioIds: ['shibuya-crossing'] },
    { id: 'commuter', label: 'Someone nearby', kind: 'resident', x: 52, y: 63, scenarioIds: ['shibuya-crossing'] },
    { id: 'side-street', label: 'Side street', kind: 'path', x: 35, y: 75, scenarioIds: ['shibuya-crossing'] },
    { id: 'rooftop', label: 'Rooftop view', kind: 'locked', x: 79, y: 70 },
  ],
  default: [
    { id: 'landmark', label: 'Local landmark', kind: 'landmark', x: 22, y: 38 },
    { id: 'market', label: 'Market', kind: 'discovery', x: 70, y: 46 },
    { id: 'resident', label: 'Someone nearby', kind: 'resident', x: 52, y: 62 },
    { id: 'path', label: 'Wandering path', kind: 'path', x: 34, y: 74 },
    { id: 'hidden', label: 'Hidden place', kind: 'locked', x: 79, y: 70 },
  ],
};

export function getWorldPlaceHotspots(placeId: string): WorldPlaceHotspot[] { return (catalog[placeId] ?? catalog.default).map((item) => ({ ...item, scenarioIds: item.scenarioIds ? [...item.scenarioIds] : undefined })); }
