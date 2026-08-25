import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { LocalStore } from '../../lib/localStore';
import type { JourneyEventsRow, Json } from '../../types/database';

export interface JourneyEntry {
  id: string;
  type: string;
  label: string;
  at: string;
  detail?: string;
}

export interface ThenVsNowItem {
  concept: string;
  thenDescription: string;
  nowDescription: string;
  masteryDate: string;
}

export interface JourneyBook {
  timeline: JourneyEntry[];
  milestones: string[];
  firstDay: string | null;
  thenVsNow: ThenVsNowItem[];
}

function labelFor(type: string, payload?: Record<string, unknown>): string {
  switch (type) {
    case 'learning:sessionCompleted':
      return 'Completed a learning session';
    case 'quest:completed':
      return payload?.questTitle ? `Finished quest: ${payload.questTitle}` : 'Finished a quest';
    case 'story:progressed':
      return 'Advanced a living story';
    case 'achievement:earned':
      return payload?.title ? `Achievement: ${payload.title}` : 'Earned an achievement';
    case 'location:unlocked':
      return payload?.location ? `Unlocked location: ${payload.location}` : 'Unlocked a location';
    case 'conversation:completed':
      return payload?.topic ? `Conversation on ${payload.topic}` : 'Held a conversation';
    case 'discovery:made':
      return payload?.discovery ? `Discovered: ${payload.discovery}` : 'Made a discovery';
    default:
      return 'Something happened in your world';
  }
}

export class JourneyEngine {
  async buildBook(userId: string): Promise<JourneyBook> {
    let rows: JourneyEventsRow[] = [];

    if (!isSupabaseConfigured) {
      rows = await LocalStore.getJourneyEvents();
    } else {
      try {
        const { data: events } = await supabase
          .from('journey_events')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(100);
        rows = (events && events.length ? events : await LocalStore.getJourneyEvents()) as JourneyEventsRow[];
      } catch {
        rows = await LocalStore.getJourneyEvents();
      }
    }

    const timeline: JourneyEntry[] = rows.map((e) => ({
      id: e.id,
      type: e.type,
      label: labelFor(e.type, e.payload as Record<string, unknown>),
      at: e.created_at,
    }));

    const thenVsNow: ThenVsNowItem[] = [
      {
        concept: 'Ordering at Café Komorebi',
        thenDescription: 'Initially hesitated to speak without English hints and confused "kudasai" with pointing.',
        nowDescription: 'Naturally order tea and hot matcha in complete Japanese sentences with Barista Ren.',
        masteryDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        concept: 'Polite Evening Farewells',
        thenDescription: 'Felt uncertain when to use "Otsukaresama deshita" vs "Sayounara".',
        nowDescription: 'Confidently uses "Otsukaresama" with Cassidy and friends at the end of each study session.',
        masteryDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];

    return {
      timeline,
      milestones: ['First Conversation Breakthrough', 'Sunlit Study Master', 'Café Regular', 'Lantern Pass'],
      firstDay: timeline.length ? timeline[timeline.length - 1].at : new Date(Date.now() - 30 * 86400000).toISOString(),
      thenVsNow,
    };
  }

  async recordEvent(userId: string, producer: string, type: string, payload: Record<string, unknown>): Promise<void> {
    if (!isSupabaseConfigured) {
      await LocalStore.addJourneyEvent(type, payload, producer);
      return;
    }

    try {
      await supabase.from('journey_events').insert({
        user_id: userId,
        producer,
        type,
        payload: payload as unknown as Json,
      });
    } catch {
      await LocalStore.addJourneyEvent(type, payload, producer);
    }
  }
}
