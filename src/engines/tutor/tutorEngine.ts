import { LocalStore, ReviewStory } from '../../lib/localStore';
import { WaveStore, DecisionEcho } from '../../lib/waveStore';
import type { Mood } from '../../lib/types';
import type { ExperienceIntent } from '../director/experienceDirector';

export interface DialogueEvaluation {
  isCorrect: boolean;
  score: number; // 0 to 100
  feedback: string;
  cassidyHint?: string;
  culturalInsight?: string;
  suggestedFollowUp?: string;
}

export interface ConversationTurn {
  id: string;
  speaker: 'cassidy' | 'npc' | 'user';
  speakerName: string;
  text: string;
  phonetic?: string;
  translation?: string;
  timestamp: string;
}

export interface ScenarioStep {
  npcPrompt: string;
  npcPhonetic?: string;
  npcTranslation?: string;
  expectedConcepts: string[];
  sampleResponses: { text: string; translation: string }[];
  hint: string;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  locationKey: string;
  locationName: string;
  characterName: string;
  characterRole: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: ScenarioStep[];
}

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'scen-cafe-order',
    title: 'Morning Matcha at Café Komorebi',
    locationKey: 'cozy_cafe',
    locationName: 'Café Komorebi',
    characterName: 'Ren',
    characterRole: 'Friendly Barista',
    difficulty: 'beginner',
    steps: [
      {
        npcPrompt: 'いらっしゃいませ！ご注文はお決まりですか？',
        npcPhonetic: 'Irasshaimase! Gochuumon wa okimari desu ka?',
        npcTranslation: 'Welcome! Have you decided on your order?',
        expectedConcepts: ['kudasai', 'onegai', 'matcha', 'coffee'],
        sampleResponses: [
          { text: 'ホット抹茶ラテをこれをください。', translation: 'Hot matcha latte, this one please.' },
          { text: 'アイスコーヒーをひとつお願いします。', translation: 'One iced coffee, please.' },
        ],
        hint: 'Use "... o kudasai" (please give me ...) to order politely!',
      },
      {
        npcPrompt: 'かしこまりました。店内でお召し上がりですか？',
        npcPhonetic: 'Kashikomarimashita. Tennai de omeshiagari desu ka?',
        npcTranslation: 'Certainly. Will you be having that in-store?',
        expectedConcepts: ['tennai', 'hai', 'koko', 'takeout'],
        sampleResponses: [
          { text: 'はい、ここで食べます。', translation: 'Yes, I will eat/drink here.' },
          { text: '持ち帰りでお願いします。', translation: 'Take-out, please.' },
        ],
        hint: 'Say "Hai, koko de" (Yes, here) or "Mochikaeri" (take-out).',
      },
      {
        npcPrompt: 'お待たせしました！どうぞ、ごゆっくり。',
        npcPhonetic: 'Omatase shimashita! Douzo, goyukkuri.',
        npcTranslation: 'Thank you for waiting! Here you are, please take your time.',
        expectedConcepts: ['arigatou', 'arigatou gozaimasu', 'domo'],
        sampleResponses: [
          { text: 'ありがとうございます！いただきます。', translation: 'Thank you very much! (I gratefully receive this).' },
        ],
        hint: 'Express your gratitude with "Arigatou gozaimasu".',
      },
    ],
  },
  {
    id: 'scen-library-inquiry',
    title: 'Finding Cultural Folktales in the Library',
    locationKey: 'whispering_library',
    locationName: 'The Whispering Library',
    characterName: 'Emi',
    characterRole: 'Wise Librarian',
    difficulty: 'beginner',
    steps: [
      {
        npcPrompt: 'こんにちは。何かお探しの本はありますか？',
        npcPhonetic: 'Konnichiwa. Nanika osagashi no hon wa arimasu ka?',
        npcTranslation: 'Hello. Are you looking for any particular book?',
        expectedConcepts: ['mukashibanashi', 'hon', 'arimasu ka', 'kyoto'],
        sampleResponses: [
          { text: '日本の昔話の本はありますか？', translation: 'Do you have books on Japanese folktales?' },
          { text: '京都の歴史の本を探しています。', translation: 'I am searching for books on Kyoto history.' },
        ],
        hint: 'Ask "... wa arimasu ka?" (Do you have ...?)',
      },
      {
        npcPrompt: 'こちらの棚にありますよ。とても美しい木漏れ日の挿絵が入っています。',
        npcPhonetic: 'Kochira no tana ni arimasu yo. Totemo utsukushii komorebi no sashie ga haitte imasu.',
        npcTranslation: 'They are right on this shelf. It has very beautiful illustrations of komorebi (sunlight through leaves).',
        expectedConcepts: ['arigatou', 'sugoi', 'utsukushii', 'yomimasu'],
        sampleResponses: [
          { text: 'わあ、綺麗ですね！読んでみます。', translation: 'Wow, it is beautiful! I will read it.' },
          { text: 'ありがとうございます、探していました！', translation: 'Thank you, this is what I was looking for!' },
        ],
        hint: 'Praise the illustration or express excitement to read it!',
      },
    ],
  },
  {
    id: 'scen-lantern-market',
    title: 'Evening Stroll in Lantern Night Market',
    locationKey: 'lantern_market',
    locationName: 'Lantern Night Market',
    characterName: 'Kenji',
    characterRole: 'Friendly Vendor',
    difficulty: 'intermediate',
    steps: [
      {
        npcPrompt: 'いらっしゃい！焼きたてのお団子はいかが？',
        npcPhonetic: 'Irasshai! Yakitate no odango wa ikaga?',
        npcTranslation: 'Welcome! How about some freshly grilled dango?',
        expectedConcepts: ['ikura', 'kudasai', 'hitotsu', 'dango'],
        sampleResponses: [
          { text: '美味しそう！これ、ひとついくらですか？', translation: 'Looks delicious! How much is one of these?' },
          { text: 'お団子をふたつください！', translation: 'Two dango, please!' },
        ],
        hint: 'Ask the price with "... wa ikura desu ka?" (How much is ...?)',
      },
    ],
  },
];

export class TutorEngine {
  /**
   * Evaluates user response in a conversational context
   */
  evaluateInput(userInput: string, step: ScenarioStep): DialogueEvaluation {
    const clean = userInput.trim().toLowerCase();

    if (!clean) {
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Give it a try! You can tap a sample phrase or type your own response.',
        cassidyHint: step.hint,
      };
    }

    // Check if any sample match or expected concept is present
    const matchedSample = step.sampleResponses.find(
      (s) =>
        s.text.toLowerCase().includes(clean) ||
        clean.includes(s.text.toLowerCase()) ||
        s.translation.toLowerCase().includes(clean)
    );

    const matchesExpectedConcept = step.expectedConcepts.some((c) =>
      clean.includes(c.toLowerCase())
    );

    if (matchedSample || matchesExpectedConcept) {
      return {
        isCorrect: true,
        score: 95,
        feedback: 'Wonderful natural phrasing! You communicated the exact intent clearly.',
        cassidyHint: '“Spot on! That sounded like a natural local.”',
        culturalInsight:
          'Using polite speech in shops and public locations is warmly received and shows cultural respect.',
      };
    }

    // Fallback encouraging score
    return {
      isCorrect: true,
      score: 80,
      feedback: 'Good attempt! Notice how native speakers also use: ' + step.sampleResponses[0].text,
      cassidyHint: step.hint,
    };
  }

  /**
   * Interprets natural language experience request ("World DJ")
   */
  interpretExperienceRequest(query: string): {
    mode: 'calm' | 'explore' | 'practice' | 'review' | 'story';
    recommendation: string;
    targetLocationKey: string;
    estimatedMinutes: number;
  } {
    const q = query.toLowerCase();

    if (q.includes('calm') || q.includes('relax') || q.includes('peace') || q.includes('quiet')) {
      return {
        mode: 'calm',
        recommendation: 'A tranquil 5-minute study session in the Sunlit Study with ambient rain soundscape.',
        targetLocationKey: 'study_room',
        estimatedMinutes: 5,
      };
    }

    if (q.includes('order') || q.includes('cafe') || q.includes('coffee') || q.includes('matcha')) {
      return {
        mode: 'practice',
        recommendation: 'Practice ordering drinks and snacks with Barista Ren at Café Komorebi.',
        targetLocationKey: 'cozy_cafe',
        estimatedMinutes: 4,
      };
    }

    if (q.includes('explore') || q.includes('new') || q.includes('market') || q.includes('night')) {
      return {
        mode: 'explore',
        recommendation: 'Step into the Lantern Night Market and discover evening greetings and vendor interactions.',
        targetLocationKey: 'lantern_market',
        estimatedMinutes: 6,
      };
    }

    if (q.includes('story') || q.includes('book') || q.includes('library')) {
      return {
        mode: 'story',
        recommendation: 'Read an illustrated micro-story with Librarian Emi in the Whispering Library.',
        targetLocationKey: 'whispering_library',
        estimatedMinutes: 5,
      };
    }

    return {
      mode: 'review',
      recommendation: 'Personalized review of your key vocabulary and idioms with Cassidy.',
      targetLocationKey: 'study_room',
      estimatedMinutes: 3,
    };
  }

  /**
   * Generates a smart Cassidy conversational response
   */
  generateCassidyResponse(userMessage: string, mood: Mood): string {
    const lower = userMessage.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return '“Hey there! I was just organizing our study notes. What would you like to explore today?”';
    }

    if (lower.includes('stuck') || lower.includes('help') || lower.includes('hard')) {
      return '“No worries at all! Learning a language is like tending a bonsai tree—one leaf at a time. Let’s break it into smaller steps.”';
    }

    if (lower.includes('tea') || lower.includes('matcha') || lower.includes('coffee')) {
      return '“Ah, nothing beats a warm drink while learning! Ren at Café Komorebi makes the best matcha in the valley.”';
    }

    if (lower.includes('how are you') || lower.includes('how do you feel')) {
      return `“I feel ${mood} and ready to learn with you! The living world is peaceful today.”`;
    }

    return '“I love how curious you are. Every word you practice makes our living world grow richer!”';
  }

  /* ------------------------------------------------------------
   * Wave 5R: THINK TOGETHER CHALLENGES
   * Cassidy is a collaborative thinking partner with explicit hint levels,
   * not an answer generator. Assistance level is recorded separately from
   * mastery evidence (protects Facts vs Interpretations).
   * ------------------------------------------------------------ */
  static HINT_LEVELS = ['observation', 'hint', 'strong_hint', 'explanation', 'full_solution'] as const;

  static hintForLevel(step: ScenarioStep, level: (typeof TutorEngine.HINT_LEVELS)[number]): string {
    switch (level) {
      case 'observation':
        return `Notice the situation: ${step.npcPrompt}`;
      case 'hint':
        return step.hint;
      case 'strong_hint':
        return `Build on the hint — try “${step.sampleResponses[0].text}” as a model.`;
      case 'explanation':
        return `Why this works: ${step.npcTranslation} is answered politely using “... o kudasai”.`;
      case 'full_solution':
        return `One natural answer: ${step.sampleResponses[0].text} (${step.sampleResponses[0].translation})`;
    }
  }

  /* ------------------------------------------------------------
   * Wave 5Q: DECISION ECHOES
   * A meaningful choice is acknowledged later by future content.
   * ------------------------------------------------------------ */
  async recordDecision(decision: string): Promise<DecisionEcho[]> {
    return WaveStore.recordDecision(decision);
  }

  async getDecisions(): Promise<DecisionEcho[]> {
    return WaveStore.getDecisions();
  }

  async acknowledgeDecision(id: string, reference: string): Promise<DecisionEcho[]> {
    return WaveStore.acknowledgeDecision(id, reference);
  }

  /* ------------------------------------------------------------
   * Wave 3R: ADAPTIVE SESSION COACH
   * Suggest (never trap) based on observable signals.
   * ------------------------------------------------------------ */
  static coachSuggestion(opts: {
    recentAccuracy: number;
    unfinishedCount: number;
    availableMinutes?: number;
  }): { suggestion: string; recommendedIntent: ExperienceIntent } {
    if (opts.recentAccuracy < 60) {
      return { suggestion: 'Let’s slow down with a calm review before trying again.', recommendedIntent: 'relax' };
    }
    if (opts.unfinishedCount > 0) {
      return { suggestion: 'You have an unfinished thread — want to pick it up?', recommendedIntent: 'conversation' };
    }
    if ((opts.availableMinutes ?? 5) <= 5) {
      return { suggestion: 'A five-minute flash is perfect right now.', recommendedIntent: 'focus' };
    }
    return { suggestion: 'You’re in a good rhythm — try a small adventure.', recommendedIntent: 'adventure' };
  }
}

export const tutorEngine = new TutorEngine();
