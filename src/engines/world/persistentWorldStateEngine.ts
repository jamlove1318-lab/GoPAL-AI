import type { ResidentRelationshipState } from './residentRelationshipMemoryEngine';
import type { WorldSimulationSnapshot } from './worldSimulationSnapshot';
import type { WorldEvent } from './contextualWorldEventEngine';
export type WorldPlaceMemory={placeId:string;visitCount:number;lastVisitedAt:number|null;discoveredEvents:string[];residentIds:string[]};
export type PersistentWorldState={version:1;places:Record<string,WorldPlaceMemory>;relationships:Record<string,ResidentRelationshipState>;worldSnapshot:WorldSimulationSnapshot|null;seenEventIds:string[]};
export function createPersistentWorldState():PersistentWorldState{return {version:1,places:{},relationships:{},worldSnapshot:null,seenEventIds:[]};}
export function recordVisit(state:PersistentWorldState,placeId:string,residentId:string,date=new Date()):PersistentWorldState {const previous=state.places[placeId]??{placeId,visitCount:0,lastVisitedAt:null,discoveredEvents:[],residentIds:[]};return {...state,places:{...state.places,[placeId]:{...previous,visitCount:previous.visitCount+1,lastVisitedAt:date.getTime(),residentIds:previous.residentIds.includes(residentId)?previous.residentIds:[...previous.residentIds,residentId]}}};}
export function recordWorldEvent(state:PersistentWorldState,event:WorldEvent,placeId:string):PersistentWorldState {const place=state.places[placeId];const places=place?{...state.places,[placeId]:{...place,discoveredEvents:place.discoveredEvents.includes(event.id)?place.discoveredEvents:[...place.discoveredEvents,event.id]}}:state.places;return {...state,places,seenEventIds:state.seenEventIds.includes(event.id)?state.seenEventIds:[...state.seenEventIds,event.id]};}
export function setRelationship(state:PersistentWorldState,relationship:ResidentRelationshipState):PersistentWorldState{return {...state,relationships:{...state.relationships,[relationship.residentId]:relationship}};}
export function setWorldSnapshot(state:PersistentWorldState,snapshot:WorldSimulationSnapshot):PersistentWorldState{return {...state,worldSnapshot:snapshot};}
export const persistentWorldStateEngine={create:createPersistentWorldState,recordVisit,recordWorldEvent,setRelationship,setWorldSnapshot};
