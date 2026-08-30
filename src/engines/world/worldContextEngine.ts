import { WorldPlace } from './languageWorldEngine';
import { WorldPresence, worldPresenceEngine } from './worldPresenceEngine';

export type WorldContext={
 presence:WorldPresence;
 destination:WorldPlace|null;
 mode:'home'|'journey';
 learningPurpose:string[];
 cassidyContext:string;
};

export class WorldContextEngine{
 resolve(presence:WorldPresence=worldPresenceEngine.current()):WorldContext{
  const destination=presence.kind==='journey'?worldPresenceEngine.destination():null;
  if(!destination)return{
   presence,
   destination:null,
   mode:'home',
   learningPurpose:['reflect','rest','prepare','remember'],
   cassidyContext:'home'
  };
  return{
   presence,
   destination,
   mode:'journey',
   learningPurpose:destination.purpose.split(',').map(value=>value.trim()).filter(Boolean),
   cassidyContext:`journey:${presence.worldId}:${destination.id}`
  };
 }
}

export const worldContextEngine=new WorldContextEngine();
