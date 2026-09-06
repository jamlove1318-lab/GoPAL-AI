import { buildWorldConstructionKit } from './livingWorldConstructionKit';
import type { WorldLocationDefinition, WorldCinematicAnchors } from './livingWorldLocationSchema';
import { getLocationWorldObjects } from './livingWorldObjectFactory';
import { getLanguageWorldForLocation } from './livingLanguageWorlds';
import type { WorldObjectDefinition } from './livingWorldObjects';

function resolveCinematicAnchors(objects: WorldObjectDefinition[]): WorldCinematicAnchors {
 const visible = objects.filter(object => object.visual?.visible !== false);
 const first = (...predicates: Array<(object: WorldObjectDefinition) => boolean>) => {
  for (const predicate of predicates) { const match = visible.find(predicate); if (match) return match.id; }
  return undefined;
 };
 const landmarkObjectId = first(
  object => object.category === 'building' && (object.tags?.includes('landmark') || object.tags?.includes('signature')),
  object => object.category === 'building',
  object => object.category === 'infrastructure'
 );
 const residentObjectId = first(object => object.category === 'character');
 const transportObjectId = first(
  object => object.category === 'vehicle',
  object => object.category === 'transport'
 );
 const environmentObjectId = first(
  object => object.category === 'nature' && (object.tags?.includes('signature') || object.tags?.includes('landmark')),
  object => object.category === 'nature',
  object => object.type === 'water'
 );
 const departureObjectId = first(
  object => object.category === 'gameplay' && object.tags?.includes('transport'),
  object => object.category === 'vehicle',
  object => object.category === 'transport',
  object => object.category === 'building' && object.tags?.includes('entrance')
 );
 return { landmarkObjectId, residentObjectId, transportObjectId, environmentObjectId, departureObjectId };
}

export function buildWorldLocation(locationId:string):WorldLocationDefinition{
 const kit=buildWorldConstructionKit(locationId);
 const objects=getLocationWorldObjects(kit.id);
 const base:WorldLocationDefinition={id:kit.id,name:kit.name,theme:kit.theme,templateId:kit.id,description:`${kit.name} — ${kit.archetype} location built from reusable primitives.`,objects,cinematicAnchors:resolveCinematicAnchors(objects),environment:{dayNight:true,weather:true,seasons:true,ambientAnimation:true},rules:{allowFastTravel:true,allowBuildingEntry:true,allowVehicles:true,allowDynamicEvents:true},tags:kit.tags,metadata:{archetype:kit.archetype,constructionKitId:kit.id,constructionSummary:{buildings:kit.buildings.length,props:kit.props.length,infrastructure:kit.infrastructure.length,transport:kit.transport.length,gameplay:kit.gameplay.length,characters:kit.characters.length,entrances:kit.entrances.length}}};
 const world=getLanguageWorldForLocation(base);
 if(world)return{...base,worldKind:world.homeWorld?'home':'language',languageWorldId:world.id,language:world.language,locale:world.locale,metadata:{...(base.metadata??{}),languageWorldId:world.id,language:world.language,locale:world.locale,worldDisplayName:world.name}};
 if(locationId==='emerald-village')return{...base,worldKind:'home',languageWorldId:'emerald-valley',metadata:{...(base.metadata??{}),languageWorldId:'emerald-valley',worldDisplayName:'Emerald Valley'}};
 return base;
}
export function buildWorldLocations(locationIds:string[]){return locationIds.map(buildWorldLocation);}