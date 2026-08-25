import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface AuthResult {
  user: { id: string; email: string | null } | null;
  error: Error | null;
}

const LOCAL_EXPLORER_USER = {
  id: 'local-explorer-user',
  email: 'explorer@gopal.ai',
};

export const auth = {
  async signUp(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
      return { user: { id: 'user-' + Date.now(), email }, error: null };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { user: data.user ? { id: data.user.id, email: data.user.email ?? null } : null, error };
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
      return { user: { id: 'user-' + Date.now(), email }, error: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user ? { id: data.user.id, email: data.user.email ?? null } : null, error };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  async getCurrentUser(): Promise<{ id: string; email: string | null } | null> {
    if (!isSupabaseConfigured) {
      return LOCAL_EXPLORER_USER;
    }
    try {
      const { data } = await supabase.auth.getUser();
      return data.user ? { id: data.user.id, email: data.user.email ?? null } : LOCAL_EXPLORER_USER;
    } catch {
      return LOCAL_EXPLORER_USER;
    }
  },

  onAuthStateChange(cb: (user: { id: string; email: string | null } | null) => void) {
    if (!isSupabaseConfigured) {
      // Immediately invoke callback with local user
      cb(LOCAL_EXPLORER_USER);
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    }
    return supabase.auth.onAuthStateChange((_event, session) => {
      cb(session?.user ? { id: session.user.id, email: session.user.email ?? null } : LOCAL_EXPLORER_USER);
    });
  },
};

