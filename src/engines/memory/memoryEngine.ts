import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { addLocalMemory, getLocalMemories } from './localMemoryStore';
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
    const normalizedFact = canonicalFact.trim();
    if (!normalizedFact) throw new Error('Memory fact cannot be empty');

    if (!isSupabaseConfigured) {
      return addLocalMemory(userId, layer, normalizedFact);
    }

    try {
      const { data: existing, error: lookupError } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', userId)
        .eq('layer', layer)
        .eq('canonical_fact', normalizedFact)
        .order('occurred_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!lookupError && existing) return existing as MemoriesRow;

      const row = {
        user_id: userId,
        layer,
        canonical_fact: normalizedFact,
        source_event_id: sourceEventId ?? null,
        occurred_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('memories').insert(row).select('*').single();
      if (error || !data) return addLocalMemory(userId, layer, normalizedFact);
      return data as MemoriesRow;
    } catch {
      return addLocalMemory(userId, layer, normalizedFact);
    }
  }

  async list(userId: string, layer?: MemoryLayer): Promise<MemoriesRow[]> {
    if (!isSupabaseConfigured) {
      const list = await getLocalMemories(userId);
      return layer ? list.filter(m => m.layer === layer) : list;
    }

    try {
      let query = supabase.from('memories').select('*').eq('user_id', userId).order('occurred_at', { ascending: false });
      if (layer) query = query.eq('layer', layer);
      const { data } = await query;
      return (data && data.length ? data : await getLocalMemories(userId)) as MemoriesRow[];
    } catch {
      const list = await getLocalMemories(userId);
      return layer ? list.filter(m => m.layer === layer) : list;
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
