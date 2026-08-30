import type { LanguageWorld } from '../world/languageWorldEngine';
import type { LearningSkill } from './contextualLanguageLearningEngine';
import { worldLearningScenarioEngine } from './worldLearningScenarioEngine';

export type ConversationSupport='guided'|'supported'|'natural'|'authentic';
export type AdaptiveConversation={support:ConversationSupport;skill:LearningSkill;scenarioId?:string;prompt:string;targetPatterns:string[];translation?:string;vocabulary?:{word:string;meaning:string;reading?:string}[];responseOptions?:{text:string;meaning:string;correct:boolean}[];reason:string};

function supportForMastery(mastery:number):ConversationSupport{
 if(mastery<0.25)return 'guided';
 if(mastery<0.5)return 'supported';
 if(mastery<0.75)return 'natural';
 return 'authentic';
}

export function buildAdaptiveConversation(world:LanguageWorld,placeId:string,skill:LearningSkill,mastery=0):AdaptiveConversation{
 const scenario=worldLearningScenarioEngine.forPlace(world.id,placeId);
 const support=supportForMastery(Math.max(0,Math.min(1,mastery)));
 if(scenario&&scenario.skill===skill){
  const supportPrompt=support==='guided'?`Cassidy can guide you through this ${world.languageName} moment.`:support==='supported'?`Try the ${world.languageName} interaction with a little support.`:support==='natural'?`Handle this ${world.languageName} interaction naturally.`:`Respond as you would to a real person in ${world.languageName}.`;
  return {support,skill,scenarioId:scenario.id,prompt:supportPrompt,targetPatterns:[scenario.targetLanguage],translation:scenario.translation,vocabulary:scenario.vocabulary,responseOptions:support==='authentic'?undefined:scenario.responseOptions,reason:`Conversation support adapts to current mastery (${Math.round(mastery*100)}%).`};
 }
 return {support,skill,prompt:`Use ${world.languageName} naturally in ${placeId}.`,targetPatterns:world.culture.greetings.slice(0,2),reason:`Conversation support adapts to current mastery (${Math.round(mastery*100)}%).`};
}

export const adaptiveConversationEngine={build:buildAdaptiveConversation};
