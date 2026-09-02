import type { LanguageWorldId } from '../world/languageWorldEngine';
import type { LearningSkill } from './contextualLanguageLearningEngine';
import { getWorldLearningScenarioById } from './worldLearningScenarioEngine';

export type WorldLearningOutcome={
  scenarioId:string;
  worldId:LanguageWorldId;
  placeId:string;
  success:boolean;
  skill:LearningSkill;
  language:string;
  goal:string;
  worldChange:string;
  memoryCandidate:{kind:'learning-moment';summary:string;importance:number};
  nextStep?:string;
};

export function resolveWorldLearningOutcome(scenarioId:string,success:boolean):WorldLearningOutcome|null{
  const scenario=getWorldLearningScenarioById(scenarioId);
  if(!scenario)return null;
  return {
    scenarioId:scenario.id,
    worldId:scenario.worldId,
    placeId:scenario.placeId,
    success,
    skill:scenario.skill,
    language:scenario.targetLanguage,
    goal:scenario.goal,
    worldChange:success?scenario.successWorldChange:'The moment remains unfinished. You can try again later without losing the place or the relationship.',
    memoryCandidate:{kind:'learning-moment',summary:success?`Used ${scenario.targetLanguage} successfully in ${scenario.locationType}.`:`Practised ${scenario.goal} in ${scenario.locationType}.`,importance:success?70:35},
    nextStep:scenario.followUp,
  };
}

export const worldLearningOutcomeEngine={resolve:resolveWorldLearningOutcome};
