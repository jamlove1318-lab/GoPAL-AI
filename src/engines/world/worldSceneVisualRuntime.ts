import type { LanguageWorldId } from './languageWorldEngine';
import { createWorldSceneRuntime, enterResidentEncounter, type WorldSceneRuntimeState } from './worldSceneRuntime';
import { createWorldSimulationSnapshot, type WorldSimulationSnapshot } from './worldSimulationSnapshot';
import { buildArrivalVisualState, buildEncounterVisualState, type SceneVisualState } from './worldScenePresentationContract';
import { createResidentAnimationSequence, type ResidentAnimationSequence } from './residentAnimationDirector';

export type WorldSceneVisualRuntimeState={
 scene:WorldSceneRuntimeState;
 simulation:WorldSimulationSnapshot;
 visual:SceneVisualState;
 animation:ResidentAnimationSequence|null;
};

export function createWorldSceneVisualRuntime(worldId:LanguageWorldId,placeId:string,residentId?:string,date=new Date()):WorldSceneVisualRuntimeState {
 const scene=createWorldSceneRuntime(worldId,placeId,residentId);
 const simulation=createWorldSimulationSnapshot(worldId,placeId,date);
 const visual=buildArrivalVisualState(worldId,placeId,scene.arrival.backgroundKey,scene.arrival.atmosphere,'establishing');
 return {scene,simulation,visual,animation:null};
}

export function revealResident(state:WorldSceneVisualRuntimeState):WorldSceneVisualRuntimeState {
 if(!state.scene.encounter)return state;
 const scene=enterResidentEncounter(state.scene);
 const visual=buildEncounterVisualState(state.visual,{motion:'warm',expression:'welcoming',attention:'learner'});
 return {...state,scene,visual,animation:createResidentAnimationSequence('enter')};
}

export function respondToLearner(state:WorldSceneVisualRuntimeState,input:'typed'|'spoken',outcome:'success'|'confusion'='success'):WorldSceneVisualRuntimeState {
 if(state.scene.phase!=='encounter')return state;
 const trigger=outcome==='success'?'success':input==='typed'?'learner-typed':'learner-spoke';
 return {...state,animation:createResidentAnimationSequence(trigger)};
}

export function advanceWorldScene(state:WorldSceneVisualRuntimeState,date=new Date()):WorldSceneVisualRuntimeState {
 const simulation=createWorldSimulationSnapshot(state.scene.worldId,state.scene.placeId,date);
 return {...state,simulation};
}

export const worldSceneVisualRuntime={create:createWorldSceneVisualRuntime,revealResident,respondToLearner,advance:advanceWorldScene};
