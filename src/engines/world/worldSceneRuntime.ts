import type { LanguageWorldId } from './languageWorldEngine';
import { createDestinationArrivalScene, type ArrivalScene } from './destinationArrivalSceneEngine';
import { createLivingResidentEncounter, type LivingResidentEncounter } from './livingResidentEncounterEngine';

export type WorldScenePhase='arrival'|'encounter';

export type WorldSceneRuntimeState={
 worldId:LanguageWorldId;
 placeId:string;
 phase:WorldScenePhase;
 arrival:ArrivalScene;
 encounter:LivingResidentEncounter|null;
 simulationRunning:true;
 weatherRunning:true;
 environmentRunning:true;
};

export function createWorldSceneRuntime(worldId:LanguageWorldId,placeId:string,residentId?:string):WorldSceneRuntimeState {
 const arrival=createDestinationArrivalScene(worldId,placeId);
 const encounter=residentId?createLivingResidentEncounter(worldId,placeId,residentId):null;
 return {worldId,placeId,phase:'arrival',arrival,encounter,simulationRunning:true,weatherRunning:true,environmentRunning:true};
}

export function enterResidentEncounter(state:WorldSceneRuntimeState):WorldSceneRuntimeState {
 return {...state,phase:'encounter'};
}

export const worldSceneRuntime={create:createWorldSceneRuntime,enterEncounter:enterResidentEncounter};
