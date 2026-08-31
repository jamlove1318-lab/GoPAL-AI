import type { LanguageWorldId } from './languageWorldEngine';
import { createLearningMoment, type LocationType } from './destinationExperienceEngine';
import { chooseDestinationResident } from './destinationResidentEngine';
import { destinationContinuityEngine } from './destinationContinuityEngine';
import { getWorldLearningScenario } from './worldLearningScenarioEngine';
import { residentRelationshipEngine } from './residentRelationshipEngine';
import { enrichResidentOpportunity } from './residentStoryOpportunityEngine';
import { WaveStore } from '../../lib/waveStore';
import { languageCapabilityEngine, type ScenarioCapability } from '../learning/languageCapabilityEngine';

export type DestinationOpportunity = {
  id: string;
  worldId: LanguageWorldId;
  placeId: string;
  kind: 'resident' | 'discovery' | 'learning' | 'quiet';
  title: string;
  detail: string;
  locationType: LocationType;
  residentId?: string;
  scenarioId?: string;
  priority: number;
  relationshipTone?: 'new' | 'familiar' | 'warm' | 'trusted';
  storyBeat?: 'meeting' | 'recognition' | 'shared-moment' | 'personal-invitation';
};

const phaseKinds = {
  'first-visit': ['discovery', 'resident', 'learning'],
  recent: ['resident', 'learning', 'quiet'],
  returning: ['resident', 'discovery', 'learning'],
  'long-away': ['discovery', 'resident', 'quiet'],
} as const;

function relationshipBonus(tone: string): number {
  if (tone === 'trusted') return 35;
  if (tone === 'warm') return 22;
  if (tone === 'familiar') return 10;
  return 0;
}

function capabilityBonus(capability?: ScenarioCapability): number {
  if (!capability) return 0;
  if (capability.state === 'new') return 12;
  if (capability.state === 'recognising') return 10;
  if (capability.state === 'practising') return 6;
  return -18;
}

function capabilityDetail(capability?: ScenarioCapability): string | undefined {
  if (!capability) return undefined;
  if (capability.state === 'new') return 'A gentle first opportunity to use this language in context.';
  if (capability.state === 'recognising') return 'You have seen this before. Try using it with a little less help.';
  if (capability.state === 'practising') return 'You are getting more comfortable. Try it again in a different moment.';
  return 'You already handle this well. Look for a more natural challenge instead.';
}

export async function generateDestinationOpportunities(worldId: LanguageWorldId, placeId: string): Promise<DestinationOpportunity[]> {
  const life = await destinationContinuityEngine.enter(worldId, placeId);
  const moment = createLearningMoment(worldId, placeId);
  const scenario = getWorldLearningScenario(worldId, placeId);
  const resident = chooseDestinationResident(worldId, placeId);
  const kinds = phaseKinds[life.phase];
  const opportunities: DestinationOpportunity[] = [];
  const capability = scenario ? await languageCapabilityEngine.scenario(scenario.id) : undefined;
  const worldEchoes = scenario ? await WaveStore.getWorldEchoes() : [];
  const matchingEchoes = scenario ? worldEchoes.filter((echo) => echo.unlockedConceptKey === scenario.id) : [];
  const hasEcho = matchingEchoes.length > 0;
  const unrevealedEcho = matchingEchoes.find((echo) => !echo.revealed);
  const learningBonus = capabilityBonus(capability);

  if (resident && kinds.includes('resident')) {
    const relationship = await residentRelationshipEngine.get(resident.id);
    const bonus = relationshipBonus(relationship.tone);
    const base: DestinationOpportunity = {
      id: `${placeId}:resident:${resident.id}:${life.visits}`,
      worldId,
      placeId,
      kind: 'resident',
      title: relationship.tone === 'trusted' ? `${resident.name} has something to share with you` : `${resident.name} is nearby`,
      detail: relationship.tone === 'trusted' ? 'Your shared history opens a more personal possibility.' : resident.conversationHook,
      locationType: moment.locationType,
      residentId: resident.id,
      scenarioId: scenario?.id,
      priority: 90 + bonus + (hasEcho ? 5 : 0) + learningBonus,
    };
    const story = await enrichResidentOpportunity(base);
    opportunities.push(story ?? base);
  }

  if (kinds.includes('learning') && scenario) {
    const independent = capability?.state === 'independent';
    const title = hasEcho
      ? independent
        ? 'Try this language in a new kind of moment'
        : 'Try the language again in a living moment'
      : independent
        ? 'Stretch your language in a new situation'
        : moment.situation;
    const detail = hasEcho
      ? `This place carries an echo of something you learned before. ${unrevealedEcho ? 'There is still something to notice.' : capabilityDetail(capability) ?? 'See what feels easier this time.'}`
      : capabilityDetail(capability) ?? `Practice naturally through ${moment.area.name}.`;
    opportunities.push({
      id: `${placeId}:learning:${life.visits}`,
      worldId,
      placeId,
      kind: 'learning',
      title,
      detail,
      locationType: moment.locationType,
      scenarioId: scenario.id,
      priority: 80 + (hasEcho ? 12 : 0) + learningBonus,
    });
  }

  if (kinds.includes('discovery')) {
    const seed = moment.area.discoverySeeds[life.seed % moment.area.discoverySeeds.length] ?? 'something unexpected';
    opportunities.push({
      id: `${placeId}:discovery:${life.seed}`,
      worldId,
      placeId,
      kind: 'discovery',
      title: hasEcho ? 'A familiar place has another layer' : `Something worth noticing in ${moment.area.name}`,
      detail: hasEcho ? `Your earlier learning left an echo here. Look for a new connection to ${moment.area.name}.` : `Explore beyond the obvious. Look for ${seed}.`,
      locationType: moment.locationType,
      priority: 70 + (hasEcho ? 8 : 0),
      scenarioId: scenario?.id,
    });
  }

  if (kinds.includes('quiet')) {
    opportunities.push({ id: `${placeId}:quiet:${life.visits}`, worldId, placeId, kind: 'quiet', title: 'A quiet moment', detail: 'You do not need to turn every moment into a lesson. Take in the place.', locationType: 'neighborhood', priority: 40 });
  }

  return opportunities.sort((a, b) => b.priority - a.priority);
}

export const destinationOpportunityEngine = { generate: generateDestinationOpportunities };
