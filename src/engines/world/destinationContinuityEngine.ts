import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LanguageWorldId } from './languageWorldEngine';
import { eventBus } from '../events/eventBus';

const KEY='gopal:destination-continuity:v2';
type Stored={lastVisitedAt:string;visits:number;seed:number};
export type DestinationReturn={worldId:LanguageWorldId;placeId:string;elapsedMinutes:number;visits:number;changed:boolean;phase:'first-visit'|'recent'|'returning'|'long-away';message:string;seed:number};

const userKey=(userId:string,worldId:LanguageWorldId,placeId:string)=>`${KEY}:${userId.trim()||'local-explorer-user'}:${worldId}:${placeId}`;
const phase=(minutes:number,first:boolean):DestinationReturn['phase']=>first?'first-visit':minutes<30?'recent':minutes<360?'returning':'long-away';
const message=(p:DestinationReturn['phase'])=>p==='first-visit'?'The place is new to you. Take a moment to notice what is around you.':p==='recent'?'The place is still familiar, but something may be slightly different.':p==='returning'?'Life here has continued while you were away.':'You have been gone a while. This place has had time to change.';

export class DestinationContinuityEngine{
 async enter(worldId:LanguageWorldId,placeId:string,now=new Date(),userId='local-explorer-user'):Promise<DestinationReturn>{
  const key=userKey(userId,worldId,placeId);
  let previous:Stored|null=null;
  try{const raw=await AsyncStorage.getItem(key);previous=raw?JSON.parse(raw) as Stored:null;}catch{}
  const elapsedMinutes=previous?Math.max(0,Math.floor((now.getTime()-new Date(previous.lastVisitedAt).getTime())/60000)):0;
  const visits=(previous?.visits??0)+1;
  const seed=((previous?.seed??Math.floor(now.getTime()%100000))+visits*31)%100000;
  const p=phase(elapsedMinutes,!previous);
  const result={worldId,placeId,elapsedMinutes,visits,changed:!!previous&&elapsedMinutes>=30,phase:p,message:message(p),seed};
  try{await AsyncStorage.setItem(key,JSON.stringify({lastVisitedAt:now.toISOString(),visits,seed}));}catch{}
  eventBus.emit('world:destinationLifeShifted',{worldId,placeId,elapsedMinutes,visits,phase:p},'world');
  return result;
 }
}
export const destinationContinuityEngine=new DestinationContinuityEngine();