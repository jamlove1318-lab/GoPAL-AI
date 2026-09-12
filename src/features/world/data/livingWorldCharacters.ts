import type { WorldTheme } from '../components/LivingWorldPrimitives';
import { getScheduleBehavior } from './livingWorldBehavior';
import { getLanguageWorldCharacters, getLanguageWorldSpawnPoints } from './livingLanguageWorldPhysical';
export type WorldCharacterRole='player'|'companion'|'resident'|'teacher'|'merchant'|'guide'|'traveler'|'quest-giver'|'enemy'|'custom';
export type WorldCharacterDefinition={id:string;role:WorldCharacterRole;x:number;y:number;scale?:number;theme?:WorldTheme;name?:string;label?:string;tags?:string[];dialogueId?:string;scheduleId?:string;interactionRadius?:number;persistent?:boolean;interactive?:boolean;metadata?:Record<string,unknown>};
export type WorldCharacterSpawnPoint={id:string;x:number;y:number;role:WorldCharacterRole;tags?:string[];maxCount?:number;respawn?:boolean};
const C=(id:string,role:WorldCharacterRole,x:number,y:number,name:string,tags:string[],scheduleId?:string,extra:Partial<WorldCharacterDefinition>={}):WorldCharacterDefinition=>({id,role,x,y,name,label:name,tags,scheduleId,interactive:true,interactionRadius:8,...extra});
export const LIVING_WORLD_CHARACTERS:Record<string,WorldCharacterDefinition[]>={
 'emerald-village':[C('cassidy','companion',38,52,'Cassidy',['companion','mentor'],'village-daily-life',{persistent:true,interactionRadius:10}),C('village-teacher','teacher',58,35,'Village Teacher',['learning'],'village-daily-life'),C('village-merchant','merchant',82,64,'Market Keeper',['market'],'village-daily-life')],
 'learning-campus':[C('campus-guide','guide',48,42,'Campus Guide',['learning'],'campus-day'),C('campus-teacher','teacher',45,33,'Academy Teacher',['learning','lesson'],'campus-day')],
 'coastal-town':[C('coast-guide','guide',47,36,'Coast Guide',['travel','culture'],'coastal-life'),C('harbor-merchant','merchant',82,68,'Harbor Keeper',['market','harbor'],'coastal-life'),C('coast-teacher','teacher',38,44,'Coastal Teacher',['learning','culture'],'coastal-life')],
 'mountain-village':[C('mountain-guide','guide',51,43,'Summit Guide',['travel','nature'],'mountain-life'),C('mountain-merchant','merchant',72,56,'Mountain Trader',['market'],'mountain-life'),C('mountain-teacher','teacher',35,50,'Trail Teacher',['learning','nature'],'mountain-life')],
 'fantasy-kingdom':[C('fantasy-guide','guide',48,56,'Royal Guide',['story','travel'],'fantasy-life'),C('fantasy-merchant','merchant',76,58,'Royal Merchant',['market'],'fantasy-life'),C('fantasy-questgiver','quest-giver',50,25,'Moon Temple Keeper',['quest','story'],'fantasy-life')],
 'scifi-outpost':[C('scifi-guide','guide',50,48,'Station Guide',['travel','science'],'scifi-life'),C('scifi-engineer','teacher',63,40,'Systems Engineer',['learning','science'],'scifi-life'),C('scifi-merchant','merchant',80,55,'Outpost Trader',['market','technology'],'scifi-life')],
 'game-arena':[C('arena-guide','guide',50,78,'Arena Host',['game','rules'],'arena-life'),C('arena-challenger','quest-giver',50,25,'Challenge Master',['quest','game'],'arena-life'),C('arena-merchant','merchant',74,54,'Prize Keeper',['rewards','game'],'arena-life')],
};
export const LIVING_WORLD_SPAWN_POINTS:Record<string,WorldCharacterSpawnPoint[]>={
 'emerald-village':[{id:'village-resident-spawn',x:24,y:48,role:'resident',tags:['village'],maxCount:6,respawn:true},{id:'village-traveler-spawn',x:70,y:76,role:'traveler',tags:['station'],maxCount:3,respawn:true}],
 'learning-campus':[{id:'campus-student-spawn',x:55,y:62,role:'resident',tags:['student'],maxCount:8,respawn:true},{id:'campus-visitor-spawn',x:76,y:58,role:'traveler',tags:['visitor'],maxCount:3,respawn:true}],
 'coastal-town':[{id:'coast-resident-spawn',x:32,y:61,role:'resident',tags:['coastal'],maxCount:7,respawn:true},{id:'coast-traveler-spawn',x:78,y:68,role:'traveler',tags:['harbor'],maxCount:4,respawn:true}],
 'mountain-village':[{id:'mountain-resident-spawn',x:30,y:58,role:'resident',tags:['mountain'],maxCount:6,respawn:true},{id:'mountain-traveler-spawn',x:53,y:69,role:'traveler',tags:['summit'],maxCount:3,respawn:true}],
 'fantasy-kingdom':[{id:'fantasy-citizen-spawn',x:28,y:55,role:'resident',tags:['kingdom'],maxCount:8,respawn:true},{id:'fantasy-traveler-spawn',x:76,y:56,role:'traveler',tags:['castle'],maxCount:4,respawn:true}],
 'scifi-outpost':[{id:'scifi-resident-spawn',x:27,y:48,role:'resident',tags:['outpost'],maxCount:8,respawn:true},{id:'scifi-traveler-spawn',x:76,y:48,role:'traveler',tags:['starport'],maxCount:5,respawn:true}],
 'game-arena':[{id:'arena-crowd-spawn',x:25,y:52,role:'resident',tags:['audience','game'],maxCount:10,respawn:true},{id:'arena-player-spawn',x:75,y:52,role:'traveler',tags:['player','game'],maxCount:4,respawn:true}],
};
export function getWorldCharacters(locationId:string){return LIVING_WORLD_CHARACTERS[locationId]??getLanguageWorldCharacters(locationId);}
export function getWorldSpawnPoints(locationId:string){return LIVING_WORLD_SPAWN_POINTS[locationId]??getLanguageWorldSpawnPoints(locationId);}
export function findWorldCharacter(locationId:string,id:string){return getWorldCharacters(locationId).find(c=>c.id===id)??null;}
export function getCharacterBehavior(character:WorldCharacterDefinition,hour=new Date().getHours()){return character.scheduleId?getScheduleBehavior(character.scheduleId,hour):null;}
