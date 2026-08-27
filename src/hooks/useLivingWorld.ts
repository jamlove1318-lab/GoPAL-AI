import { useCallback, useEffect, useState } from 'react';
import { auth } from '../services/auth';
import { LivingWorldRuntime, type WorldSnapshot } from '../engines/world/livingWorldRuntime';

const runtime = new LivingWorldRuntime();
const LOCAL_USER_ID = 'local-explorer-user';

export function useLivingWorld() {
  const [snapshot, setSnapshot] = useState<WorldSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(LOCAL_USER_ID);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const next = await runtime.load(uid);
      setSnapshot(next);
      if (next) {
        await runtime.markActive(uid);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error('Unable to restore the living world.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const unsubscribe = auth.onAuthStateChange(async (user) => {
      const uid = user?.id ?? LOCAL_USER_ID;
      if (!active) return;
      setUserId(uid);
      await load(uid);
    });

    return () => {
      active = false;
      unsubscribe.data.subscription.unsubscribe();
    };
  }, [load]);

  const refresh = useCallback(() => load(userId), [load, userId]);

  return { snapshot, loading, error, userId, refresh };
}

export { runtime as livingWorldRuntime };
