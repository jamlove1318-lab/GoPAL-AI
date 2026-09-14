import type { WorldTheme } from '../components/LivingWorldPrimitives';
import type { WorldInfrastructureDefinition, WorldInfrastructureNetwork } from './livingWorldInfrastructure';
import type { WorldTransportDefinition } from './livingWorldTransport';
import type { WorldCharacterDefinition, WorldCharacterSpawnPoint } from './livingWorldCharacters';
import type { WorldEntranceDefinition } from './livingWorldEntrances';
import { getLanguageWorldLocation } from './livingLanguageWorldLocations';

/** Shared physical-world defaults for real and fictional locations inside language worlds. */
function theme(locationId:string):WorldTheme{
  const location=getLanguageWorldLocation(locationId);
  if(!location)return'emerald';
  if(location.tags.includes('history')||location.tags.includes('tradition'))return'festival';
  if(location.tags.includes('nature')||location.tags.includes('garden'))return'emerald';
  return'coastal';
}

export function getLanguageWorldInfrastructure(locationId:string):WorldInfrastructureDefinition[]{
  const location=getLanguageWorldLocation(locationId);
  if(!location)return[];
  const t=theme(locationId);
  const id=location.id;
  return [
    {id:`${id}-bus-stop`,kind:'bus-stop',x:54,y:60,label:'Local Transit',interactive:true,zIndex:18,theme:t},
    {id:`${id}-intersection`,kind:'intersection',x:50,y:56,width:18,height:18,variant:'language-world',zIndex:15,theme:t},
    {id:`${id}-crossing`,kind:'traffic-signal',x:53,y:55,scale:.75,variant:'language-world',zIndex:19,theme:t},
    {id:`${id}-light-1`,kind:'street-light',x:35,y:49,scale:.72,zIndex:19,theme:t},
    {id:`${id}-light-2`,kind:'street-light',x:68,y:54,scale:.72,zIndex:19,theme:t},
    {id:`${id}-bench`,kind:'parking',x:82,y:69,width:12,height:7,variant:'small',zIndex:8,theme:t},
    ...(location.tags.includes('coast')||location.tags.includes('harbor')?[{id:`${id}-pier`,kind:'pier' as const,x:86,y:70,width:8,height:20,rotation:2,variant:'wood',zIndex:11,theme:t}]:[]),
  ];
}

export function getLanguageWorldInfrastructureNetworks(locationId:string):WorldInfrastructureNetwork[]{
  const location=getLanguageWorldLocation(locationId);
  if(!location)return[];
  const t=theme(locationId);
  const id=location.id;
  return [
    {id:`${id}-main-road`,kind:'road',points:[{x:-5,y:63},{x:22,y:57},{x:50,y:56},{x:77,y:51},{x:105,y:48}],width:21,variant:'language-world',theme:t},
    {id:`${id}-local-road`,kind:'road',points:[{x:50,y:56},{x:43,y:40},{x:42,y:24}],width:14,variant:'language-world',theme:t},
    {id:`${id}-sidewalk`,kind:'sidewalk',points:[{x:18,y:61},{x:43,y:57},{x:67,y:54},{x:88,y:61}],width:7,variant:'paved',theme:t},
  ];
}

export function getLanguageWorldTransport(locationId:string):WorldTransportDefinition[]{
  const location=getLanguageWorldLocation(locationId);
  if(!location)return[];
  const t=theme(locationId);
  const id=location.id;
  return [{id:`${id}-transit`,kind:'railway',theme:t,features:[
    {id:`${id}-rail-bed`,kind:'track',path:'M-20 700C80 650 150 610 235 585C310 563 365 555 430 545',width:22,color:'#5b5046',edgeColor:'#3b342f',edgeWidth:2,opacity:.78,zIndex:4,networkId:`${id}-transit`,routePoints:[{x:0,y:92},{x:25,y:83},{x:50,y:74},{x:70,y:69},{x:92,y:66}]},
    {id:`${id}-rail-1`,kind:'track',path:'M-20 694C80 644 150 604 235 579C310 557 365 549 430 539',width:3,color:'#b7b1a5',zIndex:5,networkId:`${id}-transit`,routePoints:[{x:0,y:91},{x:25,y:82},{x:50,y:73},{x:70,y:68},{x:92,y:65}]},
    {id:`${id}-rail-2`,kind:'track',path:'M-20 706C80 656 150 616 235 591C310 569 365 561 430 551',width:3,color:'#b7b1a5',zIndex:5,networkId:`${id}-transit`},
    {id:`${id}-platform`,kind:'platform',path:'M280 578L382 548',width:28,color:'#c9c0ad',edgeColor:'#817767',edgeWidth:2,zIndex:6,networkId:`${id}-transit`},
  ]}];
}

export function getLanguageWorldCharacters(locationId:string):WorldCharacterDefinition[]{
  const location=getLanguageWorldLocation(locationId);
  if(!location)return[];
  const prefix=location.worldId==='japanese'?'Japanese':'French';
  const residentName=location.city?`${location.city} Local`:`${prefix} Local`;
  return [
    {id:`${locationId}-guide`,role:'guide',x:52,y:48,scale:.95,name:`${prefix} Guide`,label:`${prefix} Guide`,tags:['language-world','guide','travel'],scheduleId:'language-guide',interactive:true,interactionRadius:9,metadata:{worldId:location.worldId,locationKind:location.kind,locationId}},
    {id:`${locationId}-teacher`,role:'teacher',x:43,y:43,scale:.92,name:`${prefix} Teacher`,label:`${prefix} Teacher`,tags:['language-world','learning','lesson'],scheduleId:'language-teacher',interactive:true,interactionRadius:9,metadata:{worldId:location.worldId,locationKind:location.kind,experiences:location.experiences}},
    {id:`${locationId}-local`,role:'resident',x:68,y:60,scale:.9,name:residentName,label:residentName,tags:['language-world','resident','conversation'],scheduleId:'language-resident',interactive:true,interactionRadius:8,metadata:{worldId:location.worldId,locationKind:location.kind}},
  ];
}

export function getLanguageWorldSpawnPoints(locationId:string):WorldCharacterSpawnPoint[]{
  const location=getLanguageWorldLocation(locationId);
  if(!location)return[];
  return [
    {id:`${locationId}-resident-spawn`,x:28,y:52,role:'resident',tags:['language-world','resident',location.worldId],maxCount:5,respawn:true},
    {id:`${locationId}-traveler-spawn`,x:74,y:65,role:'traveler',tags:['language-world','traveler'],maxCount:3,respawn:true},
  ];
}

export function getLanguageWorldEntrances(locationId:string):WorldEntranceDefinition[]{
  const location=getLanguageWorldLocation(locationId);
  if(!location)return[];
  const t=theme(locationId);
  return [
    {id:`${locationId}-learning-entrance`,kind:'door',x:42,y:48,targetId:`${locationId}-learning-interior`,targetType:'interior',label:'Enter Learning Place',interactive:true,theme:t,tags:['learning','language-world']},
    {id:`${locationId}-hub-entrance`,kind:'entrance',x:70,y:62,targetId:`${locationId}-hub`,targetType:'building',label:`Explore ${location.name}`,interactive:true,theme:t,tags:['exploration','language-world']},
  ];
}
