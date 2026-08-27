import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { LocalStore } from '../../lib/localStore';
import type { CharacterRelationshipsRow, CharacterStateRow, CharactersRow } from '../../types/database';
import type { Mood, TimeOfDay } from '../../lib/types';

export interface CassidyView {
  character: CharactersRow | null;
  state: CharacterStateRow | null;
  relationship: CharacterRelationshipsRow | null;
}

export class CharacterEngine {
  async loadCassidy(userId: string, characterKey = 'cassidy'): Promise<CassidyView> {
    if (!isSupabaseConfigured) return LocalStore.getCassidyView();
    try {
      const { data: character } = await supabase.from('characters').select('*').eq('key', characterKey).maybeSingle();
      if (!character) return LocalStore.getCassidyView();
      const { data: state } = await supabase.from('character_state').select('*').eq('character_id', character.id).maybeSingle();
      const { data: relationship } = await supabase.from('character_relationships').select('*').eq('user_id', userId).eq('character_id', character.id).maybeSingle();
      return { character, state, relationship };
    } catch {
      return LocalStore.getCassidyView();
    }
  }

  async setMood(characterId: string, mood: Mood, energy: number, activity: string | null): Promise<void> {
    if (!isSupabaseConfigured) {
      await LocalStore.updateCassidyState({ mood, energy, current_activity: activity });
      return;
    }
    try {
      await supabase.from('character_state').upsert({ character_id: characterId, mood, energy, current_activity: activity, updated_at: new Date().toISOString() });
    } catch {
      await LocalStore.updateCassidyState({ mood, energy, current_activity: activity });
    }
  }

  async recordRelationship(userId: string, characterId: string, patch: Partial<Pick<CharacterRelationshipsRow, 'familiarity' | 'trust' | 'friendship'>>): Promise<void> {
    if (!isSupabaseConfigured) {
      await LocalStore.updateCassidyRelationship(patch);
      return;
    }
    try {
      await supabase.from('character_relationships').upsert({ user_id: userId, character_id: characterId, ...patch, updated_at: new Date().toISOString() });
    } catch {
      await LocalStore.updateCassidyRelationship(patch);
    }
  }

  generateGreeting(timeOfDay: TimeOfDay, locationName: string, mood: Mood): string {
    const timeGreetings: Record<TimeOfDay, string> = {
      morning: 'Good morning! The morning air is crisp, and our study tea is ready.',
      afternoon: 'Good afternoon! Wonderful time for a relaxed conversation or exploration.',
      evening: 'Good evening. The lights are warm—let us review what we discovered today.',
      night: 'Peaceful night. Perfect for calm reflection or a gentle story before sleep.',
    };
    const base = timeGreetings[timeOfDay] || 'Hello! It is wonderful to see you.';
    if (locationName && !locationName.includes('Study')) return `${base} We are currently at ${locationName}. Ready to explore?`;
    return base;
  }
}
