import { languageCapabilityEngine, type CapabilityState } from './languageCapabilityEngine';
import { getWorldLearningScenarios } from './worldLearningScenarioEngine';
import type { LanguageWorldId } from '../world/languageWorldEngine';
import type { LearningSkill } from './contextualLanguageLearningEngine';

export type LearningNeed = {
  scenarioId: string;
  skill: LearningSkill;
  state: CapabilityState;
  skillState: CapabilityState;
  priority: number;
  reason: CapabilityState;
  recommendedSupport: 'full'|'guided'|'light'|'stretch';
};

const priorityFor=(state:CapabilityState)=>state==='new'?100:state==='recognising'?85:state==='practising'?65:20;
const supportFor=(state:CapabilityState):LearningNeed['recommendedSupport']=>state==='new'?'full':state==='recognising'?'guided':state==='practising'?'light':'stretch';

export async function getLearningNeeds(worldId:LanguageWorldId,placeId:string,skill?:LearningSkill,excludeScenarioIds:string[]=[]):Promise<LearningNeed[]>{
 const scenarios=getWorldLearningScenarios(worldId,placeId).filter(s=>(!skill||s.skill===skill)&&!excludeScenarioIds.includes(s.id));
 const needs=await Promise.all(scenarios.map(async scenario=>{
  const capability=await languageCapabilityEngine.scenario(scenario.id);
  const skillCapability=await languageCapabilityEngine.skill(scenario.skill);
  const priority=Math.round(priorityFor(capability.state)*0.65+priorityFor(skillCapability.state)*0.35);
  return {scenarioId:scenario.id,skill:scenario.skill,state:capability.state,skillState:skillCapability.state,priority,reason:capability.state,recommendedSupport:supportFor(capability.state)};
 }));
 return needs.sort((a,b)=>b.priority-a.priority);
}

export async function getLearningNeed(worldId:LanguageWorldId,placeId:string,skill?:LearningSkill,excludeScenarioIds:string[]):Promise<LearningNeed|null>{
 return (await getLearningNeeds(worldId,placeId,skill,excludeScenarioIds)).at(0)??null;
}

export const learningNeedEngine={get:getLearningNeed,getAll:getLearningNeeds};
