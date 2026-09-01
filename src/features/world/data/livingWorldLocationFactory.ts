import { getLivingLocationTemplate } from './livingWorldCatalog';
import { getLocationWorldObjects } from './livingWorldObjectFactory';
import type { WorldLocationDefinition } from './livingWorldLocationSchema';

/** Builds a complete location from the existing reusable catalogs. */
export function buildWorldLocation(locationId: string): WorldLocationDefinition {
  const template = getLivingLocationTemplate(locationId);
  return {
    id: template.id,
    name: template.name,
    theme: template.theme,
    templateId: template.id,
    objects: getLocationWorldObjects(template.id),
    environment: { dayNight: true, weather: true, seasons: true, ambientAnimation: true },
    rules: { allowFastTravel: true, allowBuildingEntry: true, allowVehicles: true, allowDynamicEvents: true },
    tags: ['living-world', template.theme],
  };
}

export function buildWorldLocations(locationIds: string[]): WorldLocationDefinition[] {
  return locationIds.map(buildWorldLocation);
}
