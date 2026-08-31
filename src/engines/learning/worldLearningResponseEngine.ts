import type { ResidentConversationState } from './residentConversationContinuityEngine';

export type WorldLearningResponseResult={
 accepted:boolean;
 matchedOption:number|null;
 normalized:string;
 reason:'matched'|'empty'|'unrecognised';
};

const normalize=(value:string)=>value.trim().normalize('NFKC').replace(/[。！？!?.,，、]+$/u,'').replace(/\s+/g,' ');

export function evaluate(state:ResidentConversationState,response:string):WorldLearningResponseResult{
 const normalized=normalize(response);
 if(!normalized)return {accepted:false,matchedOption:null,normalized,reason:'empty'};
 const matched=state.responseOptions.findIndex(option=>normalize(option.text)===normalized&&option.correct);
 if(matched>=0)return {accepted:true,matchedOption:matched,normalized,reason:'matched'};
 return {accepted:false,matchedOption:null,normalized,reason:'unrecognised'};
}

export const worldLearningResponseEngine={evaluate};
