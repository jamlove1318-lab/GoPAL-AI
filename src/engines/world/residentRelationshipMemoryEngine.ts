import type { ResidentMotion } from './livingResidentEncounterEngine';

export type ResidentRelationshipMemory={id:string;residentId:string;type:'first-meeting'|'success'|'difficulty'|'shared-moment'|'goodbye';summary:string;createdAt:number};
export type ResidentRelationshipState={residentId:string;familiarity:number;trust:number;warmth:number;memories:ResidentRelationshipMemory[];lastInteractionAt:number|null};
export type RelationshipOutcome='success'|'difficulty'|'shared-moment'|'goodbye';

export function createResidentRelationshipState(residentId:string):ResidentRelationshipState{return {residentId,familiarity:0,trust:0,warmth:0,memories:[],lastInteractionAt:null};}

export function applyRelationshipOutcome(state:ResidentRelationshipState,outcome:RelationshipOutcome,summary:string,date=new Date()):ResidentRelationshipState {
 const deltas:Record<RelationshipOutcome,[number,number,number]>={success:[2,2,2],difficulty:[1,0,1],'shared-moment':[2,1,3],goodbye:[1,1,2]};
 const [familiarity,trust,warmth]=deltas[outcome];
 const memory:ResidentRelationshipMemory={id:`${state.residentId}:${date.getTime()}:${outcome}`,residentId:state.residentId,type:outcome,summary,createdAt:date.getTime()};
 return {...state,familiarity:Math.min(100,state.familiarity+familiarity),trust:Math.min(100,state.trust+trust),warmth:Math.min(100,state.warmth+warmth),memories:[...state.memories,memory],lastInteractionAt:date.getTime()};
}

export function relationshipAwareMotion(state:ResidentRelationshipState):ResidentMotion { if(state.warmth>=12)return 'warm'; if(state.familiarity>=8)return 'gesturing'; return 'idle'; }
export const residentRelationshipMemoryEngine={create:createResidentRelationshipState,apply:applyRelationshipOutcome,motion:relationshipAwareMotion};
