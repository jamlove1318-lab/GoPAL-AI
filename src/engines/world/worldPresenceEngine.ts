import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageWorldId, WorldPlace, languageWorldEngine, resolveLanguageWorld } from './languageWorldEngine';
import { livingWorldSimulation, type LivingWorldSnapshot } from './livingWorldSimulation';
import { createRealLocationDescriptor } from './worldRulesEngine';

export type WorldPresence =
 | { kind:'home'; worldId:'emerald-valley'; label:'Emerald Valley' }
 | { kind:'journey'; worldId:LanguageWorldId; placeId:string; label:string };

const keyFor = (userId: string) => `gopal:world-presence:v2:${userId.trim() || 'local-explorer-user'}`;

function journey(worldId:LanguageWorldId,place:WorldPlace):WorldPresence{
 return {kind:'journey',worldId,placeId:place.id,label:`${place.name}, ${place.city}`};
}

export class WorldPresenceEngine{
 private currentPresence:WorldPresence={kind:'home',worldId:'emerald-valley',label:'Emerald Valley'};
 private simulation:LivingWorldSnapshot|null=null;

 async hydrate(userId='local-explorer-user'):Promise<WorldPresence>{
  try{
   const raw=await AsyncStorage.getItem(keyFor(userId));
   if(!raw){
    this.currentPresence={kind:'home',worldId:'emerald-valley',label:'Emerald Valley'};
    this.simulation=await livingWorldSimulation.hydrate(userId,'emerald-valley',null);
    return this.currentPresence;
   }
   const parsed=JSON.parse(raw) as WorldPresence;
   if(parsed.kind==='journey'){
    const world=resolveLanguageWorld(parsed.worldId);
    const place=world.places.find(item=>item.id===parsed.placeId);
    if(place){
     this.currentPresence=journey(world.id,place);
     this.simulation=await livingWorldSimulation.hydrate(userId,world.id,place.id);
     return this.currentPresence;
    }
   }
   this.currentPresence={kind:'home',worldId:'emerald-valley',label:'Emerald Valley'};
   this.simulation=await livingWorldSimulation.hydrate(userId,'emerald-valley',null);
  }catch{
   this.currentPresence={kind:'home',worldId:'emerald-valley',label:'Emerald Valley'};
  }
  return this.currentPresence;
 }

 current():WorldPresence{return this.currentPresence;}
 simulationState():LivingWorldSnapshot|null{return this.simulation;}

 async goHome(userId='local-explorer-user'):Promise<WorldPresence>{
  this.currentPresence={kind:'home',worldId:'emerald-valley',label:'Emerald Valley'};
  this.simulation=await livingWorldSimulation.advance(userId,'emerald-valley',null,0);
  try{await AsyncStorage.setItem(keyFor(userId),JSON.stringify(this.currentPresence));}catch{}
  return this.currentPresence;
 }

 async travel(worldId:LanguageWorldId,placeId?:string,userId='local-explorer-user'):Promise<WorldPresence>{
  const world=languageWorldEngine.resolve(worldId);
  const place=world.places.find(item=>item.id===placeId)||world.places[0];
  if(!place)throw new Error(`No destinations configured for ${worldId}`);
  const descriptor=createRealLocationDescriptor({id:place.id,worldId:world.id,label:place.name});
  if(!descriptor.kind)throw new Error('World location classification failed.');
  this.currentPresence=journey(world.id,place);
  this.simulation=await livingWorldSimulation.advance(userId,world.id,place.id,0);
  try{await AsyncStorage.setItem(keyFor(userId),JSON.stringify(this.currentPresence));}catch{}
  return this.currentPresence;
 }

 destination():WorldPlace|null{
  if(this.currentPresence.kind!=='journey')return null;
  return resolveLanguageWorld(this.currentPresence.worldId).places.find(item=>item.id===this.currentPresence.placeId)??null;
 }
}

export const worldPresenceEngine=new WorldPresenceEngine();
