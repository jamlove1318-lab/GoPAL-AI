import { getLanguageWorld, getLanguageWorlds, LANGUAGE_WORLDS } from './livingLanguageWorlds';
import { getLanguageWorldLocation } from './livingLanguageWorldLocations';
import { buildWorldLocation } from './livingWorldLocationFactory';
import { getLivingLocationTemplate, LIVING_LOCATION_TEMPLATES } from './livingWorldCatalog';
import { getWorldEntrances } from './livingWorldEntrances';

export type UniverseWorldKind = 'home' | 'language' | 'fictional';
export type UniverseWorldStatus = 'active' | 'planned';

export interface UniverseWorldDefinition {
  id: string;
  name: string;
  kind: UniverseWorldKind;
  status: UniverseWorldStatus;
  locationIds: string[];
  language?: string;
  locale?: string;
  description: string;
}

/**
 * Canonical universe registry.
 *
 * The registry is intentionally data-first: worlds own locations, while the
 * renderer materializes those locations into physical scenes. Planned worlds
 * are extension points only and are not silently exposed as playable content.
 */
export const UNIVERSE_WORLDS: UniverseWorldDefinition[] = [
  {
    id: 'emerald-valley',
    name: 'Emerald Valley',
    kind: 'home',
    status: 'active',
    locationIds: ['emerald-village'],
    language: 'GoPAL Home',
    locale: 'en',
    description: 'The persistent home world and starting point of the GoPAL universe.',
  },
  ...getLanguageWorlds()
    .filter(world => !world.homeWorld)
    .map(world => ({
      id: world.id,
      name: world.name,
      kind: 'language' as const,
      status: 'active' as const,
      locationIds: [...world.locationIds],
      language: world.language,
      locale: world.locale,
      description: `A living language world for ${world.language}.`,
    })),
  ...LIVING_LOCATION_TEMPLATES
    .filter(template => !LANGUAGE_WORLDS.some(world => world.locationIds.includes(template.id)) && template.id !== 'emerald-village')
    .map(template => ({
      id: template.id,
      name: template.name,
      kind: 'fictional' as const,
      status: 'planned' as const,
      locationIds: [template.id],
      description: 'Reserved fictional-world seed built from the reusable physical-world construction kit.',
    })),
];

export function getUniverseWorlds(status?: UniverseWorldStatus) {
  return UNIVERSE_WORLDS
    .filter(world => !status || world.status === status)
    .map(world => ({ ...world, locationIds: [...world.locationIds] }));
}

export function getUniverseWorld(worldId: string) {
  const world = UNIVERSE_WORLDS.find(item => item.id === worldId);
  return world ? { ...world, locationIds: [...world.locationIds] } : null;
}

export function getUniverseLocation(locationId: string) {
  const world = UNIVERSE_WORLDS.find(item => item.locationIds.includes(locationId));
  const languageLocation = getLanguageWorldLocation(locationId);
  const template = getLivingLocationTemplate(locationId);
  return {
    locationId,
    worldId: world?.id ?? null,
    worldKind: world?.kind ?? (languageLocation ? 'language' : 'fictional'),
    worldStatus: world?.status ?? 'planned',
    worldName: world?.name ?? template.name,
    location: languageLocation,
    template,
  };
}

export function getPlayableUniverseLocations() {
  return UNIVERSE_WORLDS
    .filter(world => world.status === 'active')
    .flatMap(world => world.locationIds.map(locationId => ({
      ...getUniverseLocation(locationId),
      worldId: world.id,
      worldKind: world.kind,
      worldStatus: world.status,
      worldName: world.name,
    })));
}

export function buildPlayableUniverseLocations() {
  return getPlayableUniverseLocations().map(entry => buildWorldLocation(entry.locationId));
}

export interface UniverseIntegrityReport {
  ok: boolean;
  worldCount: number;
  activeWorldCount: number;
  locationCount: number;
  duplicateWorldIds: string[];
  duplicateLocationIds: string[];
  missingWorlds: string[];
  buildFailures: string[];
  invalidTravelTargets: string[];
}

export function validateUniverseIntegrity(): UniverseIntegrityReport {
  const worldIds = UNIVERSE_WORLDS.map(world => world.id);
  const locationIds = UNIVERSE_WORLDS.flatMap(world => world.locationIds);
  const duplicates = (values: string[]) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
  const missingWorlds = LANGUAGE_WORLDS
    .filter(world => !UNIVERSE_WORLDS.some(item => item.id === world.id))
    .map(world => world.id);
  const buildFailures: string[] = [];
  const invalidTravelTargets: string[] = [];
  for (const locationId of [...new Set(locationIds)]) {
    try {
      const location = buildWorldLocation(locationId);
      if (!location || location.id !== locationId) buildFailures.push(locationId);
      for (const entrance of getWorldEntrances(locationId)) {
        if ((entrance.targetType === 'location' || entrance.targetType === 'world') && entrance.targetId) {
          const target = getLivingLocationTemplate(entrance.targetId);
          if (target.id !== entrance.targetId) invalidTravelTargets.push(`${locationId}:${entrance.id}->${entrance.targetId}`);
        }
      }
    } catch {
      buildFailures.push(locationId);
    }
  }
  return {
    ok: duplicates(worldIds).length === 0 && duplicates(locationIds).length === 0 && missingWorlds.length === 0 && buildFailures.length === 0 && invalidTravelTargets.length === 0,
    worldCount: UNIVERSE_WORLDS.length,
    activeWorldCount: UNIVERSE_WORLDS.filter(world => world.status === 'active').length,
    locationCount: new Set(locationIds).size,
    duplicateWorldIds: duplicates(worldIds),
    duplicateLocationIds: duplicates(locationIds),
    missingWorlds,
    buildFailures,
    invalidTravelTargets,
  };
}

export function getUniverseLanguageWorld(worldId: string) {
  return getLanguageWorld(worldId);
}
