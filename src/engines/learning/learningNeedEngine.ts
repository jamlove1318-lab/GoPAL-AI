import { languageCapabilityEngine, type CapabilityState } from './languageCapabilityEngine';
import { getWorldLearningScenario } from './worldLearningScenarioEngine';

export type LearningNeed = {
  scenarioId: string;
  state: CapabilityState;
  priority: number;
  reason: 'new' | 'recognising' | 'practising' | 'independent';
  recommendedSupport: 'full' | 'guided' | 'light' | 'stretch';
};

const priorityFor = (state: CapabilityState) => {
  if (state === 'new') return 100;
  if (state === 'recognising') return 85;
  if (state === 'practising') return 65;
  return 20;
};

const supportFor = (state: CapabilityState): LearningNeed['recommendedSupport'] => {
  if (state === 'new') return 'full';
  if (state === 'recognising') return 'guided';
  if (state === 'practising') return 'light';
  return 'stretch';
};

export async function getLearningNeed(worldId: Parameters<typeof getWorldLearningScenario>[0], placeId: string): Promise<LearningNeed | null> {
  const scenario = getWorldLearningScenario(worldId, placeId);
  if (!scenario) return null;
  const capability = await languageCapabilityEngine.scenario(scenario.id);
  return {
    scenarioId: scenario.id,
    state: capability.state,
    priority: priorityFor(capability.state),
    reason: capability.state,
    recommendedSupport: supportFor(capability.state),
  };
}

export const learningNeedEngine = { get: getLearningNeed };
