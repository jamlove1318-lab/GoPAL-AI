export interface AppEventMap {
  'learning:sessionCompleted': { sessionId: string; accuracy: number; activityType: string };
  'quest:completed': { questId: string; userId: string };
  'story:progressed': { storyId: string; node: string; userId: string };
  'achievement:earned': { achievementId: string; userId: string; context?: Record<string, unknown> };
  'location:unlocked': { locationId: string; userId: string };
  'world:locationChanged': { locationId: string; userId: string; previousLocationId?: string };
  'conversation:completed': { conversationId: string; userId: string };
  'discovery:made': { discoveryId: string; type: string; ref: string; userId: string };
  'world:eventStarted': { eventId: string; worldId: string };
  'world:returned': { userId: string; lastActiveAt: string };
  'memory:recorded': { memoryId: string; layer: string; userId: string };
}

export type AppEventName = keyof AppEventMap;
export type AppEventPayload<K extends AppEventName> = AppEventMap[K];

export type EventProducer = 'world' | 'learning' | 'quest' | 'story' | 'character' | 'journey' | 'discovery' | 'system';