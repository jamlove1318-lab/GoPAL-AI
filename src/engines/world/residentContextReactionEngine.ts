import type { ResidentRelationshipState } from './residentRelationshipMemoryEngine';
import type { ResidentRoutineState } from './residentRoutineEngine';
import type { WorldSimulationSnapshot } from './worldSimulationSnapshot';
import type { WorldEvent } from './contextualWorldEventEngine';

export type ResidentContextReaction={greeting:'new'|'familiar'|'warm';expression:'neutral'|'friendly'|'pleased'|'concerned'|'curious';motion:'idle'|'warm'|'gesturing'|'thinking';dialogueCue:'introduce'|'welcome-back'|'encourage'|'reassure'|'react-to-event';eventId?:string};
export function buildResidentContextReaction(relationship:ResidentRelationshipState,routine:ResidentRoutineState,snapshot:WorldSimulationSnapshot,event?:WorldEvent):ResidentContextReaction {
 const greeting=relationship.familiarity>=8?'warm':relationship.familiarity>0?'familiar':'new';
 if(event?.residentReaction==='surprised')return {greeting,expression:'curious',motion:'gesturing',dialogueCue:'react-to-event',eventId:event.id};
 if(relationship.warmth>=12)return {greeting,expression:'pleased',motion:'warm',dialogueCue:'welcome-back'};
 if(routine.attention==='learner')return {greeting,expression:'friendly',motion:'warm',dialogueCue:'introduce'};
 if(snapshot.weather.condition!=='clear')return {greeting,expression:'curious',motion:'gesturing',dialogueCue:'react-to-event'};
 return {greeting,expression:'neutral',motion:routine.motion==='working'?'idle':'warm',dialogueCue:'introduce'};
}
export const residentContextReactionEngine={build:buildResidentContextReaction};
