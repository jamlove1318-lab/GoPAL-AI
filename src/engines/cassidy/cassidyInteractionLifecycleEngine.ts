import { memoryEngine } from '../memory/memoryEngine';
import { CharacterEngine } from '../character/characterEngine';
import { evolveCassidyPersonality } from './cassidyPersonalityEngine';

export type CassidyInteractionOutcome = 'neutral' | 'success' | 'failure' | 'discovery' | 'comfort' | 'celebration';

export interface CassidyInteractionInput {
  userId: string;
  characterId: string;
  interactionId: string;
  outcome: CassidyInteractionOutcome;
  summary: string;
  worldId?: string;
  destinationId?: string;
  activity?: string;
}

export interface CassidyInteractionResult {
  interactionId: string;
  memoryId: string;
  duplicate: boolean;
}

const processed = new Set<string>();
const characterEngine = new CharacterEngine();

function relationshipPatch(outcome: CassidyInteractionOutcome) {
  switch (outcome) {
    case 'success': return { familiarity: 1, trust: 1, friendship: 1 };
    case 'comfort': return { familiarity: 1, trust: 2, friendship: 1 };
    case 'celebration': return { familiarity: 1, friendship: 2 };
    case 'discovery': return { familiarity: 1, trust: 1 };
    case 'failure': return { familiarity: 1 };
    default: return { familiarity: 1 };
  }
}

function personalityInput(input: CassidyInteractionInput) {
  return {
    worldId: input.worldId,
    activity: input.activity,
    success: input.outcome === 'success' || input.outcome === 'celebration' || input.outcome === 'discovery',
    interaction: true,
    discovery: input.outcome === 'discovery',
    adventure: input.activity === 'adventure',
    eventId: input.interactionId,
  };
}

export async function processCassidyInteraction(input: CassidyInteractionInput): Promise<CassidyInteractionResult> {
  if (!input.userId || !input.characterId || !input.interactionId) throw new Error('Cassidy interaction identity is required');
  const summary = input.summary.trim();
  if (!summary) throw new Error('Cassidy interaction summary cannot be empty');

  if (processed.has(input.interactionId)) {
    const memories = await memoryEngine.list(input.userId, 'character');
    const existing = memories.find((memory) => memory.source_event_id === input.interactionId || memory.canonical_fact === summary);
    if (existing) return { interactionId: input.interactionId, memoryId: existing.id, duplicate: true };
  }

  const memory = await memoryEngine.record(input.userId, 'character', summary, input.interactionId);
  await characterEngine.recordRelationship(input.userId, input.characterId, relationshipPatch(input.outcome));
  await evolveCassidyPersonality(personalityInput(input));
  processed.add(input.interactionId);
  return { interactionId: input.interactionId, memoryId: memory.id, duplicate: false };
}

export const cassidyInteractionLifecycleEngine = { process: processCassidyInteraction };
