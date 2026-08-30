import { languageCapabilityEngine } from './languageCapabilityEngine';
import { worldLearningIntegrationEngine } from './worldLearningIntegrationEngine';
import { worldLearningRelationshipBridge } from '../world/worldLearningRelationshipBridge';
import { getWorldLearningScenarioById } from './worldLearningScenarioEngine';
import { cassidyLearningReactionEngine, type CassidyLearningReaction } from '../cassidy/cassidyLearningReactionEngine';
import { worldLearningConsequenceEngine, type WorldLearningConsequence } from '../world/worldLearningConsequenceEngine';

export type WorldLearningFlowResult = {
  scenarioId: string;
  success: boolean;
  capability: Awaited<ReturnType<typeof languageCapabilityEngine.scenario>>;
  integration: Awaited<ReturnType<typeof worldLearningIntegrationEngine.integrate>>;
  relationship: Awaited<ReturnType<typeof worldLearningRelationshipBridge.apply>>;
  cassidy: CassidyLearningReaction;
  world: WorldLearningConsequence;
};

export async function completeWorldLearningFlow(input: {
  userId: string;
  scenarioId: string;
  success: boolean;
  residentId?: string;
}): Promise<WorldLearningFlowResult | null> {
  const { userId, scenarioId, success, residentId } = input;
  const scenario = getWorldLearningScenarioById(scenarioId);
  if (!scenario) return null;

  await languageCapabilityEngine.recordAttempt(scenarioId);
  if (success) {
    await languageCapabilityEngine.recordSuccess({
      scenarioId,
      phrase: scenario.targetLanguage,
      words: scenario.vocabulary.map((item) => item.word),
    });
  }

  const capability = await languageCapabilityEngine.scenario(scenarioId);
  const integration = await worldLearningIntegrationEngine.integrate(userId, scenarioId, success);
  if (!integration) return null;
  const relationship = await worldLearningRelationshipBridge.apply(integration.outcome, residentId);
  const cassidy = cassidyLearningReactionEngine.react(integration.outcome);
  const world = await worldLearningConsequenceEngine.apply(integration.outcome);
  return { scenarioId, success, capability, integration, relationship, cassidy, world };
}

export const worldLearningFlowEngine = { complete: completeWorldLearningFlow };