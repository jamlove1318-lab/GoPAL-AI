import type { ResidentContextReaction } from './residentContextReactionEngine';
import type { ResidentRoutineState } from './residentRoutineEngine';

export type ResidentPresentationState={residentId:string;name:string;expression:'neutral'|'curious'|'warm'|'thinking'|'happy'|'encouraging';motion:'idle'|'breathing'|'listening'|'gesturing'|'thinking'|'working'|'greeting'|'goodbye';activity:'idle'|'walking'|'working'|'talking'|'observing';energy:number;shouldLookAtLearner:boolean;animationKey:string};

export function createResidentPresentation(residentId:string,name:string,routine:ResidentRoutineState,reaction?:ResidentContextReaction|null):ResidentPresentationState{return {residentId,name,expression:reaction?.expression??'neutral',motion:reaction?.motion??routine.motion,activity:routine.activity,energy:routine.energy,shouldLookAtLearner:true,animationKey:`${residentId}:${reaction?.motion??routine.motion}:${reaction?.expression??'neutral'}`};}

export function updateResidentPresentation(current:ResidentPresentationState,reaction:ResidentContextReaction):ResidentPresentationState{return {...current,expression:reaction.expression,motion:reaction.motion,shouldLookAtLearner:true,animationKey:`${current.residentId}:${reaction.motion}:${reaction.expression}`};}

export const residentPresentationEngine={create:createResidentPresentation,update:updateResidentPresentation};
