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

/** Small constructors keep every location declarative and make the catalog reusable by future worlds/games. */
export const infrastructure = (kind: WorldInfrastructureKind, id: string, x: number, y: number, options: Omit<WorldInfrastructureDefinition, 'id'|'kind'|'x'|'y'> = {}): WorldInfrastructureDefinition => ({ id, kind, x, y, ...options });
export const infrastructureNetwork = (kind: WorldInfrastructureKind, id: string, points: {x:number;y:number}[], width: number, options: Omit<WorldInfrastructureNetwork, 'id'|'kind'|'points'|'width'> = {}): WorldInfrastructureNetwork => ({ id, kind, points, width, ...options });

/** Shared infrastructure catalog. Locations compose these definitions; games can reuse them too. */
export const LIVING_WORLD_INFRASTRUCTURE: Record<string, WorldInfrastructureDefinition[]> = {
  'emerald-village': [
    infrastructure('bus-stop', 'emerald-bus-stop', 58, 53, { scale: 1, label: 'Valley Bus Stop', interactive: true, zIndex: 18 }),
    infrastructure('railway-crossing', 'emerald-crossing', 45, 67, { scale: 1, label: 'Rail Crossing', interactive: true, zIndex: 18 }),
    infrastructure('bridge', 'emerald-bridge', 42, 54, { width: 16, height: 8, rotation: 12, variant: 'stone', zIndex: 16 }),
    infrastructure('intersection', 'emerald-intersection', 45, 51, { width: 18, height: 18, rotation: 0, variant: 'village', zIndex: 15 }),
    infrastructure('traffic-signal', 'emerald-signal', 48, 52, { scale: .8, variant: 'village', zIndex: 19 }),
    infrastructure('street-light', 'emerald-lamp-01', 64, 48, { scale: .8, zIndex: 19 }),
    infrastructure('street-light', 'emerald-lamp-02', 52, 61, { scale: .8, zIndex: 19 }),
    infrastructure('street-light', 'emerald-lamp-03', 32, 57, { scale: .7, zIndex: 19 }),
    infrastructure('dock', 'emerald-dock', 81, 27, { width: 13, height: 5, rotation: -8, variant: 'wood', zIndex: 12 }),
    infrastructure('pier', 'emerald-pier', 89, 25, { width: 7, height: 18, rotation: 4, variant: 'wood', zIndex: 11 }),
  ],
  'learning-campus': [
    infrastructure('bus-stop', 'campus-bus-stop', 53, 57, { scale: 1, label: 'Campus Shuttle', interactive: true, zIndex: 18 }),
    infrastructure('parking', 'campus-parking', 80, 57, { width: 18, height: 11, variant: 'student', zIndex: 8 }),
    infrastructure('helipad', 'campus-helipad', 31, 19, { scale: .8, variant: 'rescue', zIndex: 8 }),
    infrastructure('intersection', 'campus-intersection', 52, 54, { width: 18, height: 18, variant: 'campus', zIndex: 15 }),
    infrastructure('traffic-signal', 'campus-signal', 55, 55, { scale: .8, variant: 'campus', zIndex: 19 }),
    infrastructure('street-light', 'campus-lamp-01', 42, 48, { scale: .7, zIndex: 19 }),
    infrastructure('street-light', 'campus-lamp-02', 69, 56, { scale: .7, zIndex: 19 }),
    infrastructure('utility', 'campus-utility', 86, 46, { scale: .8, variant: 'modern', zIndex: 9 }),
  ],
};

export const LIVING_INFRASTRUCTURE_NETWORKS: Record<string, WorldInfrastructureNetwork[]> = {
  'emerald-village': [
    infrastructureNetwork('road', 'emerald-road-main', [{x:-5,y:62},{x:22,y:56},{x:45,y:51},{x:70,y:43},{x:105,y:40}], 24, { variant: 'village' }),
    infrastructureNetwork('road', 'emerald-road-south', [{x:44,y:51},{x:42,y:72},{x:38,y:96}], 18, { variant: 'village' }),
    infrastructureNetwork('sidewalk', 'emerald-sidewalk', [{x:17,y:57},{x:42,y:51},{x:62,y:46}], 7, { variant: 'stone' }),
    infrastructureNetwork('power-line', 'emerald-power-line', [{x:8,y:28},{x:34,y:35},{x:61,y:29},{x:91,y:34}], 2, { variant: 'wooden-poles' }),
  ],
  'learning-campus': [
    infrastructureNetwork('road', 'campus-road-loop', [{x:2,y:54},{x:28,y:50},{x:52,y:53},{x:76,y:58},{x:103,y:55}], 22, { variant: 'campus' }),
    infrastructureNetwork('sidewalk', 'campus-sidewalk', [{x:24,y:50},{x:42,y:40},{x:61,y:47},{x:76,y:58}], 7, { variant: 'paved' }),
    infrastructureNetwork('road', 'campus-access-road', [{x:76,y:58},{x:84,y:72},{x:103,y:79}], 15, { variant: 'campus' }),
  ],
};

export function getWorldInfrastructure(locationId: string) {
  return LIVING_WORLD_INFRASTRUCTURE[locationId] ?? [];
}

export function getWorldInfrastructureNetworks(locationId: string) {
  return LIVING_INFRASTRUCTURE_NETWORKS[locationId] ?? [];
}
