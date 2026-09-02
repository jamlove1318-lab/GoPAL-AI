import type { WorldBuildingType, WorldPropType, WorldTheme } from '../components/LivingWorldPrimitives';
import type { WorldInfrastructureKind } from './livingWorldInfrastructure';
import type { WorldGameplayKind } from './livingWorldGameplay';
import type { WorldVehicleKind } from './livingWorldVehicles';
import type { WorldCharacterRole } from './livingWorldCharacters';
import { UNIVERSAL_WORLD_OBJECT_CATALOG } from './livingWorldObjectCatalog';
export type WorldObjectCategory='building'|'prop'|'infrastructure'|'transport'|'vehicle'|'nature'|'character'|'gameplay'|'fantasy'|'sci-fi'|'interior';
export type WorldObjectArchetype={id:string;category:WorldObjectCategory;type:string;label:string;tags:string[];themes:WorldTheme[];reusable:true;collision?:boolean;interactive?:boolean;supportsInterior?:boolean};
const THEMES:WorldTheme[]=['emerald','sakura','mountain','coastal','festival'];const ALL:WorldTheme[]= [...THEMES];
const familyToCategory=(family:string):WorldObjectCategory=>family==='transportation'?'transport':family==='decoration'?'prop':family==='fantasy'?'fantasy':family==='scifi'?'sci-fi':family==='interior'?'interior':family as WorldObjectCategory;
const expanded=UNIVERSAL_WORLD_OBJECT_CATALOG.map(item=>({id:`${familyToCategory(item.family)}.${item.type}`,category:familyToCategory(item.family),type:item.type,label:item.type.replace(/-/g,' '),tags:item.tags,themes:ALL,reusable:true as const,supportsInterior:item.supportsInterior,interactive:item.supportsInteraction}));
export const WORLD_OBJECT_ARCHETYPES:WorldObjectArchetype[]=[
 ...expanded,
 ...(['house','cafe','library','market','school','sanctuary','workshop','railway-station','airport'] as WorldBuildingType[]).map(type=>({id:`building.${type}`,category:'building' as const,type,label:type.replace(/-/g,' '),tags:['building'],themes:ALL,reusable:true as const,collision:true,interactive:true})),
 ...(['tree','rock','lamp','bench','fence','flower','sign'] as WorldPropType[]).map(type=>({id:`prop.${type}`,category:'prop' as const,type,label:type,tags:['prop'],themes:ALL,reusable:true as const,collision:['tree','rock','fence'].includes(type),interactive:['bench','flower','sign'].includes(type)})),
 ...(['road','sidewalk','intersection','bridge','tunnel','railway-crossing','traffic-signal','street-light','bus-stop','parking','dock','harbor','pier','runway','taxiway','helipad','power-line','utility'] as WorldInfrastructureKind[]).map(type=>({id:`infrastructure.${type}`,category:'infrastructure' as const,type,label:type.replace(/-/g,' '),tags:['infrastructure'],themes:ALL,reusable:true as const,collision:false,interactive:['railway-crossing','traffic-signal','bus-stop'].includes(type)})),
 ...(['train','bus','car','bicycle','boat','airplane'] as WorldVehicleKind[]).map(type=>({id:`vehicle.${type}`,category:'vehicle' as const,type,label:type,tags:['vehicle'],themes:ALL,reusable:true as const,collision:false,interactive:true})),
 ...(['player','companion','resident','teacher','merchant','guide','traveler','quest-giver','enemy','custom'] as WorldCharacterRole[]).map(role=>({id:`character.${role}`,category:'character' as const,type:role,label:role.replace(/-/g,' '),tags:['character',role],themes:ALL,reusable:true as const,collision:false,interactive:role!=='player'})),
 ...(['spawn','checkpoint','collectible','trigger','portal','door','switch','pressure-plate','quest-marker','save-point','shop','loot-container','puzzle','moving-platform','hazard','lever','button','key','chest','dialogue-point','lesson-point','game-start','game-over','teleporter'] as WorldGameplayKind[]).map(type=>({id:`gameplay.${type}`,category:'gameplay' as const,type,label:type.replace(/-/g,' '),tags:['gameplay'],themes:ALL,reusable:true as const,collision:['door','moving-platform','hazard'].includes(type),interactive:!['spawn','trigger'].includes(type)})),
];
export function getWorldObjectArchetype(id:string){return WORLD_OBJECT_ARCHETYPES.find(object=>object.id===id);}
export function findWorldObjectArchetypes(category:WorldObjectCategory){return WORLD_OBJECT_ARCHETYPES.filter(object=>object.category===category);}
export function findWorldObjectArchetypesByTag(tag:string){return WORLD_OBJECT_ARCHETYPES.filter(object=>object.tags.includes(tag));}
export function findReusableWorldObjectsByFamily(family:Parameters<typeof familyToCategory>[0]){return WORLD_OBJECT_ARCHETYPES.filter(object=>object.category===familyToCategory(family));}
