import type { LanguageWorldId } from './languageWorldEngine';
import { createWorldSceneRuntime, enterResidentEncounter, type WorldSceneRuntimeState } from './worldSceneRuntime';
import { createWorldSimulationSnapshot, type WorldSimulationSnapshot } from './worldSimulationSnapshot';
import { buildArrivalVisualState, buildEncounterVisualState, type SceneVisualState } from './worldScenePresentationContract';
import { createResidentAnimationSequence, type ResidentAnimationSequence } from './residentAnimationDirector';

export type LearnerInputMode='typed'|'spoken'|'guided';
export type ResidentTurnState='idle'|'listening'|'thinking'|'responding';
export type WorldSceneVisualRuntimeState={scene:WorldSceneRuntimeState;simulation:WorldSimulationSnapshot;visual:SceneVisualState;animation:ResidentAnimationSequence|null;interaction:{enabled:boolean;typingAlwaysAvailable:true;inputModes:LearnerInputMode[];residentTurn:ResidentTurnState;lastInput:LearnerInputMode|null}};

export function createWorldSceneVisualRuntime(worldId:LanguageWorldId,placeId:string,residentId?:string,date=new Date()):WorldSceneVisualRuntimeState{const scene=createWorldSceneRuntime(worldId,placeId,residentId);const simulation=createWorldSimulationSnapshot(worldId,placeId,date);const visual=buildArrivalVisualState(worldId,placeId,scene.arrival.backgroundKey,scene.arrival.atmosphere,'establishing');return{scene,simulation,visual,animation:null,interaction:{enabled:false,typingAlwaysAvailable:true,inputModes:['type','speak','guided'],residentTurn:'idle',lastInput:null}};}

export function revealResident(state:WorldSceneVisualRuntimeState):WorldSceneVisualRuntimeState{if(!state.scene.encounter)return state;const scene=enterResidentEncounter(state.scene);const visual=buildEncounterVisualState(state.visual,{motion:'warm',expression:'welcoming',attention:'learner'});return{...state,scene,visual,animation:createResidentAnimationSequence('enter'),interaction:{...state.interaction,enabled:true,residentTurn:'responding',lastInput:null}};}

export function respondToLearner(state:WorldSceneVisualRuntimeState,input:LearnerInputMode,outcome:'success'|'confusion'='success'):WorldSceneVisualRuntimeState{if(state.scene.phase!=='encounter')return state;const trigger=outcome==='success'?'success':input==='spoken'?'learner-spoke':'learner-typed';return{...state,animation:createResidentAnimationSequence(trigger),interaction:{...state.interaction,enabled:true,typingAlwaysAvailable:true,residentTurn:'responding',lastInput:input}};}

export function advanceWorldScene(state:WorldSceneVisualRuntimeState,date=new Date()):WorldSceneVisualRuntimeState{const simulation=createWorldSimulationSnapshot(state.scene.worldId,state.scene.placeId,date);return{...state,simulation};}

export function beginGoodbye(state:WorldSceneVisualRuntimeState):WorldSceneVisualRuntimeState{if(state.scene.phase!=='encounter')return state;return{...state,animation:createResidentAnimationSequence('goodbye'),interaction:{...state.interaction,enabled:false,residentTurn:'responding'}};}

export const worldSceneVisualRuntime={create:createWorldSceneVisualRuntime,revealResident,respondToLearner,advance:advanceWorldScene,beginGoodbye};
