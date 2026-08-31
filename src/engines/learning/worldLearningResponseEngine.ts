import type { ResidentConversationState } from './residentConversationContinuityEngine';

export type WorldLearningResponseConfidence='correct'|'close'|'unknown';
export type WorldLearningResponseResult={
 accepted:boolean;
 matchedOption:number|null;
 normalized:string;
 reason:'matched'|'empty'|'unrecognised';
 confidence:WorldLearningResponseConfidence;
 feedback:string;
};

const normalize=(value:string)=>value.trim().normalize('NFKC').replace(/[。！？!?.,，、]+$/u,'').replace(/\s+/g,' ');
const compact=(value:string)=>normalize(value).replace(/[\s\-_'’]/gu,'').toLocaleLowerCase();
function distance(a:string,b:string){const previous=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let diagonal=previous[0];previous[0]=i;for(let j=1;j<=b.length;j++){const above=previous[j];previous[j]=a[i-1]===b[j-1]?diagonal:Math.min(previous[j]+1,previous[j-1]+1,diagonal+1);diagonal=above;}}return previous[b.length];}
function closeEnough(input:string,target:string){const a=compact(input);const b=compact(target);if(!a||!b)return false;if(a===b)return true;const max=Math.max(a.length,b.length);if(max<4)return distance(a,b)<=1;return distance(a,b)<=Math.max(1,Math.floor(max*0.2));}
export function evaluate(state:ResidentConversationState,response:string):WorldLearningResponseResult{const normalized=normalize(response);if(!normalized)return{accepted:false,matchedOption:null,normalized,reason:'empty',confidence:'unknown',feedback:'Say something first.'};const exact=state.responseOptions.findIndex(option=>normalize(option.text)===normalized&&option.correct);if(exact>=0)return{accepted:true,matchedOption:exact,normalized,reason:'matched',confidence:'correct',feedback:'That fits the situation.'};const close=state.responseOptions.findIndex(option=>option.correct&&closeEnough(normalized,option.text));if(close>=0)return{accepted:false,matchedOption:close,normalized,reason:'unrecognised',confidence:'close',feedback:'You are very close. Check the wording and try again.'};return{accepted:false,matchedOption:null,normalized,reason:'unrecognised',confidence:'unknown',feedback:'That does not match the target response for this moment yet.'};}
export function evaluateWordBank(state:ResidentConversationState,words:string[]):WorldLearningResponseResult{return evaluate(state,words.join(' '));}
export const worldLearningResponseEngine={evaluate,evaluateWordBank};
