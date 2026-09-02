import type { WorldLocationDefinition } from './livingWorldLocationSchema';
import { getLanguageWorldLocations } from './livingLanguageWorldLocations';

/** A language world is the learner-facing world identity. Locations (real or fictional) live inside it. */
export type LanguageWorldDefinition={id:string;name:string;language:string;locale:string;flag?:string;homeWorld?:boolean;locationIds:string[];tags?:string[]};

/** Only Emerald Valley is the top-level fictional home world. Other entries are language worlds. */
export const LANGUAGE_WORLDS:LanguageWorldDefinition[]=[
 {id:'emerald-valley',name:'Emerald Valley',language:'GoPAL Home',locale:'en',flag:'🌿',homeWorld:true,locationIds:['emerald-village'],tags:['home','fictional']},
 {id:'japanese',name:'Japanese World',language:'Japanese',locale:'ja-JP',flag:'🇯🇵',locationIds:getLanguageWorldLocations('japanese').map(location=>location.id),tags:['language','real-world','fictional-locations']},
 {id:'french',name:'French World',language:'French',locale:'fr-FR',flag:'🇫🇷',locationIds:getLanguageWorldLocations('french').map(location=>location.id),tags:['language','real-world','fictional-locations']},
];
export function getLanguageWorlds(){return LANGUAGE_WORLDS.map(world=>({...world,locationIds:[...world.locationIds],tags:world.tags?[...world.tags]:[]}));}
export function getLanguageWorld(id:string){return LANGUAGE_WORLDS.find(world=>world.id===id)??null;}
export function getLanguageWorldForLocation(location:WorldLocationDefinition){const explicit=typeof location.metadata?.languageWorldId==='string'?getLanguageWorld(location.metadata.languageWorldId):null;if(explicit)return explicit;return LANGUAGE_WORLDS.find(world=>world.locationIds.includes(location.id))??null;}
export function registerLanguageWorld(world:LanguageWorldDefinition){const index=LANGUAGE_WORLDS.findIndex(item=>item.id===world.id);const normalized={...world,locationIds:[...world.locationIds],tags:world.tags?[...world.tags]:[]};if(index>=0)LANGUAGE_WORLDS[index]=normalized;else LANGUAGE_WORLDS.push(normalized);return normalized;}
export function isLanguageWorld(world:LanguageWorldDefinition|null){return!!world&&!world.homeWorld;}
export function attachLanguageWorldMetadata(location:WorldLocationDefinition,world:LanguageWorldDefinition):WorldLocationDefinition{return{...location,worldKind:world.homeWorld?'home':'language',languageWorldId:world.id,language:world.language,locale:world.locale,metadata:{...(location.metadata??{}),languageWorldId:world.id,language:world.language,locale:world.locale,worldDisplayName:world.name}};}
