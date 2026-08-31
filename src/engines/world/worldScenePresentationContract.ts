import type { LanguageWorldId } from './languageWorldEngine';
import type { ResidentMotion, EncounterAtmosphere } from './livingResidentEncounterEngine';
import type { ArrivalShot } from './destinationArrivalSceneEngine';

export type SceneVisualState={
 worldId:LanguageWorldId;
 placeId:string;
 phase:'arrival'|'encounter';
 backgroundKey:string;
 atmosphere:EncounterAtmosphere;
 camera:{mode:'cinematic'|'face-to-face';shot?:ArrivalShot;transition:'smooth'|'cut'};
 weather:{enabled:true;continuesDuringTransition:true};
 environment:{enabled:true;continuesDuringTransition:true};
 resident?:{
  visible:true;
  motion:ResidentMotion;
  expression:string;
  attention:'learner'|'environment'|'task';
 };
 interaction?:{
  visible:true;
  inputMethods:Array<'type'|'speak'|'guided'>;
  typingAlwaysAvailable:true;
 };
};

export function buildArrivalVisualState(worldId:LanguageWorldId,placeId:string,backgroundKey:string,atmosphere:EncounterAtmosphere,shot:ArrivalShot='establishing'):SceneVisualState{
 return {worldId,placeId,phase:'arrival',backgroundKey,atmosphere,camera:{mode:'cinematic',shot,transition:'smooth'},weather:{enabled:true,continuesDuringTransition:true},environment:{enabled:true,continuesDuringTransition:true}};
}

export function buildEncounterVisualState(base:SceneVisualState,resident:{motion:ResidentMotion;expression:string;attention:'learner'|'environment'|'task'}):SceneVisualState{
 return {...base,phase:'encounter',camera:{mode:'face-to-face',transition:'smooth'},resident:{visible:true,...resident},interaction:{visible:true,inputMethods:['type','speak','guided'],typingAlwaysAvailable:true}};
}

export const worldScenePresentationContract={buildArrival:buildArrivalVisualState,buildEncounter:buildEncounterVisualState};
