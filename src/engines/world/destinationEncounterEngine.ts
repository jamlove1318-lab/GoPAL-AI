import type { LanguageWorldId } from './languageWorldEngine';
import { chooseDestinationResident, getDestinationResident } from './destinationResidentEngine';
import { getWorldLearningScenarios } from './worldLearningScenarioEngine';
import { eventBus } from '../events/eventBus';

export type DestinationEncounter={
 residentId:string; residentName:string; role:string; area:string; activity:string; mood:string;
 title:string; detail:string; languageNeed:string; scenarioId?:string; culturalNote?:string;
 choices:{id:'talk'|'listen'|'learn'|'leave';label:string;detail:string;scenarioId?:string}[];
};

export function createDestinationEncounter(worldId:LanguageWorldId,placeId:string,residentId?:string):DestinationEncounter|null{
 const resident=residentId?getDestinationResident(worldId,placeId,residentId):chooseDestinationResident(worldId,placeId);
 if(!resident)return null;
 const scenario=getWorldLearningScenarios(worldId,placeId)[0];
 return{
  residentId:resident.id,residentName:resident.name,role:resident.role,area:resident.area,activity:resident.activity,mood:resident.mood,
  title:`${resident.name} is ${resident.activity}`,
  detail:resident.conversationHook,
  languageNeed:resident.languageNeed,
  scenarioId:scenario?.id,
  culturalNote:scenario?.culturalNote,
  choices:[
   {id:'talk',label:'Talk',detail:`Start naturally. ${resident.name} gives you space to respond.`,scenarioId:scenario?.id},
   {id:'listen',label:'Listen first',detail:`Listen for what ${resident.name} says before deciding what you want to say.`},
   {id:'learn',label:'Ask Cassidy for help',detail:'Cassidy can help you notice the language you need without taking the moment away from you.',scenarioId:scenario?.id},
   {id:'leave',label:'Keep exploring',detail:'The encounter can remain unfinished. The world does not stop because you walked away.'}
  ]
 };
}

export async function recordDestinationEncounter(worldId:LanguageWorldId,placeId:string,residentId:string,userId='local-explorer-user'){
 const resident=getDestinationResident(worldId,placeId,residentId);
 if(!resident)return null;
 eventBus.emit('world:residentEncountered',{residentId:resident.id,residentName:resident.name,activity:resident.activity,locationId:placeId,userId},'world');
 return createDestinationEncounter(worldId,placeId,residentId);
}

export const destinationEncounterEngine={create:createDestinationEncounter,record:recordDestinationEncounter};
