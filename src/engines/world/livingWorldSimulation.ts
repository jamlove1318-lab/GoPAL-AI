import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventBus } from '../events/eventBus';
import { environmentEngine } from './environmentEngine';

export type WorldSimulationPhase = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
export type WorldWeather = 'clear' | 'cloudy' | 'rain' | 'wind' | 'snow';
export interface LivingWorldSnapshot { worldId:string; locationId:string|null; phase:WorldSimulationPhase; weather:WorldWeather; season:string; day:number; visits:number; lastUpdatedAt:string; }
const keyFor=(userId:string)=>`gopal:living-world:v1:${userId.trim()||'local-explorer-user'}`;
const phaseFromHour=(hour:number):WorldSimulationPhase=>hour<6?'night':hour<9?'dawn':hour<12?'morning':hour<18?'afternoon':hour<22?'evening':'night';
const toSimulationWeather=(weather:string):WorldWeather=>{
  switch(weather){
    case 'rain': case 'light-rain': return 'rain';
    case 'wind': case 'windy': case 'breeze': return 'wind';
    case 'snow': return 'snow';
    case 'cloudy': case 'humid': case 'cold': return 'cloudy';
    default: return 'clear';
  }
};
export class LivingWorldSimulation{
 async hydrate(userId:string,fallbackWorldId='emerald-valley',fallbackLocationId:string|null=null){const existing=await this.get(userId);return existing??this.advance(userId,fallbackWorldId,fallbackLocationId,0);}
 async get(userId:string):Promise<LivingWorldSnapshot|null>{try{const raw=await AsyncStorage.getItem(keyFor(userId));if(!raw)return null;const parsed=JSON.parse(raw) as LivingWorldSnapshot;return parsed&&typeof parsed==='object'&&typeof parsed.worldId==='string'?parsed:null;}catch{return null;}}
 async advance(userId:string,worldId:string,locationId:string|null,elapsedMinutes=0):Promise<LivingWorldSnapshot>{const previous=await this.get(userId);const now=new Date();const environment=environmentEngine.resolve(now);const day=Math.floor(now.getTime()/86400000);const snapshot={worldId,locationId,phase:phaseFromHour(now.getHours()),weather:toSimulationWeather(environment.weather),season:environment.season,day,visits:(previous?.visits??0)+(locationId&&previous?.locationId!==locationId?1:0),lastUpdatedAt:now.toISOString()};try{await AsyncStorage.setItem(keyFor(userId),JSON.stringify(snapshot));}catch{}if(locationId&&previous?.locationId!==locationId)eventBus.emit('world:destinationLifeShifted',{worldId,placeId:locationId,elapsedMinutes:Math.max(0,elapsedMinutes),visits:snapshot.visits,phase:snapshot.visits<=1?'first-visit':snapshot.visits>=5?'returning':'recent'},'world');return snapshot;}
}
export const livingWorldSimulation=new LivingWorldSimulation();
