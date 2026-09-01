import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../services/auth';
import { eventBus } from '../events/eventBus';

type StoredState = { lastActiveAt: string; visitCount: number; seed: number };
export type WorldReturn = { lastActiveAt: string; elapsedMinutes: number; visitCount: number; shiftedMinutes: number; changed: boolean; message: string };
const KEY_PREFIX = 'gopal:living-world:continuity:v2:';
const userKey = (userId: string) => `${KEY_PREFIX}${userId.trim() || 'local-explorer-user'}`;

/** Keeps the world moving while the learner is away without simulating every second. */
export class WorldContinuityEngine {
  async returnToWorld(now = new Date(), userId?: string): Promise<WorldReturn> {
    const resolvedUserId = userId?.trim() || (await auth.getCurrentUser())?.id?.trim() || 'local-explorer-user';
    const key = userKey(resolvedUserId);
    const raw = await AsyncStorage.getItem(key);
    const previous: StoredState | null = raw ? JSON.parse(raw) : null;
    const elapsedMinutes = previous ? Math.max(0, Math.floor((now.getTime() - new Date(previous.lastActiveAt).getTime()) / 60000)) : 0;
    const visitCount = (previous?.visitCount ?? 0) + 1;
    const shiftedMinutes = Math.min(360, Math.floor(elapsedMinutes / 4) * 12 + (previous?.seed ?? 0) % 23);
    const changed = elapsedMinutes >= 3;
    const message = !previous ? 'The valley has been waiting for its first visitor.' : elapsedMinutes < 3 ? 'The valley is still moving around you.' : elapsedMinutes < 30 ? 'A few things have changed while you were away.' : elapsedMinutes < 180 ? 'The valley has moved on without stopping.' : 'A lot has happened since you last walked these paths.';
    await AsyncStorage.setItem(key, JSON.stringify({ lastActiveAt: now.toISOString(), visitCount, seed: (previous?.seed ?? Math.floor(now.getTime() % 100000)) + visitCount * 17 }));
    eventBus.emit('world:returned', { userId: resolvedUserId, lastActiveAt: previous?.lastActiveAt ?? now.toISOString() }, 'world');
    return { lastActiveAt: previous?.lastActiveAt ?? now.toISOString(), elapsedMinutes, visitCount, shiftedMinutes, changed, message };
  }
}
export const worldContinuityEngine = new WorldContinuityEngine();
