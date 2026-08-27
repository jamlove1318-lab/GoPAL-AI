import { useEffect, useState, useCallback } from 'react';
import type { ResolvedWorldState } from '../engines/world/worldEngine';
import type { ContinuityResult } from '../engines/world/continuityEngine';
import type { WorldSnapshot } from '../engines/world/livingWorldRuntime';
import { LivingWorldRuntime } from '../engines/world/livingWorldRuntime';
import { auth } from '../services/auth';

const livingWorldRuntime = new LivingWorldRuntime();

export function useWorldState() {
  const [state, setState] = useState<ResolvedWorldState | null>(null);
  const [snapshot, setSnapshot] = useState<WorldSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('local-explorer-user');
  const [continuity, setContinuity] = useState<ContinuityResult | null>(null);

  const load = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const worldSnapshot = await livingWorldRuntime.load(uid);
      if (worldSnapshot) {
        setSnapshot(worldSnapshot);
        setState(worldSnapshot.resolved);
        setContinuity(worldSnapshot.continuity);
        // Persist only after the snapshot is composed so the next visit sees the real gap.
        await livingWorldRuntime.markActive(uid);
      } else {
        setSnapshot(null);
        setState(null);
        setContinuity(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const unsub = auth.onAuthStateChange(async (user) => {
      const uid = user ? user.id : 'local-explorer-user';
      setUserId(uid);
      if (active) await load(uid);
    });
    return () => {
      active = false;
      unsub.data.subscription.unsubscribe();
    };
  }, [load]);

  const changeLocation = useCallback(
    async (locationId: string) => {
      if (!userId || !state) return;
      const nextSnapshot = await livingWorldRuntime.changeLocation(userId, locationId);
      if (nextSnapshot) {
        setSnapshot(nextSnapshot);
        setState(nextSnapshot.resolved);
        setContinuity(nextSnapshot.continuity);
        await livingWorldRuntime.markActive(userId);
      }
    },
    [userId, state]
  );

  return {
    state,
    snapshot,
    loading,
    continuity,
    worldEngine: livingWorldRuntime.world,
    changeLocation,
    refresh: () => load(userId),
  };
}
