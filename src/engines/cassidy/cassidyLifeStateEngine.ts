import { LocalStore } from '../../lib/localStore';
import type { CassidyMood } from '../../characters/cassidy';
import type { CassidyLifeActivity } from './cassidyLifeEngine';

const KEY = 'cassidy:life-state:v1';

export type CassidyLifeState = {
  activity: CassidyLifeActivity;
  mood: CassidyMood;
  worldId: string;
  destinationId?: string;
  anchorId?: string;
  startedAt: string;
  updatedAt: string;
  visits: number;
  lastInvitationAt?: string;
};

const DEFAULT_STATE: CassidyLifeState = {
  activity: 'resting', mood: 'warm', worldId: 'emerald-valley',
  startedAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), visits: 0,
};

export async function getCassidyLifeState(): Promise<CassidyLifeState> {
  return LocalStore.get<CassidyLifeState>(KEY, DEFAULT_STATE);
}

export async function saveCassidyLifeState(input: Omit<CassidyLifeState, 'updatedAt'> & { updatedAt?: string }): Promise<CassidyLifeState> {
  const state: CassidyLifeState = {...input, updatedAt: input.updatedAt ?? new Date().toISOString()};
  await LocalStore.set(KEY, state);
  return state;
}

export async function beginCassidyLifeMoment(input: {
  activity: CassidyLifeActivity; mood: CassidyMood; worldId: string; destinationId?: string;
  anchorId?: string; invitation?: boolean;
}): Promise<CassidyLifeState> {
  const previous = await getCassidyLifeState();
  const now = new Date().toISOString();
  return saveCassidyLifeState({
    activity: input.activity, mood: input.mood, worldId: input.worldId,
    destinationId: input.destinationId, anchorId: input.anchorId,
    startedAt: previous.activity === input.activity && previous.worldId === input.worldId ? previous.startedAt : now,
    visits: previous.visits + 1,
    ...(input.invitation ? {lastInvitationAt: now} : {}),
  });
}

export async function clearCassidyLifeState(): Promise<void> {
  await LocalStore.set(KEY, DEFAULT_STATE);
}

export const cassidyLifeStateEngine = {
  get: getCassidyLifeState, save: saveCassidyLifeState,
  begin: beginCassidyLifeMoment, clear: clearCassidyLifeState,
};
