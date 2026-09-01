import type { CassidyMood } from '../../characters/cassidy';
import type { LanguageWorldId } from '../world/languageWorldEngine';

/**
 * Cassidy's off-lesson life: moments where she exists in the universe without
 * turning the learner's visit into a task. This is intentionally content-only;
 * scene rendering and persistence remain owned by their existing systems.
 */
export type CassidyLifeActivity =
  | 'wandering'
  | 'cafe'
  | 'reading'
  | 'watching-rain'
  | 'stargazing'
  | 'dreaming'
  | 'storytelling'
  | 'adventure'
  | 'helping'
  | 'resting';

export type CassidyLifeMoment = {
  activity: CassidyLifeActivity;
  mood: CassidyMood;
  worldId: LanguageWorldId | 'emerald-valley';
  destinationId?: string;
  visibleToLearner: boolean;
  invitation: boolean;
  reason: string;
};

export type CassidyLifeInput = {
  worldId: LanguageWorldId | 'emerald-valley';
  destinationId?: string;
  hour: number;
  weather?: 'clear' | 'rain' | 'wind' | 'cloudy';
  learnerExploring: boolean;
  learnerNeedsHelp: boolean;
  minutesSinceInteraction: number;
  recentSuccess: boolean;
};

const pick = <T,>(items: readonly T[], seed: number): T => items[Math.abs(Math.floor(seed)) % items.length]!;

export function decideCassidyLife(input: CassidyLifeInput, seed = Date.now()): CassidyLifeMoment {
  if (input.learnerNeedsHelp) return {activity:'helping',mood:'thinking',worldId:input.worldId,destinationId:input.destinationId,visibleToLearner:true,invitation:false,reason:'Cassidy noticed the learner needs support.'};
  if (input.recentSuccess) return {activity:'storytelling',mood:'excited',worldId:input.worldId,destinationId:input.destinationId,visibleToLearner:true,invitation:true,reason:'Cassidy wants to celebrate and share the moment.'};
  if (input.weather==='rain') return {activity:'watching-rain',mood:'calm',worldId:input.worldId,destinationId:input.destinationId,visibleToLearner:true,invitation:false,reason:'Rain gives Cassidy a quiet moment to enjoy the world.'};
  if (input.hour>=22||input.hour<6) return {activity:pick(['stargazing','dreaming','resting'],seed),mood:'calm',worldId:input.worldId,destinationId:input.destinationId,visibleToLearner:true,invitation:input.learnerExploring,reason:'It is late; Cassidy follows her own quieter rhythm.'};
  if (!input.learnerExploring && input.minutesSinceInteraction<10) return {activity:'resting',mood:'warm',worldId:input.worldId,destinationId:input.destinationId,visibleToLearner:true,invitation:false,reason:'Cassidy gives the learner space instead of creating another task.'};
  const activity=pick(['wandering','cafe','reading','storytelling','adventure'],seed+input.hour+input.minutesSinceInteraction);
  return {activity,mood:activity==='adventure'?'excited':activity==='storytelling'?'warm':'calm',worldId:input.worldId,destinationId:input.destinationId,visibleToLearner:true,invitation:activity==='adventure'||activity==='storytelling',reason:'Cassidy has her own life in the current world and may invite the learner in.'};
}

export const cassidyLifeEngine={decide:decideCassidyLife};
