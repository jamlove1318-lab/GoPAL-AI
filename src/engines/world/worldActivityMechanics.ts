import {distance,isInside,nearestItem,sequenceMatches,toggleSelection,type ActivityItem,type ActivityPoint,type ActivityRect} from './worldActivityPrimitives';

export type ActivityMechanicState={selectedIds:string[];sequence:string[];score:number;attempts:number;completed:boolean};
export const createActivityMechanicState=():ActivityMechanicState=>({selectedIds:[],sequence:[],score:0,attempts:0,completed:false});
export function selectObject(state:ActivityMechanicState,item:ActivityItem){const selectedIds=toggleSelection(state.selectedIds,item.id);return{...state,selectedIds,attempts:state.attempts+1,score:state.score+(item.correct?100:0)}}
export function placeObject(state:ActivityMechanicState,point:ActivityPoint,target:ActivityRect){const correct=isInside(point,target);return{...state,attempts:state.attempts+1,score:state.score+(correct?100:0),completed:correct}}
export function followSequence(state:ActivityMechanicState,id:string,expected:string[]){const sequence=[...state.sequence,id];const correct=sequenceMatches(sequence,expected.slice(0,sequence.length));return{...state,sequence,attempts:state.attempts+1,score:state.score+(correct&&sequence.length===expected.length?100:0),completed:correct&&sequence.length===expected.length}}
export function findNearest(point:ActivityPoint,items:ActivityItem[],maxDistance=Infinity){return nearestItem(point,items,maxDistance)}
export function moveTowards(from:ActivityPoint,to:ActivityPoint,maxStep:number){const d=distance(from,to);if(d===0||d<=maxStep)return to;const ratio=maxStep/d;return{x:from.x+(to.x-from.x)*ratio,y:from.y+(to.y-from.y)*ratio}}
