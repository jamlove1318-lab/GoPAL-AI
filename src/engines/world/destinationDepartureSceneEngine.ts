import type { LanguageWorldId } from './languageWorldEngine';
import type { ResidentMotion } from './livingResidentEncounterEngine';

export type DepartureBeat='completion'|'resident-goodbye'|'world-change'|'surprise'|'fade-out';
export type DepartureScene={id:string;worldId:LanguageWorldId;placeId:string;beats:DepartureBeat[];durationMs:number;residentMotion:ResidentMotion;worldContinues:true;subtle:true;skipAllowed:true;transition:'return-to-world'};

export function createDestinationDepartureScene(worldId:LanguageWorldId,placeId:string,residentMotion:ResidentMotion='warm'):DepartureScene {
 return {id:`${placeId}:departure`,worldId,placeId,beats:['completion','resident-goodbye','world-change','surprise','fade-out'],durationMs:4200,residentMotion,worldContinues:true,subtle:true,skipAllowed:true,transition:'return-to-world'};
}

export const destinationDepartureSceneEngine={create:createDestinationDepartureScene};
