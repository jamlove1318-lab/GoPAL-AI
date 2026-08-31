import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY='gopal:language-capability:v2';

type ScenarioRecord={attempts:number;successes:number;lastCompletedAt?:string};
type SkillRecord={attempts:number;successes:number;lastPractisedAt?:string};
type Stored={scenarios:Record<string,ScenarioRecord>;skills:Record<string,SkillRecord>;words:Record<string,number>;phrases:Record<string,number>};

const empty=():Stored=>({scenarios:{},skills:{},words:{},phrases:{}});
const read=async():Promise<Stored>=>{try{return JSON.parse((await AsyncStorage.getItem(KEY))??'null')??empty();}catch{return empty();}};
const write=(state:Stored)=>AsyncStorage.setItem(KEY,JSON.stringify(state));

export type CapabilityState='new'|'recognising'|'practising'|'independent';
export type ScenarioCapability={state:CapabilityState;attempts:number;successes:number;showTranslation:boolean;showVocabulary:boolean;needsHelp:boolean};
export type SkillCapability={state:CapabilityState;attempts:number;successes:number;lastPractisedAt?:string};

export function capabilityFrom(record?:ScenarioRecord):ScenarioCapability{
 const attempts=record?.attempts??0; const successes=record?.successes??0;
 const state:CapabilityState=successes>=3?'independent':successes>=1?'practising':attempts>0?'recognising':'new';
 return {state,attempts,successes,showTranslation:state==='new'||state==='recognising',showVocabulary:state!=='independent',needsHelp:state==='new'};
}

export function skillCapabilityFrom(record?:SkillRecord):SkillCapability{
 const attempts=record?.attempts??0; const successes=record?.successes??0;
 const state:CapabilityState=successes>=5?'independent':successes>=2?'practising':attempts>0?'recognising':'new';
 return {state,attempts,successes,lastPractisedAt:record?.lastPractisedAt};
}

export class LanguageCapabilityEngine{
 async scenario(id:string){const state=await read();return capabilityFrom(state.scenarios[id]);}
 async skill(skill:string){const state=await read();return skillCapabilityFrom(state.skills[skill]);}
 async allSkills(){const state=await read();return Object.fromEntries(Object.entries(state.skills).map(([id,record])=>[id,skillCapabilityFrom(record)]));}
 async recordAttempt(id:string,skill?:string){const state=await read();const current=state.scenarios[id]??{attempts:0,successes:0};current.attempts+=1;state.scenarios[id]=current;if(skill){const s=state.skills[skill]??{attempts:0,successes:0};s.attempts+=1;state.skills[skill]=s;}await write(state);return capabilityFrom(current);}
 async recordSuccess(input:{scenarioId:string;phrase:string;words:string[];skill?:string}){const state=await read();const current=state.scenarios[input.scenarioId]??{attempts:0,successes:0};current.successes+=1;current.lastCompletedAt=new Date().toISOString();state.scenarios[input.scenarioId]=current;if(input.skill){const s=state.skills[input.skill]??{attempts:0,successes:0};s.successes+=1;s.lastPractisedAt=current.lastCompletedAt;state.skills[input.skill]=s;}state.phrases[input.phrase]=(state.phrases[input.phrase]??0)+1;for(const word of input.words)state.words[word]=(state.words[word]??0)+1;await write(state);return capabilityFrom(current);}
 async phraseStrength(phrase:string){return (await read()).phrases[phrase]??0;}
 async reset(){await AsyncStorage.removeItem(KEY);}
}

export const languageCapabilityEngine=new LanguageCapabilityEngine();
