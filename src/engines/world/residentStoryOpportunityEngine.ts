import type { DestinationOpportunity } from './destinationOpportunityEngine';
import { residentRelationshipEngine } from './residentRelationshipEngine';

export type ResidentStoryOpportunity = DestinationOpportunity & {
  relationshipTone: 'new' | 'familiar' | 'warm' | 'trusted';
  storyBeat: 'meeting' | 'recognition' | 'shared-moment' | 'personal-invitation';
};

export async function enrichResidentOpportunity(opportunity: DestinationOpportunity): Promise<ResidentStoryOpportunity | null> {
  if (opportunity.kind !== 'resident' || !opportunity.residentId) return null;
  const relationship = await residentRelationshipEngine.get(opportunity.residentId);
  const storyBeat = relationship.tone === 'trusted'
    ? 'personal-invitation'
    : relationship.tone === 'warm'
      ? 'shared-moment'
      : relationship.tone === 'familiar'
        ? 'recognition'
        : 'meeting';
  const storyText = {
    meeting: opportunity.detail,
    recognition: `${opportunity.detail} There is a sense that you have met before.`,
    'shared-moment': `${opportunity.detail} Your earlier encounters give this moment a little more meaning.`,
    'personal-invitation': `${opportunity.detail} Your shared history opens the possibility of something more personal.`,
  }[storyBeat];
  return { ...opportunity, detail: storyText, relationshipTone: relationship.tone, storyBeat };
}

export const residentStoryOpportunityEngine = { enrich: enrichResidentOpportunity };
