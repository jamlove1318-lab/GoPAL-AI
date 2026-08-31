import { contextualWorldEventEngine, type WorldEvent } from './contextualWorldEventEngine';
import { worldOpportunityEngine, type WorldOpportunity } from './worldOpportunityEngine';
import type { LivingEnvironment } from '../../features/world/components/LivingEnvironmentLayer';

export type WorldEventDirectorSnapshot = {
  ambient: WorldEvent | null;
  opportunities: WorldOpportunity[];
  generatedAt: string;
};

/**
 * Single orchestration point for things that can happen while a learner is
 * physically present in a destination. It deliberately does not own quests,
 * festivals, inventory, or rewards; those systems remain authoritative.
 */
export async function directWorldEvents(input: {
  environment: LivingEnvironment;
  simulation: Parameters<typeof contextualWorldEventEngine.choose>[0];
  continuityMinutes?: number;
}): Promise<WorldEventDirectorSnapshot> {
  const continuityMinutes = input.continuityMinutes ?? input.simulation.minutesInScene;
  const ambient = contextualWorldEventEngine.choose(input.simulation);
  const opportunities = await worldOpportunityEngine.load(input.environment, continuityMinutes);
  return { ambient, opportunities, generatedAt: new Date().toISOString() };
}

export const worldEventDirectorEngine = { direct: directWorldEvents };
