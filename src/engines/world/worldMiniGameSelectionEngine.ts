import { LocalStore } from '../../lib/localStore';
import { getWorldMiniGameCatalog, type WorldMiniGameCatalogEntry } from './worldMiniGameCatalog';
import type { WorldMiniGameSkill } from './worldMiniGameEngine';

const KEY='world_mini_game_history_v1';
const HISTORY_LIMIT=40;

type MiniGameHistory={played:Array<{id:string;placeId:string;worldId:string;at:number}>};

async function readHistory():Promise<MiniGameHistory>{return LocalStore.get<MiniGameHistory>(KEY,{played:[]});}
async function writeHistory(value:MiniGameHistory){await LocalStore.set(KEY,value);}

export type WorldMiniGameSelectionContext={worldId:string;placeId:string;skills?:WorldMiniGameSkill[];preferredFamily?:WorldMiniGameCatalogEntry['family'];maxMinutes?:number;excludeIds?:string[];count?:number};

export async function rememberMiniGamePlayed(input:{id:string;worldId:string;placeId:string}){
 const history=await readHistory();
 const played=[...history.played.filter(item=>item.id!==input.id||item.placeId!==input.placeId),{...input,at:Date.now()}].slice(-HISTORY_LIMIT);
 await writeHistory({played});
 return {played};
}

export async function getMiniGameHistory(){return readHistory();}

/** Picks varied games without turning the world into a fixed lesson path. */
export async function selectMiniGames(context:WorldMiniGameSelectionContext){
 const history=await readHistory();
 const recentIds=new Set(history.played.slice(-12).map(item=>item.id));
 const excluded=new Set(context.excludeIds??[]);
 const now=Date.now();
 const recentById=new Map<string,number>();
 for(const item of history.played)recentById.set(item.id,item.at);
 const candidates=getWorldMiniGameCatalog().filter(game=>!excluded.has(game.id));
 const scored=candidates.map(game=>{
  const skillScore=context.skills?.length?game.skills.filter(skill=>context.skills!.includes(skill)).length*12:0;
  const familyScore=context.preferredFamily===game.family?18:0;
  const timeScore=context.maxMinutes===undefined?0:(game.estimatedMinutes<=context.maxMinutes?6:-30);
  const last=recentById.get(game.id);
  const cooldownMs=game.repeatCooldown*60*1000;
  const cooldownScore=last===undefined?12:now-last>=cooldownMs?5:-45;
  const noveltyScore=recentIds.has(game.id)?-35:10;
  const worldBonus=history.played.some(item=>item.id===game.id&&item.worldId===context.worldId)?-4:0;
  return {game,score:skillScore+familyScore+timeScore+cooldownScore+noveltyScore+worldBonus};
 }).sort((a,b)=>b.score-a.score||a.game.estimatedMinutes-b.game.estimatedMinutes);
 const count=Math.max(1,Math.min(context.count??3,candidates.length));
 const selected:WorldMiniGameCatalogEntry[]=[];
 const families=new Set<WorldMiniGameCatalogEntry['family']>();
 for(const item of scored){
  if(selected.length>=count)break;
  if(selected.length>0&&families.has(item.game.family)&&scored.length>=count+2&&item.score<scored[0].score-20)continue;
  selected.push(item.game);families.add(item.game.family);
 }
 for(const item of scored){if(selected.length>=count)break;if(!selected.some(game=>game.id===item.game.id))selected.push(item.game);}
 return selected;
}

export const worldMiniGameSelectionEngine={select:selectMiniGames,remember:rememberMiniGamePlayed,history:getMiniGameHistory};
