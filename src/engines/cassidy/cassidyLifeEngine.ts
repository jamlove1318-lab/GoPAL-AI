import type { CassidyMood } from '../../characters/cassidy';
import type { LanguageWorldId } from '../world/languageWorldEngine';

export type CassidyLifeActivity =
  | 'wandering' | 'cafe' | 'reading' | 'watching-rain' | 'stargazing'
  | 'dreaming' | 'storytelling' | 'adventure' | 'helping' | 'resting'
  | 'discovering' | 'celebrating';
export type CassidyLifeMoment = { activity:CassidyLifeActivity; mood:CassidyMood; worldId:LanguageWorldId|'emerald-valley'; destinationId?:string; visibleToLearner:boolean; invitation:boolean; reason:string; };
export type CassidyLifeInput = { worldId:LanguageWorldId|'emerald-valley'; destinationId?:string; hour:number; weather?:'clear'|'rain'|'wind'|'cloudy'; learnerExploring:boolean; learnerNeedsHelp:boolean; minutesSinceInteraction:number; recentSuccess:boolean; personality?:{curiosity:number;playfulness:number;adventurousness:number;warmth:number}; };
const pick=<T,>(items:readonly T[],seed:number):T=>items[Math.abs(Math.floor(seed))%items.length]!;
export function decideCassidyLife(input:CassidyLifeInput,seed=Date.now()):CassidyLifeMoment{
 const base={worldId:input.worldId,destinationId:input.destinationId,visibleToLearner:true};
 if(input.learnerNeedsHelp)return{...base,activity:'helping',mood:'thinking',invitation:false,reason:'Cassidy noticed the learner needs support.'};
 if(input.recentSuccess)return{...base,activity:'celebrating',mood:'excited',invitation:true,reason:'Cassidy is enjoying the shared success.'};
 if(input.weather==='rain')return{...base,activity:'watching-rain',mood:'calm',invitation:false,reason:'Rain gives Cassidy a quiet moment to enjoy the world.'};
 if(input.hour>=22||input.hour<6){const activity=pick(['stargazing','dreaming','resting'] as const,seed);return{...base,activity,mood:'calm',invitation:input.learnerExploring,reason:'It is late; Cassidy follows her own quieter rhythm.'};}
 if(!input.learnerExploring&&input.minutesSinceInteraction<10)return{...base,activity:'resting',mood:'warm',invitation:false,reason:'Cassidy gives the learner space instead of creating another task.'};
 const p=input.personality;const adventurous=p?.adventurousness??50;const curious=p?.curiosity??50;const playful=p?.playfulness??55;
 const pool: CassidyLifeActivity[] = adventurous>75?['adventure','discovering','wandering','cafe','storytelling']:curious>75?['discovering','reading','wandering','storytelling','cafe']:playful>75?['storytelling','cafe','wandering','adventure','discovering']:['wandering','cafe','reading','storytelling','adventure','discovering'];
 const activity=pick(pool,seed+input.hour+input.minutesSinceInteraction);
 return{...base,activity,mood:activity==='adventure'?'excited':activity==='storytelling'?'warm':'calm',invitation:activity==='adventure'||activity==='storytelling'||activity==='discovering',reason:'Cassidy has her own life in the current world and may invite the learner in.'};
}
export const cassidyLifeEngine={decide:decideCassidyLife};
