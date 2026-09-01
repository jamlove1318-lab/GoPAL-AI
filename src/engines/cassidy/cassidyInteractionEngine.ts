import { processCassidyInteraction } from './cassidyInteractionLifecycleEngine';

export type CassidyInteractionKind = 'greeting' | 'conversation' | 'story' | 'dream' | 'adventure' | 'help' | 'discovery';

export async function recordCassidyInteraction(input: {
  userId: string;
  characterId?: string;
  kind: CassidyInteractionKind;
  worldId: string;
  destinationId?: string;
  anchorId?: string;
  successful?: boolean;
  eventId: string;
  summary: string;
}) {
  return processCassidyInteraction({
    userId: input.userId,
    characterId: input.characterId ?? 'cassidy',
    interactionId: input.eventId,
    outcome: input.kind === 'discovery' ? 'discovery' : input.kind === 'help' ? 'comfort' : input.successful === false ? 'failure' : input.successful ? 'success' : 'neutral',
    summary: input.summary,
    worldId: input.worldId,
    destinationId: input.destinationId,
    activity: input.kind,
  });
}

export const cassidyInteractionEngine = { record: recordCassidyInteraction };
