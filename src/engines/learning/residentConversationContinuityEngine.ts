import type { WorldLearningScenario } from './worldLearningScenarioEngine';

export type ResidentConversationState={
 scenarioId:string;
 turn:number;
 residentId?:string;
 learnedPhrase:string;
 nextPrompt:string;
 canContinue:boolean;
 completed:boolean;
};

export function begin(scenario:WorldLearningScenario,residentId?:string):ResidentConversationState{
 return {scenarioId:scenario.id,turn:1,residentId,learnedPhrase:scenario.targetLanguage,nextPrompt:scenario.followUp??'Notice what the person says next and try to respond using language you already know.',canContinue:Boolean(scenario.followUp),completed:false};
}

export function continueConversation(state:ResidentConversationState,scenario:WorldLearningScenario):ResidentConversationState{
 if(!state.canContinue||state.completed)return state;
 return {...state,turn:state.turn+1,nextPrompt:'Use what you just learned in the next part of this real-world situation.',canContinue:false,completed:true};
}

export function reset(state:ResidentConversationState,scenario:WorldLearningScenario):ResidentConversationState{return begin(scenario,state.residentId);}

export const residentConversationContinuityEngine={begin,continue:continueConversation,reset};
