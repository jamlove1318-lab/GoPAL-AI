import type { WorldTheme } from '../components/LivingWorldPrimitives';

export type WorldInfrastructureKind =
  | 'road' | 'sidewalk' | 'intersection' | 'bridge' | 'tunnel'
  | 'railway-crossing' | 'traffic-signal' | 'street-light'
  | 'bus-stop' | 'parking' | 'dock' | 'harbor' | 'pier'
  | 'runway' | 'taxiway' | 'helipad' | 'power-line' | 'utility';

export type WorldInfrastructureDefinition = {
  id: string;
  kind: WorldInfrastructureKind;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scale?: number;
  theme?: WorldTheme;
  label?: string;
  interactive?: boolean;
  zIndex?: number;
  variant?: string;
};

export type WorldInfrastructureNetwork = {
  id: string;
  kind: WorldInfrastructureKind;
  points: { x: number; y: number }[];
  width: number;
  variant?: string;
  theme?: WorldTheme;
};

/** Shared infrastructure catalog. Locations compose these definitions; games can reuse them too. */
export const LIVING_WORLD_INFRASTRUCTURE: Record<string, WorldInfrastructureDefinition[]> = {
  'emerald-village': [
    { id: 'emerald-bus-stop', kind: 'bus-stop', x: 58, y: 53, scale: 1, label: 'Valley Bus Stop', interactive: true, zIndex: 18 },
    { id: 'emerald-crossing', kind: 'railway-crossing', x: 45, y: 67, scale: 1, label: 'Rail Crossing', interactive: true, zIndex: 18 },
    { id: 'emerald-bridge', kind: 'bridge', x: 42, y: 54, width: 16, height: 8, rotation: 12, variant: 'stone', zIndex: 16 },
    { id: 'emerald-lamp-01', kind: 'street-light', x: 64, y: 48, scale: .8, zIndex: 19 },
    { id: 'emerald-lamp-02', kind: 'street-light', x: 52, y: 61, scale: .8, zIndex: 19 },
  ],
  'learning-campus': [
    { id: 'campus-bus-stop', kind: 'bus-stop', x: 53, y: 57, scale: 1, label: 'Campus Shuttle', interactive: true, zIndex: 18 },
    { id: 'campus-parking', kind: 'parking', x: 80, y: 57, width: 18, height: 11, variant: 'student', zIndex: 8 },
    { id: 'campus-helipad', kind: 'helipad', x: 31, y: 19, scale: .8, variant: 'rescue', zIndex: 8 },
  ],
};

export const LIVING_INFRASTRUCTURE_NETWORKS: Record<string, WorldInfrastructureNetwork[]> = {
  'emerald-village': [
    { id: 'emerald-road-main', kind: 'road', points: [{x:-5,y:62},{x:22,y:56},{x:45,y:51},{x:70,y:43},{x:105,y:40}], width: 24, variant: 'village' },
    { id: 'emerald-road-south', kind: 'road', points: [{x:44,y:51},{x:42,y:72},{x:38,y:96}], width: 18, variant: 'village' },
  ],
  'learning-campus': [
    { id: 'campus-road-loop', kind: 'road', points: [{x:2,y:54},{x:28,y:50},{x:52,y:53},{x:76,y:58},{x:103,y:55}], width: 22, variant: 'campus' },
    { id: 'campus-sidewalk', kind: 'sidewalk', points: [{x:24,y:50},{x:42,y:40},{x:61,y:47},{x:76,y:58}], width: 7, variant: 'paved' },
  ],
};

export function getWorldInfrastructure(locationId: string) {
  return LIVING_WORLD_INFRASTRUCTURE[locationId] ?? [];
}

export function getWorldInfrastructureNetworks(locationId: string) {
  return LIVING_INFRASTRUCTURE_NETWORKS[locationId] ?? [];
}
