import { eventBus } from '../events/eventBus';
import { WaveStore } from '../../lib/waveStore';
import { startCassidyRuntimeBridge } from '../cassidy/cassidyRuntimeBridge';

let started = false;
const processedEvents = new Set<string>();
const MAX_PROCESSED_EVENTS = 200;

function acceptOnce(key: string): boolean {
  if (processedEvents.has(key)) return false;
  processedEvents.add(key);
  if (processedEvents.size > MAX_PROCESSED_EVENTS) {
    const oldest = processedEvents.values().next().value as string | undefined;
    if (oldest) processedEvents.delete(oldest);
  }
  return true;
}

/**
 * Turns meaningful learner events into small, persistent changes in the world.
 * Kept outside React so the world can react even when no specific screen owns it.
 *
 * Reactions are deliberately contextual: the world records what happened instead
 * of treating every event as an identical generic "tick".
 */
export function startLivingWorldReactor(): () => void {
  if (started) return () => undefined;
  started = true;
  const stopCassidy = startCassidyRuntimeBridge();

  const react = async (eventKey: string, objectId: string, note: string) => {
    if (!acceptOnce(eventKey)) return;
    try {
      await WaveStore.tickLivingObject(objectId, note);
    } catch (error) {
      console.warn('[LivingWorldReactor] unable to update living object', error);
    }
  };

  const offLearning = eventBus.on('learning:sessionCompleted', (payload) => {
    const concepts = payload.demonstratedConcepts?.slice(0, 3).join(', ');
    const mastery = payload.masteryChanges ? Object.keys(payload.masteryChanges).slice(0, 3).join(', ') : '';
    const details = [
      `${payload.activityType} learning session`,
      concepts ? `focused on ${concepts}` : '',
      mastery ? `and deepened ${mastery}` : '',
      typeof payload.xpGained === 'number' ? `(+${Math.max(0, payload.xpGained)} XP)` : '',
    ].filter(Boolean).join(' ');
    void react(`learning:${payload.sessionId}`, 'living-bonsai', `Grew after the learner completed a ${details}.`);
  });

  const offDiscovery = eventBus.on('discovery:made', (payload) =>
    void react(`discovery:${payload.discoveryId}`, 'living-bonsai', `Stirred when the learner discovered ${payload.type}: ${payload.ref}.`),
  );
  const offReturn = eventBus.on('world:returned', (payload) =>
    void react(`return:${payload.userId}:${payload.lastActiveAt}`, 'living-radio', 'Welcomed the learner home again after time away.'),
  );
  const offConversation = eventBus.on('conversation:completed', (payload) =>
    void react(`conversation:${payload.conversationId}`, 'living-radio', `Remembered conversation ${payload.conversationId} from the journey.`),
  );
  const offAchievement = eventBus.on('achievement:earned', (payload) =>
    void react(`achievement:${payload.achievementId}`, 'living-bonsai', `Grew after the learner earned achievement ${payload.achievementId}.`),
  );
  const offQuest = eventBus.on('quest:completed', (payload) =>
    void react(`quest:${payload.questId}`, 'living-bonsai', `Grew after quest ${payload.questId} was completed.`),
  );
  const offStory = eventBus.on('story:progressed', (payload) =>
    void react(`story:${payload.storyId}:${payload.node}`, 'living-radio', `Recorded a story turning point at ${payload.node}.`),
  );
  const offLocationUnlocked = eventBus.on('location:unlocked', (payload) =>
    void react(`location-unlocked:${payload.locationId}`, 'living-bonsai', `Responded when ${payload.locationId} became part of the learner's world.`),
  );
  const offTravel = eventBus.on('world:locationChanged', (payload) => {
    if (payload.locationId === payload.previousLocationId) return;
    void react(`travel:${payload.userId}:${payload.previousLocationId ?? 'start'}:${payload.locationId}`, 'living-radio', `Recorded the learner's journey to ${payload.locationId}.`);
  });
  const offWorldEvent = eventBus.on('world:eventStarted', (payload) =>
    void react(`world-event:${payload.eventId}`, 'living-radio', `Noticed world event ${payload.eventId} beginning in ${payload.worldId}.`),
  );
  const offMemory = eventBus.on('memory:recorded', (payload) =>
    void react(`memory:${payload.memoryId}`, 'living-radio', `Held onto a new ${payload.layer} memory from the learner's journey.`),
  );

  return () => {
    stopCassidy();
    offLearning();
    offDiscovery();
    offReturn();
    offConversation();
    offAchievement();
    offQuest();
    offStory();
    offLocationUnlocked();
    offTravel();
    offWorldEvent();
    offMemory();
    processedEvents.clear();
    started = false;
  };
}