import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { LocalStore } from '../lib/localStore';
import { computeContinuity } from '../engines/world/continuityEngine';
import type { ContinuityResult } from '../engines/world/continuityEngine';

export function useSession(onReturn?: (result: ContinuityResult) => void) {
  useEffect(() => {
    let active = true;

    async function checkSession() {
      if (!isSupabaseConfigured) {
        const state = await LocalStore.getWorldState();
        if (!active || !state.last_active_at) return;
        const result = computeContinuity(state.last_active_at);
        onReturn?.(result);
        await LocalStore.saveWorldState({ last_active_at: new Date().toISOString() });
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (!user) return;

        const { data: state } = await supabase
          .from('world_state')
          .select('last_active_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!active || !state?.last_active_at) return;
        const result = computeContinuity(state.last_active_at);
        onReturn?.(result);
        await supabase
          .from('world_state')
          .update({ last_active_at: new Date().toISOString() })
          .eq('user_id', user.id);
      } catch {
        const state = await LocalStore.getWorldState();
        if (!active || !state.last_active_at) return;
        const result = computeContinuity(state.last_active_at);
        onReturn?.(result);
        await LocalStore.saveWorldState({ last_active_at: new Date().toISOString() });
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [onReturn]);
}
