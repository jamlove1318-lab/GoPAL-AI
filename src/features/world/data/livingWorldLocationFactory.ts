import { buildWorldConstructionKit } from './livingWorldConstructionKit';
import type { WorldLocationDefinition } from './livingWorldLocationSchema';
import { getLocationWorldObjects } from './livingWorldObjectFactory';

/** Builds a complete location from the reusable World Construction Kit. */
export function buildWorldLocation(locationId:string):WorldLocationDefinition {
  const kit=buildWorldConstructionKit(locationId);
  return {
    id:kit.id,
    name:kit.name,
    theme:kit.theme,
    templateId:kit.id,
    description:`${kit.name} — ${kit.archetype} world built from reusable primitives.`,
    objects:getLocationWorldObjects(kit.id),
    environment:{dayNight:true,weather:true,seasons:true,ambientAnimation:true},
    rules:{allowFastTravel:true,allowBuildingEntry:true,allowVehicles:true,allowDynamicEvents:true},
    tags:kit.tags,
    metadata:{archetype:kit.archetype,constructionKitId:kit.id,constructionSummary:{buildings:kit.buildings.length,props:kit.props.length,infrastructure:kit.infrastructure.length,transport:kit.transport.length,gameplay:kit.gameplay.length,characters:kit.characters.length,entrances:kit.entrances.length}},
  };
}

export function buildWorldLocations(locationIds:string[]):WorldLocationDefinition[]{return locationIds.map(buildWorldLocation);}
