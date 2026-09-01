import type { WorldTheme } from '../components/LivingWorldPrimitives';

export type WorldVehicleKind = 'train' | 'bus' | 'car' | 'bicycle' | 'boat' | 'airplane';

export type WorldVehicleWaypoint = { x: number; y: number; waitMs?: number };

export type WorldVehicleDefinition = {
  id: string;
  kind: WorldVehicleKind;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  theme?: WorldTheme;
  routeId?: string;
  speed?: number;
  moving?: boolean;
  interactive?: boolean;
  label?: string;
};

export type WorldVehicleRoute = {
  id: string;
  kind: WorldVehicleKind;
  waypoints: WorldVehicleWaypoint[];
  loop?: boolean;
  speed: number;
};

export const LIVING_WORLD_VEHICLES: Record<string, WorldVehicleDefinition[]> = {
  'emerald-village': [
    { id: 'emerald-train-01', kind: 'train', x: 18, y: 45, scale: 0.9, theme: 'emerald', routeId: 'emerald-rail-loop', speed: 0.45, moving: true, interactive: true, label: 'Valley Train' },
    { id: 'emerald-bus-01', kind: 'bus', x: 59, y: 53, scale: 0.8, theme: 'emerald', routeId: 'emerald-bus-loop', speed: 0.35, moving: true, interactive: true, label: 'Village Bus' },
  ],
  'learning-campus': [
    { id: 'campus-shuttle-01', kind: 'bus', x: 53, y: 57, scale: 0.8, theme: 'emerald', routeId: 'campus-shuttle-loop', speed: 0.3, moving: true, interactive: true, label: 'Campus Shuttle' },
    { id: 'campus-aircraft-01', kind: 'airplane', x: 18, y: 24, scale: 0.65, rotation: 8, theme: 'coastal', label: 'Training Aircraft' },
  ],
};

export const LIVING_WORLD_VEHICLE_ROUTES: Record<string, WorldVehicleRoute[]> = {
  'emerald-village': [
    { id: 'emerald-rail-loop', kind: 'train', speed: 0.45, loop: true, waypoints: [{x:5,y:43},{x:28,y:40},{x:55,y:38},{x:82,y:34},{x:105,y:32}] },
    { id: 'emerald-bus-loop', kind: 'bus', speed: 0.35, loop: true, waypoints: [{x:8,y:60},{x:30,y:56},{x:54,y:52},{x:78,y:46},{x:101,y:42}] },
  ],
  'learning-campus': [
    { id: 'campus-shuttle-loop', kind: 'bus', speed: 0.3, loop: true, waypoints: [{x:4,y:54},{x:30,y:50},{x:53,y:53},{x:78,y:58},{x:103,y:55}] },
  ],
};

export function getWorldVehicles(locationId: string): WorldVehicleDefinition[] { return LIVING_WORLD_VEHICLES[locationId] ?? []; }
export function getWorldVehicleRoutes(locationId: string): WorldVehicleRoute[] { return LIVING_WORLD_VEHICLE_ROUTES[locationId] ?? []; }
