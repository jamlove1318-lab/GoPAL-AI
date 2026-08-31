import type { WorldPlaceHotspot } from './WorldPlaceHotspots';

const catalog: Record<string, WorldPlaceHotspot[]> = {
  'kyoto-gion': [
    { id: 'gion-street', label: 'Gion street', kind: 'landmark', x: 25, y: 40, nextHotspotId: 'tea-house' },
    { id: 'tea-house', label: 'Tea house', kind: 'discovery', x: 69, y: 45, scenarioIds: ['ja-kyoto-tea-order'], nextHotspotId: 'local-resident' },
    { id: 'local-resident', label: 'Local resident', kind: 'resident', x: 51, y: 62, nextHotspotId: 'lantern-path' },
    { id: 'lantern-path', label: 'Lantern path', kind: 'path', x: 34, y: 75, nextHotspotId: 'hidden-alley' },
    { id: 'hidden-alley', label: 'Hidden alley', kind: 'locked', x: 79, y: 71 },
  ],
  'shibuya-crossing': [
    { id: 'crossing', label: 'Shibuya Crossing', kind: 'landmark', x: 27, y: 40, scenarioIds: ['ja-tokyo-station-listening'], nextHotspotId: 'cafe' },
    { id: 'cafe', label: 'Café', kind: 'discovery', x: 69, y: 46, nextHotspotId: 'commuter' },
    { id: 'commuter', label: 'Someone nearby', kind: 'resident', x: 52, y: 63, nextHotspotId: 'side-street' },
    { id: 'side-street', label: 'Side street', kind: 'path', x: 35, y: 75, nextHotspotId: 'rooftop' },
    { id: 'rooftop', label: 'Rooftop view', kind: 'locked', x: 79, y: 70 },
  ],
  'osaka-dotonbori': [
    { id: 'dotonbori-street', label: 'Dotonbori street', kind: 'landmark', x: 24, y: 41, nextHotspotId: 'food-stall' },
    { id: 'food-stall', label: 'Food stall', kind: 'discovery', x: 69, y: 46, nextHotspotId: 'street-vendor' },
    { id: 'street-vendor', label: 'Street vendor', kind: 'resident', x: 52, y: 62, nextHotspotId: 'canal-walk' },
    { id: 'canal-walk', label: 'Canal walk', kind: 'path', x: 35, y: 75 },
    { id: 'neon-view', label: 'Neon view', kind: 'locked', x: 79, y: 70 },
  ],
  kanazawa: [
    { id: 'kanazawa-garden', label: 'Kenroku-en', kind: 'landmark', x: 24, y: 40, nextHotspotId: 'craft-shop' },
    { id: 'craft-shop', label: 'Craft shop', kind: 'discovery', x: 69, y: 46, scenarioIds: ['ja-kanazawa-market-reading'], nextHotspotId: 'artisan' },
    { id: 'artisan', label: 'Local artisan', kind: 'resident', x: 52, y: 62, nextHotspotId: 'garden-path' },
    { id: 'garden-path', label: 'Garden path', kind: 'path', x: 35, y: 75 },
    { id: 'hidden-workshop', label: 'Hidden workshop', kind: 'locked', x: 79, y: 70 },
  ],
  'fukuoka-hakata': [
    { id: 'hakata-street', label: 'Hakata street', kind: 'landmark', x: 24, y: 40, nextHotspotId: 'ramen-stall' },
    { id: 'ramen-stall', label: 'Ramen stall', kind: 'discovery', x: 69, y: 46, nextHotspotId: 'stall-owner' },
    { id: 'stall-owner', label: 'Stall owner', kind: 'resident', x: 52, y: 62, nextHotspotId: 'canal-path' },
    { id: 'canal-path', label: 'Canal path', kind: 'path' },
    { id: 'night-market', label: 'Night market', kind: 'locked', x: 79, y: 70 },
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