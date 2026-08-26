// The Cassidy part — who she is, how she talks, how she moves.
// This is the character's "soul" data: personality, expressions, voice.
// The visual rig lives in components/CassidyCharacter.tsx; this module
// decides *what* she says and *how* she feels, so the whole app can ask
// "Cassidy, what would you say right now?" and get her voice back.

import type { CassidySnapshot, Place } from './cassidyContext';

export type CassidyMood = 'happy' | 'calm' | 'thinking' | 'excited' | 'warm';
export type CassidyAction = 'idle' | 'talking' | 'waving' | 'walking';

function choose<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const Cassidy = {
  name: 'Cassidy',
  role: 'Companion & guide of Emerald Valley',

  // How she is, in her own words — used to color every interaction.
  personality: [
    'Warm and unhurried — she never rushes you.',
    'Curious about your small victories, quick to forget your mistakes.',
    'Speaks like a friend, not a tutor: "want to try?" not "you must".',
    'Finds wonder in ordinary things and names it out loud.',
  ],

  greetings: [
    'Oh — you’re here. The valley’s been quieter without you.',
    'There you are. I saved you the good window seat by the rain.',
    'Hi. I was just replaying the time you ordered coffee all in Japanese.',
    'You came back. I knew you would — eventually, in your own time.',
  ],

  // Lines keyed by mood — her voice for every state the app can be in.
  lines: {
    happy: [
      'That’s it — you’ve got it now.',
      'Look at you go. I’m watching, proudly.',
      'See? It wasn’t a wall, just a step.',
    ],
    calm: [
      'Whenever you’re ready. I’ll be right here.',
      'No rush. The kettle’s still warm.',
      'Breathe. We can do one small thing.',
    ],
    thinking: [
      'Hmm… what if we tried it this way?',
      'Let me think with you for a second.',
      'I have an idea, but only if you’re curious.',
    ],
    excited: [
      'You did the thing!!',
      'A whole sentence — I’m so proud of you right now.',
      'That was real Japanese, from you. Remember this feeling.',
    ],
    warm: [
      'I kept the study bonsai watered while you were away.',
      'The valley missed your footsteps.',
      'Your words are starting to sound like home.',
    ],
  } as Record<CassidyMood, string[]>,

  pickGreeting: () => choose(Cassidy.greetings),
  lineFor: (m: CassidyMood) => choose(Cassidy.lines[m]),
  randomLine: () => choose(Object.values(Cassidy.lines).flat()),

  // The mood that fits a place — so she feels different in the study
  // than she does in the museum.
  moodFor: (place: Place): CassidyMood =>
    (
      ({
        home: 'warm',
        cassidy: 'happy',
        study: 'happy',
        world: 'thinking',
        journey: 'warm',
        museum: 'calm',
        characters: 'excited',
        settings: 'calm',
      } as Record<Place, CassidyMood>)[place] ?? 'warm'
    ),

  // Her voice, grounded in the learner's actual world. This is what makes
  // the whole app feel alive: she knows where you are and what you've done.
  placeLine: (place: Place, snap: CassidySnapshot): string => {
    const r = (arr: string[]) => choose(arr);
    const s = (n: number) => (n === 1 ? '' : 's');
    switch (place) {
      case 'home':
        if (snap.returns > 0)
          return r([
            `You've been here ${snap.returns} time${s(snap.returns)}. The valley remembers you.`,
            `Welcome back — last we met you were in a "${snap.lastMode}" kind of mood.`,
            `The study bonsai's at ${snap.bonsaiGrowth}% now. It grew while you were away.`,
          ]);
        return r(Cassidy.greetings);
      case 'study':
        return r([
          'Shall we learn something today? I’ll be right here.',
          'A new word is a small door. Want to open one?',
          'Whenever you’re ready — no rush. The kettle’s warm.',
        ]);
      case 'world':
        if (snap.worldEchoes > 0)
          return r([
            `Places you've seen keep teaching you — ${snap.worldEchoes} echo${s(snap.worldEchoes)} now.`,
            'The valley’s holding a secret it learned from you.',
          ]);
        return r(['Every corner here has a story. Shall we wander?', 'I love it out here with you.']);
      case 'journey':
        if (snap.souvenirs > 1)
          return `You've gathered ${snap.souvenirs} souvenirs. Each one is a real day we shared.`;
        return r(['This is your path — it only grows when you walk it.', 'Look how far your footsteps reach.']);
      case 'museum':
        if (snap.threads > 0)
          return `I tied your moments into ${snap.threads} memory thread${s(snap.threads)}. They’re yours to revisit.`;
        return r(['These are your memories, kept safe.', 'Everything here actually happened to you.']);
      case 'characters':
        return r(['These are the friends of the valley.', 'Ren at the café still asks about you, you know.']);
      case 'settings':
        return r(['Need anything? I’ll be right here.', 'Tweak away — I’m not going anywhere.']);
      case 'cassidy':
        return Cassidy.lineFor('warm');
      default:
        return Cassidy.randomLine();
    }
  },
};
