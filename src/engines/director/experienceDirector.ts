import { LocalStore, SessionBookmark } from '../../lib/localStore';
import { WaveStore, ExperiencePlaylist, ReturnSignature, EditorialMoment } from '../../lib/waveStore';
import { SCENARIOS } from '../tutor/tutorEngine';

export type ExperienceIntent =
  | 'focus'
  | 'adventure'
  | 'conversation'
  | 'relax'
  | 'challenge'
  | 'creative'
  | 'surprise_me';

export interface SessionPlanStep {
  label: string;
  actionType: 'dialogue' | 'study' | 'cultural' | 'creative' | 'reflection';
  scenarioKey?: string;
  locationKey?: string;
}

export interface ExperiencePlan {
  id: string;
  intent: ExperienceIntent;
  durationMinutes: number;
  title: string;
  subtitle: string;
  targetLocation: string;
  targetLocationName: string;
  reason: string; // "Why am I seeing this?"
  steps: SessionPlanStep[];
  scenarioKey?: string;
}

export interface TodayMoment {
  greeting: string;
  headline: string;
  subtext: string;
  primaryActionLabel: string;
  targetLocationKey: string;
  scenarioKey?: string;
  curatedTheme: string;
}

export class ExperienceDirector {
  /**
   * Generates today's primary curated moment based on time of day, world continuity, and Cassidy routine
   */
  static async getTodayPrimaryMoment(): Promise<TodayMoment> {
    const world = await LocalStore.getWorldState();
    const time = world.time_of_day;

    if (time === 'morning') {
      return {
        greeting: 'Good morning in Emerald Valley',
        headline: 'Morning Tea & Gentle Conversation',
        subtext: `Cassidy is at Café Komorebi. Ren has freshly roasted matcha and welcomes morning visitors.`,
        primaryActionLabel: 'Visit Café Komorebi',
        targetLocationKey: 'cozy_cafe',
        scenarioKey: 'scen-cafe-order',
        curatedTheme: 'emerald',
      };
    } else if (time === 'afternoon') {
      return {
        greeting: 'Afternoon in the Sunlit World',
        headline: 'Wisdom Scrolls & Ancient Trails',
        subtext: `Librarian Emi unrolled the historical folktale scrolls at The Whispering Library.`,
        primaryActionLabel: 'Explore the Library',
        targetLocationKey: 'whispering_library',
        scenarioKey: 'scen-library-inquiry',
        curatedTheme: 'indigo',
      };
    } else if (time === 'evening') {
      return {
        greeting: 'Twilight in Emerald Valley',
        headline: 'Lantern Night Market Stroll',
        subtext: `Paper lanterns glow warm across the stalls. Kenji is preparing street snacks and banter.`,
        primaryActionLabel: 'Stroll the Night Market',
        targetLocationKey: 'lantern_market',
        scenarioKey: 'scen-market-snack',
        curatedTheme: 'amber',
      };
    } else {
      return {
        greeting: 'Moonlit Quiet Hours',
        headline: 'Zen Reflection & Study',
        subtext: `The garden is calm under the silver moon. Perfect for a mindful review session with Cassidy.`,
        primaryActionLabel: 'Enter Study Room',
        targetLocationKey: 'study_room',
        curatedTheme: 'purple',
      };
    }
  }

  /**
   * Composes a bounded session plan based on learner intention and session length (Blueprint #21, #104, #156)
   */
  static async composeSession(
    intent: ExperienceIntent,
    durationMinutes: number = 5
  ): Promise<ExperiencePlan> {
    const effectiveIntent = intent === 'surprise_me' ? this.pickRandomIntent() : intent;

    switch (effectiveIntent) {
      case 'conversation':
        return {
          id: 'plan-' + Date.now(),
          intent: 'conversation',
          durationMinutes,
          title: 'Café Dialogue & Natural Banter',
          subtitle: 'Interactive roleplay with Barista Ren',
          targetLocation: 'cozy_cafe',
          targetLocationName: 'Café Komorebi',
          reason: 'Recommended because you have conversation practice prioritized in your learning goals.',
          steps: [
            { label: 'Greet Barista Ren politely', actionType: 'dialogue', scenarioKey: 'scen-cafe-order' },
            { label: 'Order your beverage and state preferences', actionType: 'dialogue', scenarioKey: 'scen-cafe-order' },
            { label: 'Review Cassidy feedback & new phrases', actionType: 'reflection' },
          ],
          scenarioKey: 'scen-cafe-order',
        };

      case 'adventure':
        return {
          id: 'plan-' + Date.now(),
          intent: 'adventure',
          durationMinutes,
          title: 'Night Market Flavor Hunt',
          subtitle: 'Bargain and order street delicacies from Vendor Kenji',
          targetLocation: 'lantern_market',
          targetLocationName: 'Lantern Night Market',
          reason: 'Recommended to build active listening and contextual vocabulary in a lively environment.',
          steps: [
            { label: 'Approach the Yakitori stall', actionType: 'dialogue', scenarioKey: 'scen-market-snack' },
            { label: 'Ask for recommendations and prices', actionType: 'dialogue', scenarioKey: 'scen-market-snack' },
            { label: 'Collect cultural postcard & notes', actionType: 'cultural' },
          ],
          scenarioKey: 'scen-market-snack',
        };

      case 'focus':
        return {
          id: 'plan-' + Date.now(),
          intent: 'focus',
          durationMinutes,
          title: 'Scroll Research & Grammar Focus',
          subtitle: 'Focused inquiry with Wisdom Keeper Emi',
          targetLocation: 'whispering_library',
          targetLocationName: 'The Whispering Library',
          reason: 'Recommended because structured study and reading mastery were chosen.',
          steps: [
            { label: 'Inquire about cultural scrolls', actionType: 'dialogue', scenarioKey: 'scen-library-inquiry' },
            { label: 'Study compound phrases with Cassidy hints', actionType: 'study' },
            { label: 'Add new terms to your personal Study Notebook', actionType: 'reflection' },
          ],
          scenarioKey: 'scen-library-inquiry',
        };

      case 'relax':
        return {
          id: 'plan-' + Date.now(),
          intent: 'relax',
          durationMinutes,
          title: 'Mindful Garden Stroll & Lo-Fi Ambience',
          subtitle: 'Quiet reflection with no pressure or test scoring',
          targetLocation: 'study_room',
          targetLocationName: 'The Sunlit Study',
          reason: 'Chosen for a tranquil, zero-pressure atmosphere to listen and absorb.',
          steps: [
            { label: 'Tend the Bonsai plant in the study', actionType: 'study' },
            { label: 'Tune the World Radio to River in Spring', actionType: 'cultural' },
            { label: 'Read Cassidy gentle daily observations', actionType: 'reflection' },
          ],
        };

      case 'creative':
        return {
          id: 'plan-' + Date.now(),
          intent: 'creative',
          durationMinutes,
          title: 'Creative Learning Studio Session',
          subtitle: 'Author a custom postcard or phrase card with Cassidy',
          targetLocation: 'study_room',
          targetLocationName: 'The Sunlit Study',
          reason: 'Active creation strengthens memory retention through personal expression.',
          steps: [
            { label: 'Choose learned vocabulary tokens', actionType: 'creative' },
            { label: 'Draft a short dialogue or postcard note', actionType: 'creative' },
            { label: 'Preserve into Memory Museum archive', actionType: 'reflection' },
          ],
        };

      case 'challenge':
      default:
        return {
          id: 'plan-' + Date.now(),
          intent: 'challenge',
          durationMinutes,
          title: 'Mastery Challenge: Independent Dialogue',
          subtitle: 'Complete a multi-turn conversation with minimal hints',
          targetLocation: 'cozy_cafe',
          targetLocationName: 'Café Komorebi',
          reason: 'Recommended based on your recent 90%+ vocabulary mastery to test independent recall.',
          steps: [
            { label: 'Initiate independent dialogue', actionType: 'dialogue', scenarioKey: 'scen-cafe-order' },
            { label: 'Respond naturally to follow-up questions', actionType: 'dialogue', scenarioKey: 'scen-cafe-order' },
            { label: 'Log milestone into Journey Book', actionType: 'reflection' },
          ],
          scenarioKey: 'scen-cafe-order',
        };
    }
  }

  private static pickRandomIntent(): ExperienceIntent {
    const pool: ExperienceIntent[] = ['conversation', 'adventure', 'focus', 'relax', 'creative'];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Retrieves current active continuity bookmark if session was interrupted (Wave 4F, 4K)
   */
  static async getContinuityCard(): Promise<SessionBookmark | null> {
    return LocalStore.getSessionBookmark();
  }

  /* ------------------------------------------------------------
   * Wave 4G: EXPERIENCE PLAYLISTS
   * Experiences can be composed, not only selected one by one.
   * ------------------------------------------------------------ */
  static async getPlaylists(): Promise<ExperiencePlaylist[]> {
    return WaveStore.getPlaylists();
  }

  static async createPlaylist(title: string, steps: ExperiencePlaylist['steps']): Promise<ExperiencePlaylist[]> {
    return WaveStore.addPlaylist({ title, userCreated: true, steps });
  }

  /* ------------------------------------------------------------
   * Wave 4V: RETURN SIGNATURE
   * Adaptive arrival based on explicit preferences + interaction history.
   * ------------------------------------------------------------ */
  static async getReturnSignature(): Promise<ReturnSignature> {
    return WaveStore.getReturnSignature();
  }

  static async recordReturn(mode: ReturnSignature['lastMode']): Promise<ReturnSignature> {
    return WaveStore.recordReturn(mode);
  }

  /**
   * Decides the arrival emphasis from the Return Signature without making
   * hidden psychological claims. Bounded, explainable, reversible.
   */
  static async resolveArrivalMode(): Promise<'resume' | 'explore' | 'calm' | 'study'> {
    const sig = await this.getReturnSignature();
    if (sig.samples === 0) return 'study';
    if (sig.prefersResumeFirst) return 'resume';
    if (sig.prefersExploreFirst) return 'explore';
    if (sig.prefersCalmReturn) return 'calm';
    return sig.lastMode;
  }

  /* ------------------------------------------------------------
   * Wave 4H: WORLD EDITORIAL MOMENTS
   * Curated collections assembled from verified content (not an algo feed).
   * ------------------------------------------------------------ */
  static async getEditorialMoments(): Promise<EditorialMoment[]> {
    return WaveStore.getEditorialMoments();
  }

  // Wave 3: Recursive Self-Model — GoPAL reflects on its own behavior toward the learner.
  static async selfModelReflection(): Promise<string> {
    const sig = await WaveStore.getReturnSignature();
    const decisions = await WaveStore.getDecisions();
    const threads = await WaveStore.getThreads();
    const echoes = await WaveStore.getLearningEchoes();
    const bits: string[] = [];
    if (sig.samples > 0) bits.push(`You've returned ${sig.samples} time(s) and lately lean toward "${sig.lastMode}".`);
    if (decisions.length) bits.push(`I've watched ${decisions.length} of your decisions echo back.`);
    if (threads.length) bits.push(`I've tied your moments into ${threads.length} memory thread(s).`);
    if (echoes.length) bits.push(`I quietly re-show ${echoes.length} concept(s) you've learned.`);
    return bits.length
      ? "How I've been helping: " + bits.join(' ')
      : "I'm still learning how best to help you.";
  }

  /* ------------------------------------------------------------
   * Wave 5L: WORLD CONCIERGE BEHAVIOR
   * Cassidy offers choices; never commands. Learner retains agency.
   * ------------------------------------------------------------ */
  static conciergePrompt(): { question: string; options: string[] } {
    return {
      question: 'Want something familiar, or something new?',
      options: [
        'Something familiar',
        'Surprise me with something new',
        'I have 5 minutes',
        'I have more time today',
      ],
    };
  }

  /* ------------------------------------------------------------
   * Wave 5U: EXPERIENCE RHYTHM CONTRACT
   * Longer experiences model rhythm: orient -> explore -> focus ->
   * challenge -> release -> reflect. Composed by the Experience Layer.
   * ------------------------------------------------------------ */
  static readonly RHYTHM_PHASES = [
    'orient',
    'explore',
    'focus',
    'challenge',
    'release',
    'reflect',
  ] as const;

  static rhythmSequence(intent: ExperienceIntent): string[] {
    if (intent === 'relax') return ['orient', 'explore', 'release', 'reflect'];
    if (intent === 'creative') return ['orient', 'focus', 'release', 'reflect'];
    if (intent === 'surprise_me') return ['orient', 'explore', 'challenge', 'reflect'];
    return ['orient', 'explore', 'focus', 'challenge', 'release', 'reflect'];
  }

  /* ------------------------------------------------------------
   * Wave 5J: SESSION LANDINGS
   * A session ends with a satisfying, skippable landing.
   * ------------------------------------------------------------ */
  static sessionLanding(plan: ExperiencePlan, completedSteps: number): {
    headline: string;
    bullets: string[];
  } {
    const pct = plan.steps.length ? Math.round((completedSteps / plan.steps.length) * 100) : 0;
    return {
      headline: completedSteps > 0 ? 'A small part of your world changed.' : 'You can simply close the app.',
      bullets: [
        `${completedSteps} of ${plan.steps.length} steps explored (${pct}%).`,
        'That phrase will appear again in the world.',
        'Cassidy saved something for next time.',
      ],
    };
  }
}
