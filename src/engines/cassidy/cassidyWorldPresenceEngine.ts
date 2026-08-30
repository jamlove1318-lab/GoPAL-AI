import { CassidyMood } from '../../characters/cassidy';
import { LanguageWorldId, resolveLanguageWorld } from '../world/languageWorldEngine';

export type CassidyPresenceContext =
  | 'exploring'
  | 'learning'
  | 'confused'
  | 'success'
  | 'quiet'
  | 'returning';

export type CassidyWorldPresence = {
  worldId: LanguageWorldId;
  worldName: string;
  context: CassidyPresenceContext;
  mood: CassidyMood;
  visible: boolean;
  line: string | null;
  helpMode: 'wait' | 'offer' | 'guide' | 'celebrate';
};

const WORLD_LINES: Record<LanguageWorldId, Record<CassidyPresenceContext, string[]>> = {
  ja: {
    exploring: ['Let’s see what this street is hiding.', 'I like the sound of this place already.'],
    learning: ['Take your time. We only need enough language for this moment.'],
    confused: ['Want a small hint, or do you want another second to listen?'],
    success: ['That was yours. You used Japanese to make something happen.'],
    quiet: ['We do not have to turn every quiet moment into a lesson.'],
    returning: ['Welcome back. Hikari has been moving without us.'],
  },
  es: {
    exploring: ['This place feels like it has a story around every corner.', 'Come on — I want to see where that street goes.'],
    learning: ['Let’s use only what you need, then give the moment back to you.'],
    confused: ['No rush. Listen once more and tell me what you caught.'],
    success: ['You just made the conversation move because you understood it.'],
    quiet: ['Sometimes wandering together is enough.'],
    returning: ['Solara looks different in this light. Want to see what changed?'],
  },
  fr: {
    exploring: ['I keep wondering what is behind those lights.', 'Let’s follow the river for a while.'],
    learning: ['We can borrow a little language now and make it yours later.'],
    confused: ['I can help. Only if you want me to.'],
    success: ['There. You were understood. That is a beautiful thing.'],
    quiet: ['Stay a moment. The world does not mind waiting.'],
    returning: ['Belle Rivière kept its lights on for us.'],
  },
  ko: {
    exploring: ['There is so much happening here. Let’s not rush past it.', 'I want to know what everyone is doing down there.'],
    learning: ['Let’s catch the useful pieces first. The rest can wait.'],
    confused: ['Try one more time. I am right here if you need me.'],
    success: ['You understood enough to belong in that moment.'],
    quiet: ['We can just watch the city breathe for a minute.'],
    returning: ['Haenam did not stop while we were away. Neither did your story.'],
  },
};

function choose<T>(items: T[]): T { return items[Math.floor(Math.random() * items.length)]!; }

export function resolveCassidyWorldPresence(languageCode: string, context: CassidyPresenceContext): CassidyWorldPresence {
  const world = resolveLanguageWorld(languageCode);
  const mood: CassidyMood = context === 'success' ? 'excited' : context === 'confused' ? 'thinking' : context === 'quiet' ? 'calm' : context === 'returning' ? 'warm' : 'warm';
  const helpMode = context === 'learning' ? 'guide' : context === 'confused' ? 'offer' : context === 'success' ? 'celebrate' : 'wait';
  return { worldId: world.id, worldName: world.worldName, context, mood, visible: true, line: choose(WORLD_LINES[world.id][context]), helpMode };
}

export const cassidyWorldPresenceEngine = { resolve: resolveCassidyWorldPresence };
