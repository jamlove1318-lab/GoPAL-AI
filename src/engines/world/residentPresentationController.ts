import { createResidentPresentation, updateResidentPresentation, type ResidentPresentationState } from './residentPresentationEngine';
import type { ResidentContextReaction } from './residentContextReactionEngine';
import type { ResidentRoutineState } from './residentRoutineEngine';

export function createResidentPresentationController(residentId:string,name:string,routine:ResidentRoutineState,reaction?:ResidentContextReaction|null):ResidentPresentationState{return createResidentPresentation(residentId,name,routine,reaction);}
export function syncResidentPresentation(state:ResidentPresentationState,routine:ResidentRoutineState,reaction?:ResidentContextReaction|null):ResidentPresentationState{if(reaction)return updateResidentPresentation({...state,activity:routine.activity,energy:routine.energy},reaction);return {...state,activity:routine.activity,energy:routine.energy,motion:routine.motion,animationKey:`${state.residentId}:${routine.motion}:${state.expression}`};}
export const residentPresentationController={create:createResidentPresentationController,sync:syncResidentPresentation};
