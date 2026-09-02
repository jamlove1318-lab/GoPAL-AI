import type { WorldTheme } from '../components/LivingWorldPrimitives';
import type { WorldObjectDefinition } from './livingWorldObjects';
export type WorldAtmosphere='calm'|'lively'|'mysterious'|'fantasy'|'futuristic';
export type WorldEnvironmentRules={dayNight?:boolean;weather?:boolean;seasons?:boolean;ambientAnimation?:boolean;atmosphere?:WorldAtmosphere};
export type WorldLocationRules={walkableBounds?:{minX:number;maxX:number;minY:number;maxY:number};allowFastTravel?:boolean;allowBuildingEntry?:boolean;allowVehicles?:boolean;allowDynamicEvents?:boolean};
export type WorldContainerKind='home'|'language';
/** Canonical location contract. A location belongs to Emerald Valley (home) or a language world; real and fictional locations use the same contract. */
export type WorldLocationDefinition={id:string;name:string;theme:WorldTheme;templateId?:string;description?:string;objects:WorldObjectDefinition[];environment?:WorldEnvironmentRules;rules?:WorldLocationRules;tags?:string[];metadata?:Record<string,unknown>;worldKind?:WorldContainerKind;languageWorldId?:string;language?:string;locale?:string};
export function createWorldLocation(location:WorldLocationDefinition):WorldLocationDefinition{return{...location,objects:[...location.objects],tags:location.tags?[...location.tags]:[]};}
export function getLocationObjects(location:WorldLocationDefinition,category?:WorldObjectDefinition['category']){return category?location.objects.filter(object=>object.category===category):location.objects;}
export function findLocationObject(location:WorldLocationDefinition,objectId:string){return location.objects.find(object=>object.id===objectId)??null;}
