import type { LanguageWorldId } from './languageWorldEngine';
import { createLearningMoment, type LocationType } from './destinationExperienceEngine';
import { chooseDestinationResident } from './destinationResidentEngine';
import { destinationContinuityEngine } from './destinationContinuityEngine';
import { getWorldLearningScenario } from './worldLearningScenarioEngine';
import { residentRelationshipEngine } from './residentRelationshipEngine';
import { enrichResidentOpportunity } from './residentStoryOpportunityEngine';
import { WaveStore } from '../../lib/waveStore';
import { learningNeedEngine } from '../learning/learningNeedEngine';

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

function needDetail(need: Awaited<ReturnType<typeof learningNeedEngine.get>>): string | undefined {
  if (!need) return undefined;
  if (need.recommendedSupport === 'full') return 'A gentle first opportunity with the support you need.';
  if (need.recommendedSupport === 'guided') return 'You have seen this before. Try using it with a little less help.';
  if (need.recommendedSupport === 'light') return 'You are building confidence. Try it again in a different moment.';
  return 'You already handle this well. Look for a more natural challenge.';
}

export async function generateDestinationOpportunities(worldId: LanguageWorldId, placeId: string): Promise<DestinationOpportunity[]> {
  const life = await destinationContinuityEngine.enter(worldId, placeId);
  const moment = createLearningMoment(worldId, placeId);
  const scenario = getWorldLearningScenario(worldId, placeId);
  const resident = chooseDestinationResident(worldId, placeId);
  const kinds = phaseKinds[life.phase];
  const opportunities: DestinationOpportunity[] = [];
  const need = scenario ? await learningNeedEngine.get(worldId, placeId) : null;
  const worldEchoes = scenario ? await WaveStore.getWorldEchoes() : [];
  const matchingEchoes = scenario ? worldEchoes.filter((echo) => echo.unlockedConceptKey === scenario.id) : [];
  const hasEcho = matchingEchoes.length > 0;
  const unrevealedEcho = matchingEchoes.find((echo) => !echo.revealed);
  const needPriority = need?.priority ?? 0;

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
      priority: 90 + bonus + (hasEcho ? 5 : 0) + Math.round(needPriority * 0.15),
    };
    const story = await enrichResidentOpportunity(base);
    opportunities.push(story ?? base);
  }

  if (kinds.includes('learning') && scenario) {
    const stretch = need?.recommendedSupport === 'stretch';
    const title = hasEcho
      ? stretch ? 'Try this language in a new kind of moment' : 'Try the language again in a living moment'
      : stretch ? 'Stretch your language in a new situation' : moment.situation;
    const detail = hasEcho
      ? `This place carries an echo of something you learned before. ${unrevealedEcho ? 'There is still something to notice.' : needDetail(need) ?? 'See what feels easier this time.'}`
      : needDetail(need) ?? `Practice naturally through ${moment.area.name}.`;
    opportunities.push({
      id: `${placeId}:learning:${life.visits}`,
      worldId,
      placeId,
      kind: 'learning',
      title,
      detail,
      locationType: moment.locationType,
      scenarioId: scenario.id,
      priority: 80 + (hasEcho ? 12 : 0) + Math.round(needPriority * 0.2),
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
