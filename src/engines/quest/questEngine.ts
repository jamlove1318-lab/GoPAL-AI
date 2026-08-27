import { LocalStore } from '../../lib/localStore';
import { EconomyEngine } from '../economy/economyEngine';

export type QuestCategory =
  | 'daily'
  | 'cultural'
  | 'conversation'
  | 'exploration'
  | 'story'
  | 'personal';

export interface Quest {
  id: string;
  category: QuestCategory;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  rewardSparkles: number;
  rewardStamp?: string;
  locationKey?: string;
}

export const SEED_QUESTS: Quest[] = [
  {
    id: 'qst-1', category: 'daily', title: 'Morning Greetings',
    description: 'Greet Barista Ren or Wisdom Keeper Emi in an interactive dialogue scenario.',
    targetCount: 1, currentCount: 1, completed: true, rewardSparkles: 25, rewardStamp: '🍵 Komorebi Cup',
  },
  {
    id: 'qst-2', category: 'conversation', title: 'Natural Orders',
    description: 'Order a beverage at Café Komorebi and score 80%+ on conversational naturalness.',
    targetCount: 1, currentCount: 1, completed: true, rewardSparkles: 50, rewardStamp: '✨ Conversationalist',
  },
  {
    id: 'qst-3', category: 'cultural', title: 'The Whisk Mystery',
    description: 'Inspect the Artisan Bamboo Whisk (Chasen) and solve its Wonder Prompt.',
    targetCount: 1, currentCount: 0, completed: false, rewardSparkles: 40, rewardStamp: '🎋 Bamboo Master',
  },
  {
    id: 'qst-4', category: 'exploration', title: 'Emerald Valley Traveler',
    description: 'Travel to 3 different locations across the living world map.',
    targetCount: 3, currentCount: 2, completed: false, rewardSparkles: 60, rewardStamp: '🧭 Valley Explorer',
  },
  {
    id: 'qst-5', category: 'personal', title: 'Mindful Care',
    description: 'Water your Bonsai plant in the Sunlit Study room today.',
    targetCount: 1, currentCount: 1, completed: true, rewardSparkles: 20, rewardStamp: '🪴 Green Thumb',
  },
];

export class QuestEngine {
  static async getQuests(): Promise<Quest[]> {
    return LocalStore.get<Quest[]>('user_quests', SEED_QUESTS);
  }

  static async completeQuest(questId: string): Promise<Quest[]> {
    const quests = await this.getQuests();
    const target = quests.find((q) => q.id === questId);

    // Completion is idempotent: retries cannot create another quest event or reward.
    if (!target || target.completed) return quests;

    const updated = quests.map((q) =>
      q.id === questId ? { ...q, completed: true, currentCount: q.targetCount } : q
    );
    await LocalStore.set('user_quests', updated);

    // The quest engine owns the reward side effect. The durable claim key makes
    // reward delivery safe across remounts/restarts as well as repeated calls.
    await EconomyEngine.claimSparkles(
      `quest:${target.id}`,
      target.rewardSparkles,
      `Quest completion: ${target.title}`
    );

    await LocalStore.addJourneyEvent(
      'quest_completed',
      {
        questId: target.id,
        title: target.title,
        rewardSparkles: target.rewardSparkles,
      },
      'quest_engine'
    );

    return updated;
  }

  static async addPersonalChallenge(challenge: {
    title: string;
    description: string;
    targetCount: number;
    category: QuestCategory;
  }): Promise<Quest> {
    const quests = await this.getQuests();
    const newQuest: Quest = {
      id: 'qst-' + Date.now(),
      category: challenge.category,
      title: challenge.title,
      description: challenge.description,
      targetCount: challenge.targetCount,
      currentCount: 0,
      completed: false,
      rewardSparkles: 30,
      rewardStamp: '🌟 Self-Determined Goal',
    };
    await LocalStore.set('user_quests', [newQuest, ...quests]);
    return newQuest;
  }
}