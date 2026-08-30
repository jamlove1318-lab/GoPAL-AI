// The Cassidy part — who she is, how she talks, how she moves.
// This is the character's "soul" data: personality, expressions, voice.
// The visual rig lives in components/CassidyCharacter.tsx; this module
// decides *what* she says and *how* she feels.

import type { CassidySnapshot, Place } from './cassidyContext';

export type CassidyMood = 'happy' | 'calm' | 'thinking' | 'excited' | 'warm';
export type CassidyAction = 'idle' | 'talking' | 'waving' | 'walking';

function choose<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export const Cassidy = {
  name: 'Cassidy',
  role: 'Companion across every language world',
  personality: [
    'Warm and unhurried — she never rushes you.',
    'Curious about your small victories, quick to forget your mistakes.',
    'Speaks like a friend, not a tutor: "want to try?" not "you must".',
    'Finds wonder in ordinary things and names it out loud.',
    'Travels with the learner between worlds without belonging to only one of them.',
  ],
  greetings: [
    'Oh — you’re here. The valley’s been quieter without you.',
    'There you are. I saved you the good window seat by the rain.',
    'Hi. I was just replaying one of our little victories.',
    'You came back. I knew you would — eventually, in your own time.',
  ],
  lines: {
    happy: ['That’s it — you’ve got it now.', 'Look at you go. I’m watching, proudly.', 'See? It wasn’t a wall, just a step.'],
    calm: ['Whenever you’re ready. I’ll be right here.', 'No rush. The kettle’s still warm.', 'Breathe. We can do one small thing.'],
    thinking: ['Hmm… what if we tried it this way?', 'Let me think with you for a second.', 'I have an idea, but only if you’re curious.'],
    excited: ['You did the thing!!', 'A whole sentence — I’m so proud of you right now.', 'That was real Japanese, from you. Remember this feeling.'],
    warm: ['I kept the study bonsai watered while you were away.', 'The valley missed your footsteps.', 'Your words are starting to sound like home.'],
  } as Record<CassidyMood, string[]>,
  pickGreeting: () => choose(Cassidy.greetings),
  lineFor: (m: CassidyMood) => choose(Cassidy.lines[m]),
  randomLine: () => choose(Object.values(Cassidy.lines).flat()),
  moodFor: (place: Place): CassidyMood =>
    ({ home: 'warm', cassidy: 'happy', study: 'happy', world: 'thinking', journey: 'warm', museum: 'calm', characters: 'excited', settings: 'calm' } as Record<Place, CassidyMood>)[place] ?? 'warm',

  // Contextual voice: the same companion remembers enough of the learner's
  // journey to avoid sounding like a stateless rotating quote machine.
  placeLine: (place: Place, snap: CassidySnapshot): string => {
    const r = (arr: string[]) => choose(arr);
    const s = (n: number) => (n === 1 ? '' : 's');
    switch (place) {
      case 'home':
        if (snap.returns > 0) return r([
          `You've been here ${snap.returns} time${s(snap.returns)}. The valley remembers you.`,
          snap.lastMode ? `Welcome back — last time felt ${snap.lastMode}. What shall today feel like?` : 'Welcome back. I wonder what today will become.',
          snap.bonsaiGrowth > 0 ? `The study bonsai is at ${snap.bonsaiGrowth}%. It has been growing with your journey.` : 'The study is quiet. A perfect place to begin.',
        ]);
        return r(Cassidy.greetings);
      case 'study':
        if (snap.echoes >= 5) return `You have ${snap.echoes} learning echoes now. Want to add one more little door?`;
        return r(['Shall we learn something today? I’ll be right here.', 'A new word is a small door. Want to open one?', 'Whenever you’re ready — no rush. The kettle’s warm.']);
      case 'world':
        if (snap.worldEchoes > 0) return r([
          `Places you've seen keep teaching you — ${snap.worldEchoes} echo${s(snap.worldEchoes)} now.`,
          snap.radioGrowth > 0 ? 'The radio has been collecting little traces of your travels.' : 'The world is holding a secret it learned from you.',
        ]);
        return r(['Every corner here has a story. Shall we wander?', 'I love it out here with you.']);
      case 'journey':
        if (snap.souvenirs > 1) return `You've gathered ${snap.souvenirs} souvenirs. Each one is a real day we shared.`;
        return r(['This is your path — it only grows when you walk it.', 'Look how far your footsteps reach.']);
      case 'museum':
        if (snap.threads > 0) return `I tied your moments into ${snap.threads} memory thread${s(snap.threads)}. They’re yours to revisit.`;
        return r(['These are your memories, kept safe.', 'Everything here actually happened to you.']);
      case 'characters': return r(['These are the friends of the valley.', 'Ren at the café still asks about you, you know.']);
      case 'settings': return r(['Need anything? I’ll be right here.', 'Tweak away — I’m not going anywhere.']);
      case 'cassidy': return Cassidy.lineFor('warm');
      default: return Cassidy.randomLine();
    }
  },
};