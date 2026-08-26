import { useEffect, useState, useCallback } from 'react';
import { WorldEngine } from '../engines/world/worldEngine';
import type { ResolvedWorldState } from '../engines/world/worldEngine';
import { computeContinuity, ContinuityResult } from '../engines/world/continuityEngine';
import { auth } from '../services/auth';

const worldEngine = new WorldEngine();

export function useWorldState() {
  const [state, setState] = useState<ResolvedWorldState | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('local-explorer-user');
  const [continuity, setContinuity] = useState<ContinuityResult | null>(null);

  const load = useCallback(async (uid: string) => {
    setLoading(true);
    const resolved = await worldEngine.loadState(uid);
    if (resolved) {
      const cont = computeContinuity(resolved.lastActiveAt);
      setContinuity(cont);
      // Persist the return timestamp AFTER computing continuity so the next
      // return can calculate real elapsed time (Blueprint #5/#6: World Continuity).
      await worldEngine.saveState(uid, { lastActiveAt: new Date().toISOString() });
    }
    setState(resolved);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    const unsub = auth.onAuthStateChange(async (user) => {
      const uid = user ? user.id : 'local-explorer-user';
      setUserId(uid);
      if (active) {
        await load(uid);
      }
    });
    return () => {
      active = false;
      unsub.data.subscription.unsubscribe();
    };
  }, [load]);

  const changeLocation = useCallback(
    async (locationId: string) => {
      if (!userId) return;
      await worldEngine.setLocation(userId, locationId);
      await load(userId);
    },
    [userId, load]
  );

  return {
    state,
    loading,
    continuity,
    worldEngine,
    changeLocation,
    refresh: () => load(userId),
  };
}

