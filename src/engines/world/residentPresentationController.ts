import { createResidentPresentation, updateResidentPresentation, type ResidentPresentationState } from './residentPresentationEngine';
import type { ResidentContextReaction } from './residentContextReactionEngine';
import type { ResidentRoutineState } from './residentRoutineEngine';

export function createResidentPresentationController(residentId:string,name:string,routine:ResidentRoutineState,reaction?:ResidentContextReaction|null):ResidentPresentationState{return createResidentPresentation(residentId,name,routine,reaction);}
export function syncResidentPresentation(state:ResidentPresentationState,routine:ResidentRoutineState,reaction?:ResidentContextReaction|null):ResidentPresentationState{if(reaction)return updateResidentPresentation({...state,activity:routine.activity==='walking'||routine.activity==='commuting'?'walking':routine.activity==='working'?'working':routine.activity==='socializing'?'talking':routine.activity==='shopping'?'observing':'idle',energy:routine.energy},reaction);return createResidentPresentation(state.residentId,state.name,routine);}
export const residentPresentationController={create:createResidentPresentationController,sync:syncResidentPresentation};
