import type{NpcCharacterAssetSet,NpcCharacterIdentity,NpcRole}from'../../characters/npcCharacterDesign';
import{createNpcIdentity,NPC_ROLE_DESIGNS}from'../../characters/npcCharacterDesign';

export interface NpcCharacterDefinition extends NpcCharacterIdentity{assetSet?:NpcCharacterAssetSet;nameplate?:{show:boolean;color?:string};worldIds:string[];roles:NpcRole[];regionalVariants?:Record<string,{outfit?:string;accessory?:string;palette?:string[]}>;}

const definitions=new Map<string,NpcCharacterDefinition>();
const seedRoles:Array<[NpcRole,string]>= [['resident','Resident'],['teacher','Teacher'],['guide','Guide'],['merchant','Merchant'],['quest-giver','Quest Giver'],['traveler','Traveler'],['student','Student'],['guard','Guard'],['farmer','Farmer'],['sailor','Sailor'],['pilot','Pilot'],['engineer','Engineer'],['scientist','Scientist'],['royal','Royal'],['villager','Villager'],['tourist','Tourist'],['custom','NPC']];
for(const[role,label]of seedRoles){const design=NPC_ROLE_DESIGNS[role];definitions.set(`template:${role}`,{...createNpcIdentity(`template:${role}`,role,label,[design.accessory]),worldIds:['*'],roles:[role],nameplate:{show:true}});}

export function registerNpcCharacter(definition:NpcCharacterDefinition):NpcCharacterDefinition{definitions.set(definition.id,definition);return definition;}
export function getNpcCharacter(id:string):NpcCharacterDefinition|undefined{return definitions.get(id);}
export function getNpcCharacterForRole(role:NpcRole):NpcCharacterDefinition{return definitions.get(`template:${role}`)??definitions.get('template:resident')!;}
export function listNpcCharacters(worldId?:string):NpcCharacterDefinition[]{return Array.from(definitions.values()).filter(item=>!worldId||item.worldIds.includes('*')||item.worldIds.includes(worldId));}
export function createNpcCharacterDefinition(id:string,role:NpcRole,worldIds:string[]=['*'],displayName?:string):NpcCharacterDefinition{const design=NPC_ROLE_DESIGNS[role];return registerNpcCharacter({...createNpcIdentity(id,role,displayName??design.silhouette,[design.accessory]),worldIds,roles:[role],nameplate:{show:true}});}
export function resolveNpcVisual(id:string,role:NpcRole,worldId:string){const definition=getNpcCharacter(id)??getNpcCharacterForRole(role);const variant=definition.regionalVariants?.[worldId];return{definition,palette:variant?.palette??NPC_ROLE_DESIGNS[role].palette,accessory:variant?.accessory??NPC_ROLE_DESIGNS[role].accessory,outfit:variant?.outfit??NPC_ROLE_DESIGNS[role].outfit};}
