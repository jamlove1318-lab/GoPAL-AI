import type { WorldEvent } from './livingWorldEvents';
import type { WorldLocationDefinition } from './livingWorldLocationSchema';
import type { WorldTravelDefinition } from './livingWorldTravel';

export type WorldScenarioPhase = 'opening' | 'interaction' | 'closing';
export type WorldScenarioKind = 'location-arrival' | 'world-arrival' | 'resident-interaction' | 'travel';
export type WorldScenarioShot = {
  id: string;
  durationMs: number;
  focus: 'establishing' | 'landmark' | 'resident' | 'transport' | 'environment' | 'departure';
  motion: 'pan' | 'push' | 'orbit' | 'follow' | 'reveal' | 'hold';
  priority: number;
};
export type WorldScenario = {
  id: string;
  kind: WorldScenarioKind;
  phase: WorldScenarioPhase;
  worldId: string | null;
  locationId: string;
  title: string;
  durationMs: number;
  shots: WorldScenarioShot[];
  metadata: Record<string, unknown>;
};

const clampDuration = (value: number) => Math.max(2200, Math.min(value, 11000));
const tag = (location: WorldLocationDefinition, value: string) => (location.tags ?? []).includes(value);

function locationShots(location: WorldLocationDefinition): WorldScenarioShot[] {
  const shots: WorldScenarioShot[] = [
    { id: 'establishing', durationMs: 850, focus: 'establishing', motion: 'reveal', priority: 1 },
    { id: 'landmark', durationMs: 700, focus: 'landmark', motion: 'push', priority: 2 },
  ];
  if (tag(location, 'coastal') || tag(location, 'nature') || tag(location, 'seasonal')) {
    shots.push({ id: 'environment', durationMs: 650, focus: 'environment', motion: 'pan', priority: 3 });
  }
  shots.push({ id: 'resident-life', durationMs: 650, focus: 'resident', motion: 'follow', priority: 4 });
  return shots;
}

export function buildLocationArrivalScenario(location: WorldLocationDefinition, worldId: string | null): WorldScenario {
  const shots = locationShots(location);
  return {
    id: `arrival:${location.id}`,
    kind: 'location-arrival',
    phase: 'opening',
    worldId,
    locationId: location.id,
    title: location.name,
    durationMs: clampDuration(shots.reduce((sum, shot) => sum + shot.durationMs, 0)),
    shots,
    metadata: { locationName: location.name, theme: location.theme, tags: [...(location.tags ?? [])] },
  };
}

export function buildWorldArrivalScenario(location: WorldLocationDefinition, worldId: string | null, transport?: WorldTravelDefinition): WorldScenario {
  const shots: WorldScenarioShot[] = [
    { id: 'world-reveal', durationMs: 1100, focus: 'establishing', motion: 'reveal', priority: 1 },
    { id: 'world-landmark', durationMs: 950, focus: 'landmark', motion: 'orbit', priority: 2 },
    { id: 'world-life', durationMs: 850, focus: 'resident', motion: 'follow', priority: 3 },
    { id: 'world-environment', durationMs: 750, focus: 'environment', motion: 'pan', priority: 4 },
  ];
  return {
    id: `world-arrival:${worldId ?? 'unknown'}:${location.id}`,
    kind: 'world-arrival',
    phase: 'opening',
    worldId,
    locationId: location.id,
    title: worldId ?? location.name,
    durationMs: clampDuration(shots.reduce((sum, shot) => sum + shot.durationMs, 0)),
    shots,
    metadata: { transportMode: transport?.mode ?? null, transportScope: transport?.scope ?? null, worldId, locationId: location.id },
  };
}

export function buildTravelScenario(source: WorldLocationDefinition, target: WorldLocationDefinition, travel: WorldTravelDefinition): WorldScenario {
  const shots: WorldScenarioShot[] = [
    { id: 'departure', durationMs: 900, focus: 'departure', motion: 'follow', priority: 1 },
    { id: 'journey', durationMs: Math.max(1200, travel.durationSeconds * 300), focus: 'transport', motion: 'pan', priority: 2 },
    { id: 'arrival-reveal', durationMs: 1000, focus: 'establishing', motion: 'reveal', priority: 3 },
  ];
  return {
    id: `travel:${source.id}:${target.id}`,
    kind: 'travel',
    phase: 'opening',
    worldId: target.languageWorldId ?? null,
    locationId: target.id,
    title: target.name,
    durationMs: clampDuration(shots.reduce((sum, shot) => sum + shot.durationMs, 0)),
    shots,
    metadata: { sourceLocationId: source.id, targetLocationId: target.id, mode: travel.mode, scope: travel.scope },
  };
}

export function buildResidentScenario(location: WorldLocationDefinition, residentId: string, phase: WorldScenarioPhase): WorldScenario {
  const shots: WorldScenarioShot[] = phase === 'opening'
    ? [
        { id: 'resident-arrives', durationMs: 700, focus: 'resident', motion: 'follow', priority: 1 },
        { id: 'resident-context', durationMs: 550, focus: 'environment', motion: 'pan', priority: 2 },
      ]
    : phase === 'closing'
      ? [{ id: 'resident-departs', durationMs: 800, focus: 'resident', motion: 'follow', priority: 1 }]
      : [
          { id: 'resident-interaction', durationMs: 900, focus: 'resident', motion: 'push', priority: 1 },
          { id: 'interaction-context', durationMs: 600, focus: 'environment', motion: 'hold', priority: 2 },
        ];
  return {
    id: `resident:${location.id}:${residentId}:${phase}`,
    kind: 'resident-interaction',
    phase,
    worldId: location.languageWorldId ?? null,
    locationId: location.id,
    title: residentId,
    durationMs: clampDuration(shots.reduce((sum, shot) => sum + shot.durationMs, 0)),
    shots,
    metadata: { residentId, phase, locationId: location.id },
  };
}

export class LivingWorldScenarioEngine {
  private active: WorldScenario | null = null;
  start(scenario: WorldScenario) { this.active = scenario; return scenario; }
  clear() { this.active = null; }
  getActive() { return this.active; }
  handleEvent(event: WorldEvent, location: WorldLocationDefinition, worldId: string | null) {
    if (event.type === 'travel-requested') return this.start(buildLocationArrivalScenario(location, worldId));
    if (event.type === 'dialogue-started' && event.actorId) return this.start(buildResidentScenario(location, event.actorId, 'interaction'));
    return this.active;
  }
}
