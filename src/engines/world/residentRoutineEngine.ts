import type { ResidentMotion } from './livingResidentEncounterEngine';

export type ResidentRoutineActivity='working'|'walking'|'resting'|'socializing'|'shopping'|'commuting'|'idle';
export type ResidentRoutineState={residentId:string;activity:ResidentRoutineActivity;motion:ResidentMotion;attention:'task'|'environment'|'learner';energy:number;nextChangeAt:number};

export function createResidentRoutineState(residentId:string,date=new Date()):ResidentRoutineState {
 const hour=date.getHours();
 const activity:ResidentRoutineActivity=hour<7?'resting':hour<10?'commuting':hour<17?'working':hour<20?'socializing':'resting';
 const motion:ResidentMotion=activity==='working'?'working':activity==='resting'?'idle':activity==='socializing'?'gesturing':'warm';
 return {residentId,activity,motion,attention:'task',energy:activity==='resting'?0.35:0.8,nextChangeAt:date.getTime()+90000};
}

export function advanceResidentRoutine(state:ResidentRoutineState,date=new Date()):ResidentRoutineState {
 if(date.getTime()<state.nextChangeAt)return state;
 const next=state.activity==='working'?'socializing':state.activity==='socializing'?'walking':state.activity==='walking'?'working':'working';
 return {...state,activity:next,motion:next==='working'?'working':next==='socializing'?'gesturing':'warm',attention:'task',nextChangeAt:date.getTime()+90000};
}

export function noticeLearner(state:ResidentRoutineState):ResidentRoutineState{return {...state,attention:'learner',motion:'warm'};}
export function returnToRoutine(state:ResidentRoutineState):ResidentRoutineState{return {...state,attention:'task'};}
export const residentRoutineEngine={create:createResidentRoutineState,advance:advanceResidentRoutine,noticeLearner,returnToRoutine};
