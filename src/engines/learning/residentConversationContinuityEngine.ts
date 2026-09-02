import type { WorldLearningScenario } from './worldLearningScenarioEngine';

export type ResidentConversationState={
 scenarioId:string;
 turn:number;
 residentId?:string;
 learnedPhrase:string;
 nextPrompt:string;
 hint?:string;
 canContinue:boolean;
 completed:boolean;
 targetLanguage:string;
 translation:string;
 vocabulary:{word:string;meaning:string;reading?:string}[];
 responseOptions:{text:string;meaning:string;correct:boolean}[];
};

export function begin(scenario:WorldLearningScenario,residentId?:string):ResidentConversationState{
 const next=scenario.continuation;
 return {scenarioId:scenario.id,turn:1,residentId,learnedPhrase:scenario.targetLanguage,nextPrompt:scenario.followUp??'Notice what the person says next and try to respond using language you already know.',hint:scenario.goal,canContinue:Boolean(next),completed:false,targetLanguage:scenario.targetLanguage,translation:scenario.translation,vocabulary:scenario.vocabulary,responseOptions:scenario.responseOptions};
}

export function continueConversation(state:ResidentConversationState,scenario:WorldLearningScenario):ResidentConversationState{
 if(!state.canContinue||state.completed||!scenario.continuation)return {...state,canContinue:false,completed:true};
 const next=scenario.continuation;
 return {...state,turn:state.turn+1,nextPrompt:next.prompt,hint:scenario.goal,learnedPhrase:next.targetLanguage,canContinue:false,completed:false,targetLanguage:next.targetLanguage,translation:next.translation,vocabulary:next.vocabulary,responseOptions:next.responseOptions};
}

export function reset(state:ResidentConversationState,scenario:WorldLearningScenario):ResidentConversationState{return begin(scenario,state.residentId);}

export const residentConversationContinuityEngine={begin,continue:continueConversation,reset};
