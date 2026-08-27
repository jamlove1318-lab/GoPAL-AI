import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { LocalStore } from '../../lib/localStore';
import { WaveStore, MemoryThread, DistilledMemory, LearningSouvenir } from '../../lib/waveStore';
import type { JourneyEventsRow, Json } from '../../types/database';

export interface JourneyEntry { id: string; type: string; label: string; at: string; detail?: string; }
export interface ThenVsNowItem { concept: string; thenDescription: string; nowDescription: string; masteryDate: string; }
export interface JourneyBook { timeline: JourneyEntry[]; milestones: string[]; firstDay: string | null; thenVsNow: ThenVsNowItem[]; }

function labelFor(type: string, payload?: Record<string, unknown>): string {
  switch (type) {
    case 'learning:sessionCompleted': return 'Completed a learning session';
    case 'quest:completed': return payload?.questTitle ? `Finished quest: ${payload.questTitle}` : 'Finished a quest';
    case 'story:progressed': return 'Advanced a living story';
    case 'achievement:earned': return payload?.title ? `Achievement: ${payload.title}` : 'Earned an achievement';
    case 'location:unlocked': return payload?.location ? `Unlocked location: ${payload.location}` : 'Unlocked a location';
    case 'conversation:completed': return payload?.topic ? `Conversation on ${payload.topic}` : 'Held a conversation';
    case 'discovery:made': return payload?.discovery ? `Discovered: ${payload.discovery}` : 'Made a discovery';
    case 'souvenir:earned': return payload?.title ? `Earned souvenir: ${payload.title}` : 'Earned a learning souvenir';
    default: return 'Something happened in your world';
  }
}

export class JourneyEngine {
  private async loadEvents(userId: string): Promise<JourneyEventsRow[]> {
    if (!isSupabaseConfigured) return LocalStore.getJourneyEvents();
    try {
      const { data, error } = await supabase.from('journey_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as JourneyEventsRow[];
    } catch {
      return LocalStore.getJourneyEvents();
    }
  }

  async buildBook(userId: string): Promise<JourneyBook> {
    const rows = await this.loadEvents(userId);
    const timeline = rows.map((e) => ({ id: e.id, type: e.type, label: labelFor(e.type, e.payload as Record<string, unknown>), at: e.created_at }));
    const thenVsNow: ThenVsNowItem[] = [
      { concept: 'Ordering at Café Komorebi', thenDescription: 'Initially hesitated to speak without English hints and confused "kudasai" with pointing.', nowDescription: 'Naturally order tea and hot matcha in complete Japanese sentences with Barista Ren.', masteryDate: new Date(Date.now() - 3 * 86400000).toISOString() },
      { concept: 'Polite Evening Farewells', thenDescription: 'Felt uncertain when to use "Otsukaresama deshita" vs "Sayounara".', nowDescription: 'Confidently uses "Otsukaresama" with Cassidy and friends at the end of each study session.', masteryDate: new Date(Date.now() - 1 * 86400000).toISOString() },
    ];
    return { timeline, milestones: ['First Conversation Breakthrough', 'Sunlit Study Master', 'Café Regular', 'Lantern Pass'], firstDay: timeline.length ? timeline[timeline.length - 1].at : null, thenVsNow };
  }

  async recordEvent(userId: string, producer: string, type: string, payload: Record<string, unknown>): Promise<void> {
    if (!isSupabaseConfigured) { await LocalStore.addJourneyEvent(type, payload, producer); return; }
    const { error } = await supabase.from('journey_events').insert({ user_id: userId, producer, type, payload: payload as unknown as Json });
    if (error) await LocalStore.addJourneyEvent(type, payload, producer);
  }

  async getMemoryThreads(): Promise<MemoryThread[]> { return WaveStore.getThreads(); }
  async addMemoryThread(title: string, theme: string, eventRefs: string[]): Promise<MemoryThread[]> { return WaveStore.addThread({ title, theme, eventRefs }); }

  async distillMemories(userId: string): Promise<DistilledMemory[]> {
    const rows = await this.loadEvents(userId);
    const existing = await WaveStore.getDistilled();
    const existingRefs = new Set(existing.map((d) => d.sourceEventId));
    const RELEVANCE: Record<string, number> = { 'quest:completed': 5, 'achievement:earned': 5, 'conversation:completed': 4, 'story:progressed': 4, 'location:unlocked': 3, 'discovery:made': 3, 'learning:sessionCompleted': 2, 'souvenir:earned': 2 };
    const candidates = rows.filter((e) => !existingRefs.has(e.id)).map((e) => ({ sourceEventId: e.id, summary: `${e.type} · ${JSON.stringify(e.payload).slice(0, 120)}`, rank: RELEVANCE[e.type] ?? 1 })).sort((a, b) => b.rank - a.rank);
    for (const candidate of candidates) await WaveStore.addDistilled(candidate);
    return WaveStore.getDistilled();
  }

  async getSouvenirs(): Promise<LearningSouvenir[]> { return WaveStore.getSouvenirs(); }
  async earnSouvenir(title: string, kind: LearningSouvenir['kind'], detail: string, userId = 'local-explorer-user'): Promise<LearningSouvenir[]> {
    const result = await WaveStore.addSouvenir({ title, kind, detail });
    await this.recordEvent(userId, 'journey_engine', 'souvenir:earned', { title, kind });
    return result;
  }
}
