import { useEffect, useState, useCallback } from 'react';
import { LivingWorldRuntime, type WorldSnapshot } from '../engines/world/livingWorldRuntime';
import type { ResolvedWorldState } from '../engines/world/worldEngine';
import { auth } from '../services/auth';

const livingWorld = new LivingWorldRuntime();

export function useWorldState() {
  const [state, setState] = useState<ResolvedWorldState | null>(null);
  const [snapshot, setSnapshot] = useState<WorldSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('local-explorer-user');

  const load = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const next = await livingWorld.load(uid);
      setSnapshot(next);
      setState(next?.resolved ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const unsub = auth.onAuthStateChange(async (user) => {
      const uid = user ? user.id : 'local-explorer-user';
      if (!active) return;
      setUserId(uid);
      await load(uid);
    });
    return () => {
      active = false;
      unsub.data.subscription.unsubscribe();
    };
  }, [load]);

  const changeLocation = useCallback(async (locationId: string) => {
    if (!userId) return;
    setLoading(true);
    try {
      const next = await livingWorld.changeLocation(userId, locationId);
      setSnapshot(next);
      setState(next?.resolved ?? null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(() => load(userId), [load, userId]);

  return {
    state,
    snapshot,
    loading,
    continuity: snapshot?.continuity ?? null,
    worldEngine: livingWorld,
    changeLocation,
    refresh,
  };
}
