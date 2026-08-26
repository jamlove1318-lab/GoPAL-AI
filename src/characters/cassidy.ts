// The Cassidy part — who she is, how she talks, how she moves.
// This is the character's "soul" data: personality, expressions, voice.
// The visual rig lives in components/CassidyCharacter.tsx; this module
// decides *what* she says and *how* she feels, so the whole app can ask
// "Cassidy, what would you say right now?" and get her voice back.

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
};
