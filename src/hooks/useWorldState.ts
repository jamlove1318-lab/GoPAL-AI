import { useEffect, useState, useCallback } from 'react';
import { LivingWorldRuntime, type WorldSnapshot } from '../engines/world/livingWorldRuntime';
import type { ResolvedWorldState } from '../engines/world/worldEngine';
import { auth } from '../services/auth';
import { eventBus } from '../engines/events/eventBus';
import { worldPresenceEngine, type WorldPresence } from '../engines/world/worldPresenceEngine';
import { worldContextEngine, type WorldContext } from '../engines/world/worldContextEngine';
import type { LanguageWorldId } from '../engines/world/languageWorldEngine';

const livingWorld = new LivingWorldRuntime();

export function useWorldState() {
  const [state, setState] = useState<ResolvedWorldState | null>(null);
  const [snapshot, setSnapshot] = useState<WorldSnapshot | null>(null);
  const [presence, setPresence] = useState<WorldPresence>(worldPresenceEngine.current());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState('local-explorer-user');

  const syncPresence = useCallback(() => { const next = worldPresenceEngine.current(); setPresence(next); return next; }, []);
  const load = useCallback(async (uid: string) => {
    setLoading(true); setError(null);
    try { await worldPresenceEngine.hydrate(); syncPresence(); const next = await livingWorld.load(uid); setSnapshot(next); setState(next.resolved); }
    catch (cause) { setError(cause instanceof Error ? cause : new Error('Unable to enter your world.')); }
    finally { setLoading(false); }
  }, [syncPresence]);

  useEffect(() => { let active = true; const unsub = auth.onAuthStateChange(async user => { const uid = user?.id ?? 'local-explorer-user'; if (!active) return; setUserId(uid); await load(uid); }); return () => { active = false; unsub.data.subscription.unsubscribe(); }; }, [load]);

  const changeLocation = useCallback(async (locationId: string) => {
    if (!userId) return; setLoading(true); setError(null); const previousLocationId = state?.location?.id;
    try { const next = await livingWorld.changeLocation(userId, locationId); setSnapshot(next); setState(next.resolved); eventBus.emit('world:locationChanged', { locationId, userId, previousLocationId }, 'world'); }
    catch (cause) { setError(cause instanceof Error ? cause : new Error('Unable to travel to that place.')); }
    finally { setLoading(false); }
  }, [state?.location?.id, userId]);

  const travelToDestination = useCallback(async (worldId: LanguageWorldId, placeId?: string) => {
    setLoading(true); setError(null);
    try { const previous = presence; const next = await worldPresenceEngine.travel(worldId, placeId); setPresence(next); if (next.kind === 'journey') { eventBus.emit('world:destinationEntered', next, 'world'); eventBus.emit('world:locationChanged', { locationId: next.placeId, userId, previousLocationId: previous.kind === 'journey' ? previous.placeId : undefined }, 'world'); } return next; }
    catch (cause) { const nextError = cause instanceof Error ? cause : new Error('Unable to begin that journey.'); setError(nextError); throw nextError; }
    finally { setLoading(false); }
  }, [presence, userId]);

  const goHome = useCallback(async () => {
    setLoading(true); setError(null);
    try { const next = await worldPresenceEngine.goHome(); setPresence(next); if (next.kind === 'home') { eventBus.emit('world:returnHome', next, 'world'); eventBus.emit('world:returned', { userId, lastActiveAt: new Date().toISOString() }, 'world'); } return next; }
    catch (cause) { const nextError = cause instanceof Error ? cause : new Error('Unable to return home.'); setError(nextError); throw nextError; }
    finally { setLoading(false); }
  }, [userId]);

  const refresh = useCallback(() => load(userId), [load, userId]);
  const context: WorldContext = worldContextEngine.resolve(presence);
  return { state, snapshot, presence, context, loading, error, userId, continuity: snapshot?.continuity ?? null, worldEngine: livingWorld, changeLocation, travelToDestination, goHome, refresh };
}
