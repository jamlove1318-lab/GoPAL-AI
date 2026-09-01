import { processCassidyInteraction, type CassidyInteractionOutcome } from './cassidyInteractionLifecycleEngine';
import { isMeaningfulCassidyExperience, type CassidyMeaningfulExperience } from './cassidyMeaningfulExperienceEngine';

export interface CassidyExperienceEvent {
  userId: string;
  experienceId: string;
  activity: CassidyMeaningfulExperience;
  summary: string;
  worldId?: string;
  destinationId?: string;
  characterId?: string;
  outcome?: CassidyInteractionOutcome;
}

export interface CassidyExperienceResult {
  recorded: boolean;
  interactionId: string;
  memoryId?: string;
}

export async function recordCassidyExperience(event: CassidyExperienceEvent): Promise<CassidyExperienceResult> {
  if (!event.userId || !event.experienceId) throw new Error('Cassidy experience identity is required');
  if (!isMeaningfulCassidyExperience(event.activity)) {
    return { recorded: false, interactionId: event.experienceId };
  }
  const result = await processCassidyInteraction({
    userId: event.userId,
    characterId: event.characterId ?? 'char-cassidy-01',
    interactionId: `cassidy-experience:${event.experienceId}`,
    outcome: event.outcome ?? 'discovery',
    summary: event.summary,
    worldId: event.worldId,
    destinationId: event.destinationId,
    activity: event.activity,
  });
  return { recorded: !result.duplicate, interactionId: result.interactionId, memoryId: result.memoryId };
}

export const cassidyExperienceCoordinator = { record: recordCassidyExperience };
