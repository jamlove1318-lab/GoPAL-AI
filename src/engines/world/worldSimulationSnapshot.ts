import type { LanguageWorldId } from './languageWorldEngine';
import type { EncounterAtmosphere, ResidentMotion } from './livingResidentEncounterEngine';

export type WorldWeather={condition:'clear'|'cloudy'|'rain'|'snow'|'windy'|'fog';intensity:number;temperatureC:number};
export type WorldLife={peopleMoving:boolean;ambientActivity:number;lightsOn:boolean;localMotionSeed:number};
export type WorldSimulationSnapshot={worldId:LanguageWorldId;placeId:string;localTime:string;dayPhase:'morning'|'day'|'evening'|'night';weather:WorldWeather;life:WorldLife;atmosphere:EncounterAtmosphere;residentMotion:ResidentMotion;updatedAt:number};

function phase(hour:number):WorldSimulationSnapshot['dayPhase'] { if(hour<6)return 'night'; if(hour<12)return 'morning'; if(hour<18)return 'day'; if(hour<22)return 'evening'; return 'night'; }

export function createWorldSimulationSnapshot(worldId:LanguageWorldId,placeId:string,date=new Date()):WorldSimulationSnapshot {
 const hour=date.getHours();
 const seed=Math.floor(date.getTime()/60000);
 const p=phase(hour);
 const weather:WorldWeather={condition:'clear',intensity:0.2,temperatureC:20};
 const life:WorldLife={peopleMoving:p!=='night',ambientActivity:p==='day'?0.9:p==='evening'?0.75:p==='morning'?0.6:0.2,lightsOn:p==='evening'||p==='night',localMotionSeed:seed};
 return {worldId,placeId,localTime:date.toISOString(),dayPhase:p,weather,life,atmosphere:p==='evening'?'warm':p==='day'?'busy':'calm',residentMotion:p==='night'?'idle':p==='day'?'working':'warm',updatedAt:date.getTime()};
}

export function advanceWorldSimulation(snapshot:WorldSimulationSnapshot,date=new Date()):WorldSimulationSnapshot{return createWorldSimulationSnapshot(snapshot.worldId,snapshot.placeId,date);}
export const worldSimulationSnapshot={create:createWorldSimulationSnapshot,advance:advanceWorldSimulation};
