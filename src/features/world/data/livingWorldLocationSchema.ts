import type { WorldTheme } from '../components/LivingWorldPrimitives';
import type { WorldObjectDefinition } from './livingWorldObjects';

export type WorldAtmosphere = 'calm' | 'lively' | 'mysterious' | 'fantasy' | 'futuristic';
export type WorldEnvironmentRules = { dayNight?:boolean; weather?:boolean; seasons?:boolean; ambientAnimation?:boolean; atmosphere?:WorldAtmosphere };
export type WorldLocationRules = { walkableBounds?:{minX:number;maxX:number;minY:number;maxY:number}; allowFastTravel?:boolean; allowBuildingEntry?:boolean; allowVehicles?:boolean; allowDynamicEvents?:boolean };

/** Canonical extensible location contract. Locations remain data-driven and can be composed by the World Construction Kit. */
export type WorldLocationDefinition = { id:string; name:string; theme:WorldTheme; templateId?:string; description?:string; objects:WorldObjectDefinition[]; environment?:WorldEnvironmentRules; rules?:WorldLocationRules; tags?:string[]; metadata?:Record<string,unknown> };
export function createWorldLocation(location:WorldLocationDefinition):WorldLocationDefinition{return {...location,objects:[...location.objects],tags:location.tags?[...location.tags]:[]};}
export function getLocationObjects(location:WorldLocationDefinition,category?:WorldObjectDefinition['category']){return category?location.objects.filter(object=>object.category===category):location.objects;}
export function findLocationObject(location:WorldLocationDefinition,objectId:string){return location.objects.find(object=>object.id===objectId)??null;}
