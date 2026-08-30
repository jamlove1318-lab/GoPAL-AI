import type { LanguageWorldId } from './languageWorldEngine';
import { createLearningMoment, type LocationType } from './destinationExperienceEngine';
import { chooseDestinationResident } from './destinationResidentEngine';
import { destinationContinuityEngine } from './destinationContinuityEngine';
import { getWorldLearningScenario } from './worldLearningScenarioEngine';
import { residentRelationshipEngine } from './residentRelationshipEngine';
import { enrichResidentOpportunity } from './residentStoryOpportunityEngine';

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

export async function generateDestinationOpportunities(worldId: LanguageWorldId, placeId: string): Promise<DestinationOpportunity[]> {
  const life = await destinationContinuityEngine.enter(worldId, placeId);
  const moment = createLearningMoment(worldId, placeId);
  const scenario = getWorldLearningScenario(worldId, placeId);
  const resident = chooseDestinationResident(worldId, placeId);
  const kinds = phaseKinds[life.phase];
  const opportunities: DestinationOpportunity[] = [];

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
      priority: 90 + bonus,
    };
    const story = await enrichResidentOpportunity(base);
    opportunities.push(story ?? base);
  }

  if (kinds.includes('learning')) {
    opportunities.push({ id: `${placeId}:learning:${life.visits}`, worldId, placeId, kind: 'learning', title: moment.situation, detail: `Practice naturally through ${moment.area.name}.`, locationType: moment.locationType, scenarioId: scenario?.id, priority: 80 });
  }

  if (kinds.includes('discovery')) {
    const seed = moment.area.discoverySeeds[life.seed % moment.area.discoverySeeds.length] ?? 'something unexpected';
    opportunities.push({ id: `${placeId}:discovery:${life.seed}`, worldId, placeId, kind: 'discovery', title: `Something worth noticing in ${moment.area.name}`, detail: `Explore beyond the obvious. Look for ${seed}.`, locationType: moment.locationType, priority: 70 });
  }

  if (kinds.includes('quiet')) {
    opportunities.push({ id: `${placeId}:quiet:${life.visits}`, worldId, placeId, kind: 'quiet', title: 'A quiet moment', detail: 'You do not need to turn every moment into a lesson. Take in the place.', locationType: 'neighborhood', priority: 40 });
  }

  return opportunities.sort((a, b) => b.priority - a.priority);
}

export const destinationOpportunityEngine = { generate: generateDestinationOpportunities };
