import { buildWorldConstructionKit } from './livingWorldConstructionKit';
import type { WorldLocationDefinition } from './livingWorldLocationSchema';
import { getLocationWorldObjects } from './livingWorldObjectFactory';
import { getLanguageWorldForLocation } from './livingLanguageWorlds';
export function buildWorldLocation(locationId:string):WorldLocationDefinition{
 const kit=buildWorldConstructionKit(locationId);
 const base:WorldLocationDefinition={id:kit.id,name:kit.name,theme:kit.theme,templateId:kit.id,description:`${kit.name} — ${kit.archetype} location built from reusable primitives.`,objects:getLocationWorldObjects(kit.id),environment:{dayNight:true,weather:true,seasons:true,ambientAnimation:true},rules:{allowFastTravel:true,allowBuildingEntry:true,allowVehicles:true,allowDynamicEvents:true},tags:kit.tags,metadata:{archetype:kit.archetype,constructionKitId:kit.id,constructionSummary:{buildings:kit.buildings.length,props:kit.props.length,infrastructure:kit.infrastructure.length,transport:kit.transport.length,gameplay:kit.gameplay.length,characters:kit.characters.length,entrances:kit.entrances.length}}};
 const world=getLanguageWorldForLocation(base);
 if(world)return{...base,worldKind:world.homeWorld?'home':'language',languageWorldId:world.id,language:world.language,locale:world.locale,metadata:{...(base.metadata??{}),languageWorldId:world.id,language:world.language,locale:world.locale,worldDisplayName:world.name}};
 if(locationId==='emerald-village')return{...base,worldKind:'home',languageWorldId:'emerald-valley',metadata:{...(base.metadata??{}),languageWorldId:'emerald-valley',worldDisplayName:'Emerald Valley'}};
 return base;
}
export function buildWorldLocations(locationIds:string[]){return locationIds.map(buildWorldLocation);}
