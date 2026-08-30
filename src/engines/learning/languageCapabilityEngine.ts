import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY='gopal:language-capability:v1';

type ScenarioRecord={attempts:number;successes:number;lastCompletedAt?:string};
type Stored={scenarios:Record<string,ScenarioRecord>;words:Record<string,number>;phrases:Record<string,number>};

const empty=():Stored=>({scenarios:{},words:{},phrases:{}});
const read=async():Promise<Stored>=>{try{return JSON.parse((await AsyncStorage.getItem(KEY))??'null')??empty();}catch{return empty();}};
const write=(state:Stored)=>AsyncStorage.setItem(KEY,JSON.stringify(state));

export type CapabilityState='new'|'recognising'|'practising'|'independent';
export type ScenarioCapability={state:CapabilityState;attempts:number;successes:number;showTranslation:boolean;showVocabulary:boolean;needsHelp:boolean};

export function capabilityFrom(record?:ScenarioRecord):ScenarioCapability{
 const attempts=record?.attempts??0; const successes=record?.successes??0;
 const state:CapabilityState=successes>=3?'independent':successes>=1?'practising':attempts>0?'recognising':'new';
 return {state,attempts,successes,showTranslation:state==='new'||state==='recognising',showVocabulary:state!=='independent',needsHelp:state==='new'};
}

export class LanguageCapabilityEngine{
 async scenario(id:string){const state=await read();return capabilityFrom(state.scenarios[id]);}
 async recordAttempt(id:string){const state=await read();const current=state.scenarios[id]??{attempts:0,successes:0};current.attempts+=1;state.scenarios[id]=current;await write(state);return capabilityFrom(current);}
 async recordSuccess(input:{scenarioId:string;phrase:string;words:string[]}){const state=await read();const current=state.scenarios[input.scenarioId]??{attempts:0,successes:0};current.successes+=1;current.lastCompletedAt=new Date().toISOString();state.scenarios[input.scenarioId]=current;state.phrases[input.phrase]=(state.phrases[input.phrase]??0)+1;for(const word of input.words)state.words[word]=(state.words[word]??0)+1;await write(state);return capabilityFrom(current);}
 async phraseStrength(phrase:string){return (await read()).phrases[phrase]??0;}
 async reset(){await AsyncStorage.removeItem(KEY);}
}

export const languageCapabilityEngine=new LanguageCapabilityEngine();
