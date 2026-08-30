import { languageCapabilityEngine } from './languageCapabilityEngine';
import { worldLearningIntegrationEngine } from './worldLearningIntegrationEngine';
import { worldLearningRelationshipBridge } from '../world/worldLearningRelationshipBridge';
import type { LearningSkill } from './contextualLanguageLearningEngine';

export type WorldLearningFlowResult = {
  scenarioId: string;
  success: boolean;
  capability: Awaited<ReturnType<typeof languageCapabilityEngine.scenario>>;
  integration: Awaited<ReturnType<typeof worldLearningIntegrationEngine.integrate>>;
  relationship: Awaited<ReturnType<typeof worldLearningRelationshipBridge.apply>>;
};

export async function completeWorldLearningFlow(input: {
  userId: string;
  scenarioId: string;
  success: boolean;
  residentId?: string;
  skill?: LearningSkill;
}): Promise<WorldLearningFlowResult | null> {
  const { userId, scenarioId, success, residentId } = input;
  if (success) {
    await languageCapabilityEngine.recordAttempt(scenarioId);
    await languageCapabilityEngine.recordSuccess({ scenarioId, phrase: '', words: [] });
  } else {
    await languageCapabilityEngine.recordAttempt(scenarioId);
  }
  const capability = await languageCapabilityEngine.scenario(scenarioId);
  const integration = await worldLearningIntegrationEngine.integrate(userId, scenarioId, success);
  if (!integration) return null;
  const relationship = await worldLearningRelationshipBridge.apply(integration.outcome, residentId);
  return { scenarioId, success, capability, integration, relationship };
}

export const worldLearningFlowEngine = { complete: completeWorldLearningFlow };
