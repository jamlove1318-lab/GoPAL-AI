import type { CassidyMood } from '../../characters/cassidy';
import { decideCassidyLife, type CassidyLifeInput, type CassidyLifeMoment } from './cassidyLifeEngine';
import { beginCassidyLifeMoment, getCassidyLifeState, markCassidyInteraction, CASSIDY_HOME_WORLD_ID, type CassidyLifeState } from './cassidyLifeStateEngine';
import { recordCassidyExperience } from './cassidyExperienceCoordinator';

export type CassidyRuntimeSession = {
  userId: string;
  homeWorldId: typeof CASSIDY_HOME_WORLD_ID;
  currentWorldId: string;
  destinationId?: string;
  anchorId?: string;
  life: CassidyLifeState;
  active: boolean;
};

export async function restoreCassidySession(userId = 'local-explorer-user'): Promise<CassidyRuntimeSession> {
  const safeUserId = userId.trim() || 'local-explorer-user';
  const life = await getCassidyLifeState(safeUserId);
  return { userId: safeUserId, homeWorldId: CASSIDY_HOME_WORLD_ID, currentWorldId: life.worldId || CASSIDY_HOME_WORLD_ID, destinationId: life.destinationId, anchorId: life.anchorId, life, active: true };
}

export async function enterCassidyWorld(userId: string, worldId: string, destinationId?: string, anchorId?: string, mood: CassidyMood = 'warm'): Promise<CassidyRuntimeSession> {
  const safeWorld = worldId.trim() || CASSIDY_HOME_WORLD_ID;
  const life = await beginCassidyLifeMoment(userId, { activity: 'wandering', mood, worldId: safeWorld, destinationId, anchorId });
  return { userId, homeWorldId: CASSIDY_HOME_WORLD_ID, currentWorldId: safeWorld, destinationId, anchorId, life, active: true };
}

export async function returnCassidyHome(userId: string, mood: CassidyMood = 'warm'): Promise<CassidyRuntimeSession> {
  return enterCassidyWorld(userId, CASSIDY_HOME_WORLD_ID, undefined, undefined, mood);
}

export async function noteCassidyInteraction(userId: string, context: { worldId?: string; destinationId?: string; anchorId?: string } = {}): Promise<CassidyLifeState> {
  return markCassidyInteraction(userId, context);
}

export async function decideAndBeginCassidyMoment(userId: string, input: CassidyLifeInput, seed?: number): Promise<{ session: CassidyRuntimeSession; moment: CassidyLifeMoment }> {
  const moment = decideCassidyLife(input, seed);
  const life = await beginCassidyLifeMoment(userId, { activity: moment.activity, mood: moment.mood, worldId: moment.worldId, destinationId: moment.destinationId, invitation: moment.invitation });
  return { session: { userId, homeWorldId: CASSIDY_HOME_WORLD_ID, currentWorldId: life.worldId, destinationId: life.destinationId, anchorId: life.anchorId, life, active: true }, moment };
}

export async function recordMeaningfulCassidyMoment(userId: string, event: { experienceId: string; activity: 'discovering'|'adventure'|'storytelling'|'dreaming'|'helping'|'celebrating'; summary: string; worldId?: string; destinationId?: string }): Promise<void> {
  await recordCassidyExperience({ userId, ...event });
}

export const cassidyRuntimeSessionEngine = { restore: restoreCassidySession, enterWorld: enterCassidyWorld, returnHome: returnCassidyHome, noteInteraction: noteCassidyInteraction, decideAndBegin: decideAndBeginCassidyMoment, recordMeaningfulMoment: recordMeaningfulCassidyMoment, homeWorldId: CASSIDY_HOME_WORLD_ID };
