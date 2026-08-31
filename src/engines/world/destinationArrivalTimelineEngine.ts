import type { ArrivalScene, ArrivalShot } from './destinationArrivalSceneEngine';

export type ArrivalTimelineStep={shot:ArrivalShot;startMs:number;durationMs:number;camera:'establishing'|'wide-environment'|'detail'|'resident-reveal';canSkip:boolean};
export type ArrivalTimeline={sceneId:string;steps:ArrivalTimelineStep[];totalDurationMs:number;handoffAtMs:number;weatherContinues:true;environmentContinues:true;nextPhase:'encounter'};

export function createArrivalTimeline(scene:ArrivalScene):ArrivalTimeline {
 const durations=[1100,1700,1200,1100,1400];
 const cameras:Array<ArrivalTimelineStep['camera']>=['establishing','wide-environment','detail','detail','resident-reveal'];
 let startMs=0;
 const steps=scene.shots.map((shot,i)=>{const durationMs=durations[i]??1200;const item={shot,startMs,durationMs,camera:cameras[i]??'wide-environment',canSkip:i>0};startMs+=durationMs;return item;});
 return {sceneId:scene.id,steps,totalDurationMs:startMs,handoffAtMs:startMs,weatherContinues:true,environmentContinues:true,nextPhase:'encounter'};
}

export function getArrivalStep(timeline:ArrivalTimeline,elapsedMs:number):ArrivalTimelineStep|undefined{return timeline.steps.find(step=>elapsedMs>=step.startMs&&elapsedMs<step.startMs+step.durationMs)??timeline.steps[timeline.steps.length-1];}

export function isArrivalComplete(timeline:ArrivalTimeline,elapsedMs:number):boolean{return elapsedMs>=timeline.handoffAtMs;}
export const destinationArrivalTimelineEngine={create:createArrivalTimeline,getStep:getArrivalStep,isComplete:isArrivalComplete};
