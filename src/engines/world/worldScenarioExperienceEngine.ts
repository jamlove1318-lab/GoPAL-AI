import type { LanguageWorldId } from './languageWorldEngine';
import { createDestinationArrivalScene } from './destinationArrivalSceneEngine';
import { createArrivalTimeline } from './destinationArrivalTimelineEngine';
import { createDestinationDepartureScene, type DepartureBeat } from './destinationDepartureSceneEngine';
import { createWorldSceneVisualRuntime, revealResident, respondToLearner, advanceWorldScene, beginGoodbye, type WorldSceneVisualRuntimeState } from './worldSceneVisualRuntime';

export type ScenarioExperiencePhase='arrival'|'encounter'|'departure'|'world';
export type ScenarioOutcome='success'|'confusion'|'completed';
export type LearnerTurnMode='typed'|'spoken'|'guided';
export type ScenarioExperienceState={phase:ScenarioExperiencePhase;runtime:WorldSceneVisualRuntimeState;arrivalElapsedMs:number;departure:{beats:DepartureBeat[];elapsedMs:number}|null;outcome:ScenarioOutcome|null};

export function startScenario(worldId:LanguageWorldId,placeId:string,residentId:string,date=new Date()):ScenarioExperienceState{const runtime=createWorldSceneVisualRuntime(worldId,placeId,residentId,date);const arrival=createDestinationArrivalScene(worldId,placeId);createArrivalTimeline(arrival);return{phase:'arrival',runtime,arrivalElapsedMs:0,departure:null,outcome:null};}

export function advanceArrival(state:ScenarioExperienceState,elapsedMs:number):ScenarioExperienceState{if(state.phase!=='arrival')return state;const next=Math.max(0,state.arrivalElapsedMs+elapsedMs);const timeline=createArrivalTimeline(state.runtime.scene.arrival);if(next<timeline.handoffAtMs)return{...state,arrivalElapsedMs:next,runtime:advanceWorldScene(state.runtime)};return{...state,phase:'encounter',arrivalElapsedMs:timeline.handoffAtMs,runtime:revealResident(state.runtime)};}

export function submitLearnerTurn(state:ScenarioExperienceState,input:LearnerTurnMode,outcome:'success'|'confusion'):ScenarioExperienceState{if(state.phase!=='encounter')return state;return{...state,runtime:respondToLearner(state.runtime,input,outcome),outcome};}

export function completeScenario(state:ScenarioExperienceState,outcome:ScenarioOutcome='completed'):ScenarioExperienceState{if(state.phase!=='encounter')return state;const departure=createDestinationDepartureScene(state.runtime.scene.worldId,state.runtime.scene.placeId,'warm');return{...state,phase:'departure',departure:{beats:departure.beats,elapsedMs:0},outcome,runtime:beginGoodbye(state.runtime)};}

export function advanceDeparture(state:ScenarioExperienceState,elapsedMs:number):ScenarioExperienceState{if(state.phase!=='departure'||!state.departure)return state;const elapsed=Math.max(0,state.departure.elapsedMs+elapsedMs);if(elapsed<4200)return{...state,departure:{...state.departure,elapsedMs:elapsed},runtime:advanceWorldScene(state.runtime)};return{...state,phase:'world',departure:{...state.departure,elapsedMs:4200},runtime:advanceWorldScene(state.runtime)};}

export const worldScenarioExperienceEngine={start:startScenario,advanceArrival,submitLearnerTurn,complete:completeScenario,advanceDeparture};
