import { languageCapabilityEngine } from './languageCapabilityEngine';
import { worldLearningIntegrationEngine } from './worldLearningIntegrationEngine';
import { worldLearningRelationshipBridge } from '../world/worldLearningRelationshipBridge';
import { getWorldLearningScenarioById } from './worldLearningScenarioEngine';
import { cassidyLearningReactionEngine, type CassidyLearningReaction } from '../cassidy/cassidyLearningReactionEngine';
import { worldLearningConsequenceEngine, type WorldLearningConsequence } from '../world/worldLearningConsequenceEngine';
import { worldDiscoveryProgressionEngine } from '../world/worldDiscoveryProgressionEngine';

export type WorldLearningFlowResult = {
  scenarioId: string;
  success: boolean;
  capability: Awaited<ReturnType<typeof languageCapabilityEngine.scenario>>;
  integration: Awaited<ReturnType<typeof worldLearningIntegrationEngine.integrate>>;
  relationship: Awaited<ReturnType<typeof worldLearningRelationshipBridge.apply>>;
  cassidy: CassidyLearningReaction;
  world: WorldLearningConsequence;
  discovery: Awaited<ReturnType<typeof worldDiscoveryProgressionEngine.complete>> | null;
};

export async function completeWorldLearningTurn(input: {
  scenarioId: string;
  targetLanguage: string;
  vocabulary: string[];
  success: boolean;
  skill?: string;
}) {
  await languageCapabilityEngine.recordAttempt(input.scenarioId, input.skill);
  if (input.success) {
    await languageCapabilityEngine.recordSuccess({
      scenarioId: input.scenarioId,
      phrase: input.targetLanguage,
      words: input.vocabulary,
      skill: input.skill,
    });
  }
  return languageCapabilityEngine.scenario(input.scenarioId);
}

export async function completeWorldLearningFlow(input: {
  userId: string;
  scenarioId: string;
  success: boolean;
  residentId?: string;
}): Promise<WorldLearningFlowResult | null> {
  const { userId, scenarioId, success, residentId } = input;
  const scenario = getWorldLearningScenarioById(scenarioId);
  if (!scenario) return null;

  const capability = await completeWorldLearningTurn({
    scenarioId,
    targetLanguage: scenario.targetLanguage,
    vocabulary: scenario.vocabulary.map((item) => item.word),
    success,
    skill: scenario.skill,
  });
  const integration = await worldLearningIntegrationEngine.integrate(userId, scenarioId, success);
  if (!integration) return null;
  const relationship = await worldLearningRelationshipBridge.apply(integration.outcome, residentId);
  const world = await worldLearningConsequenceEngine.apply(integration.outcome);
  const cassidy = cassidyLearningReactionEngine.react(integration.outcome, relationship?.relationship ? {
    residentId: relationship.residentId,
    familiarity: relationship.relationship.familiarity,
    trust: relationship.relationship.trust,
    worldEchoId: world.worldEchoId,
  } : { worldEchoId: world.worldEchoId });
  const discovery = success
    ? await worldDiscoveryProgressionEngine.complete(scenario.worldId, scenario.placeId, scenarioId)
    : null;

  return { scenarioId, success, capability, integration, relationship, cassidy, world, discovery };
}

export const worldLearningFlowEngine = { complete: completeWorldLearningFlow, completeTurn: completeWorldLearningTurn };