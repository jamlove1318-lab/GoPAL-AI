import type { EncounterAtmosphere } from './livingResidentEncounterEngine';
import type { WorldSimulationSnapshot } from './worldSimulationSnapshot';
import type { ResidentRoutineState } from './residentRoutineEngine';

export type WorldEventKind='weather-shift'|'ambient-life'|'resident-moment'|'place-moment'|'rare-surprise';
export type WorldEvent={id:string;kind:WorldEventKind;priority:'low'|'normal'|'rare';description:string;residentReaction?:'notice'|'gesture'|'laugh'|'surprised';durationMs:number;cooldownMs:number};
export type WorldEventContext={snapshot:WorldSimulationSnapshot;routine:ResidentRoutineState;learnerSuccesses:number;learnerConfusions:number;minutesInScene:number};

export function chooseOfflineWorldEvent(context:WorldEventContext):WorldEvent|null {
 const {snapshot,routine,learnerSuccesses,learnerConfusions,minutesInScene}=context;
 if(minutesInScene<1)return null;
 const candidates:WorldEvent[]=[];
 if(snapshot.weather.condition!=='clear')candidates.push({id:'weather-detail',kind:'weather-shift',priority:'normal',description:'The changing weather briefly becomes noticeable in the scene.',residentReaction:'notice',durationMs:1800,cooldownMs:300000});
 if(routine.attention==='task')candidates.push({id:'resident-routine-moment',kind:'resident-moment',priority:'low',description:'The resident briefly returns to their everyday routine.',durationMs:2200,cooldownMs:180000});
 if(snapshot.life.ambientActivity>0.7)candidates.push({id:'ambient-life',kind:'ambient-life',priority:'normal',description:'A small piece of local life passes naturally through the environment.',durationMs:2400,cooldownMs:240000});
 if(learnerSuccesses>0&&learnerConfusions===0)candidates.push({id:'resident-encouragement',kind:'resident-moment',priority:'low',description:'The resident reacts warmly to the learner’s progress.',residentReaction:'gesture',durationMs:1700,cooldownMs:240000});
 if(learnerConfusions>0)candidates.push({id:'resident-kindness',kind:'resident-moment',priority:'low',description:'The resident gives a patient, reassuring reaction after a difficult moment.',residentReaction:'notice',durationMs:1800,cooldownMs:240000});
 const rareSeed=(snapshot.life.localMotionSeed+minutesInScene*17)%37;
 if(rareSeed===0)candidates.push({id:'rare-place-surprise',kind:'rare-surprise',priority:'rare',description:'A brief unexpected but harmless local moment occurs nearby.',residentReaction:'surprised',durationMs:2600,cooldownMs:900000});
 if(candidates.length===0)return null;
 return candidates[(snapshot.life.localMotionSeed+minutesInScene)%candidates.length];
}

export function atmosphereForEvent(event:WorldEvent):EncounterAtmosphere|undefined{return event.kind==='weather-shift'?'seasonal':event.kind==='rare-surprise'?'energetic':undefined;}
export const contextualWorldEventEngine={choose:chooseOfflineWorldEvent,atmosphereForEvent};
