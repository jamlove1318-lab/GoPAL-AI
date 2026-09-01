import { memoryEngine } from '../memory/memoryEngine';
import { CharacterEngine } from '../character/characterEngine';
import { evolveCassidyPersonality } from './cassidyPersonalityEngine';
import { LocalStore } from '../../lib/localStore';

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

type ProcessedState = { ids: string[] };
const PROCESSED_KEY = 'cassidy_processed_interactions_v1';
const processed = new Set<string>();
const inFlight = new Map<string, Promise<CassidyInteractionResult>>();
const characterEngine = new CharacterEngine();

function relationshipDelta(outcome: CassidyInteractionOutcome) {
  switch (outcome) {
    case 'success': return { familiarity: 1, trust: 1, friendship: 1 };
    case 'comfort': return { familiarity: 1, trust: 2, friendship: 1 };
    case 'celebration': return { familiarity: 1, friendship: 2 };
    case 'discovery': return { familiarity: 1, trust: 1 };
    case 'failure': return { familiarity: 1 };
    default: return { familiarity: 1 };
  }
}

async function loadProcessed(): Promise<Set<string>> {
  const state = await LocalStore.get<ProcessedState>(PROCESSED_KEY, { ids: [] });
  for (const id of state.ids.filter((value): value is string => typeof value === 'string')) processed.add(id);
  return processed;
}

async function markProcessed(id: string): Promise<void> {
  processed.add(id);
  await LocalStore.set(PROCESSED_KEY, { ids: Array.from(processed).slice(-500) });
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

async function processOnce(input: CassidyInteractionInput, summary: string): Promise<CassidyInteractionResult> {
  await loadProcessed();
  if (processed.has(input.interactionId)) {
    const memories = await memoryEngine.list(input.userId, 'character');
    const existing = memories.find((memory) => memory.source_event_id === input.interactionId);
    if (existing) return { interactionId: input.interactionId, memoryId: existing.id, duplicate: true };
    processed.delete(input.interactionId);
  }

  const memory = await memoryEngine.record(input.userId, 'character', summary, input.interactionId);
  const existingRelationship = await characterEngine.loadCassidy(input.userId, input.characterId);
  const current = existingRelationship.relationship;
  const delta = relationshipDelta(input.outcome);
  await characterEngine.recordRelationship(input.userId, input.characterId, {
    familiarity: (current?.familiarity ?? 0) + delta.familiarity,
    trust: (current?.trust ?? 0) + (delta.trust ?? 0),
    friendship: (current?.friendship ?? 0) + (delta.friendship ?? 0),
  });
  await evolveCassidyPersonality(personalityInput(input));
  await markProcessed(input.interactionId);
  return { interactionId: input.interactionId, memoryId: memory.id, duplicate: false };
}

export async function processCassidyInteraction(input: CassidyInteractionInput): Promise<CassidyInteractionResult> {
  if (!input.userId || !input.characterId || !input.interactionId) throw new Error('Cassidy interaction identity is required');
  const summary = input.summary.trim();
  if (!summary) throw new Error('Cassidy interaction summary cannot be empty');

  const existing = inFlight.get(input.interactionId);
  if (existing) {
    const result = await existing;
    return { ...result, duplicate: true };
  }

  const work = processOnce(input, summary);
  inFlight.set(input.interactionId, work);
  try {
    return await work;
  } finally {
    inFlight.delete(input.interactionId);
  }
}

export const cassidyInteractionLifecycleEngine = { process: processCassidyInteraction };
