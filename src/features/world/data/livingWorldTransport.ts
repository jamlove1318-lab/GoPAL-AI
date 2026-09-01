import type { WorldTheme } from '../components/LivingWorldPrimitives';

export type WorldTransportKind = 'railway' | 'airport';
export type WorldTransportFeatureKind = 'track' | 'platform' | 'runway' | 'taxiway' | 'platform-edge';

export type WorldTransportFeature = {
  id: string;
  kind: WorldTransportFeatureKind;
  path: string;
  width: number;
  color?: string;
  edgeColor?: string;
  edgeWidth?: number;
  opacity?: number;
  zIndex?: number;
};

export type WorldTransportDefinition = {
  id: string;
  kind: WorldTransportKind;
  theme?: WorldTheme;
  features: WorldTransportFeature[];
};

export const LIVING_WORLD_TRANSPORT: Record<string, WorldTransportDefinition[]> = {
  'emerald-village': [{ id: 'emerald-railway', kind: 'railway', features: [
    { id: 'emerald-rail-bed', kind: 'track', path: 'M-20 745C75 700 150 665 230 620C300 580 365 560 430 548', width: 28, color: '#5b5046', edgeColor: '#3b342f', edgeWidth: 3, opacity: .9, zIndex: 4 },
    { id: 'emerald-rail-1', kind: 'track', path: 'M-20 738C75 693 150 658 230 613C300 573 365 553 430 541', width: 3, color: '#b7b1a5', zIndex: 5 },
    { id: 'emerald-rail-2', kind: 'track', path: 'M-20 752C75 707 150 672 230 627C300 587 365 567 430 555', width: 3, color: '#b7b1a5', zIndex: 5 },
    { id: 'emerald-platform', kind: 'platform', path: 'M275 590C320 568 350 558 382 553', width: 32, color: '#c9c0ad', edgeColor: '#817767', edgeWidth: 2, zIndex: 6 },
    { id: 'emerald-platform-edge', kind: 'platform-edge', path: 'M275 584C320 562 350 552 382 547', width: 3, color: '#e8d58f', zIndex: 7 },
  ]}],
  'learning-campus': [{ id: 'campus-airport', kind: 'airport', features: [
    { id: 'campus-runway', kind: 'runway', path: 'M45 120L365 735', width: 92, color: '#5d6262', edgeColor: '#3e4545', edgeWidth: 3, opacity: .92, zIndex: 2 },
    { id: 'campus-runway-center', kind: 'runway', path: 'M70 125L370 705', width: 3, color: '#e9dfb5', zIndex: 3 },
    { id: 'campus-taxiway', kind: 'taxiway', path: 'M190 420C245 405 290 395 345 365', width: 34, color: '#777b78', edgeColor: '#4c514f', edgeWidth: 2, zIndex: 3 },
  ]}],
};

export function getLivingWorldTransport(locationId: string): WorldTransportDefinition[] {
  return LIVING_WORLD_TRANSPORT[locationId] ?? [];
}
