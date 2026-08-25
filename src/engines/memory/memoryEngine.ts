import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { LocalStore } from '../../lib/localStore';
import type { MemoriesRow, Json } from '../../types/database';

export type MemoryLayer =
  | 'profile'
  | 'learning'
  | 'conversation'
  | 'character'
  | 'world'
  | 'story'
  | 'progress'
  | 'preference'
  | 'achievement'
  | 'session';

export class MemoryEngine {
  async record(
    userId: string,
    layer: MemoryLayer,
    canonicalFact: string,
    sourceEventId?: string,
  ): Promise<MemoriesRow> {
    if (!isSupabaseConfigured) {
      return LocalStore.addMemory(layer, canonicalFact);
    }

    try {
      const row = {
        user_id: userId,
        layer,
        canonical_fact: canonicalFact,
        source_event_id: sourceEventId ?? null,
        occurred_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('memories').insert(row).select('*').single();
      if (error || !data) return LocalStore.addMemory(layer, canonicalFact);
      return data as MemoriesRow;
    } catch {
      return LocalStore.addMemory(layer, canonicalFact);
    }
  }

  async list(userId: string, layer?: MemoryLayer): Promise<MemoriesRow[]> {
    if (!isSupabaseConfigured) {
      const list = await LocalStore.getMemories();
      return layer ? list.filter((m) => m.layer === layer) : list;
    }

    try {
      let query = supabase.from('memories').select('*').eq('user_id', userId).order('occurred_at', { ascending: false });
      if (layer) query = query.eq('layer', layer);
      const { data } = await query;
      return (data && data.length ? data : await LocalStore.getMemories()) as MemoriesRow[];
    } catch {
      const list = await LocalStore.getMemories();
      return layer ? list.filter((m) => m.layer === layer) : list;
    }
  }

  async logConversationMemory(userId: string, conversationId: string, evaluation: Record<string, unknown>, memoryId?: string): Promise<void> {
    if (!memoryId || !isSupabaseConfigured) return;
    try {
      await supabase.from('conversation_memories').insert({
        memory_id: memoryId,
        user_id: userId,
        conversation_id: conversationId,
        evaluation: evaluation as unknown as Json,
      });
    } catch {
      // safe fallback
    }
  }
}
