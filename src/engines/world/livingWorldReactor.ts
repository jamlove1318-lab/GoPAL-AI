import { eventBus } from '../events/eventBus';
import { WaveStore } from '../../lib/waveStore';

let started = false;

/**
 * Turns important learner events into small, persistent changes in the world.
 * Kept outside React so the world can react even when no specific screen owns it.
 */
export function startLivingWorldReactor(): () => void {
  if (started) return () => undefined;
  started = true;

  const react = async (objectId: string, note: string) => {
    try {
      await WaveStore.tickLivingObject(objectId, note);
    } catch (error) {
      console.warn('[LivingWorldReactor] unable to update living object', error);
    }
  };

  const offLearning = eventBus.on('learning:sessionCompleted', ({ activityType }) =>
    void react('living-bonsai', `Grew after a ${activityType} learning session.`),
  );
  const offDiscovery = eventBus.on('discovery:made', () =>
    void react('living-bonsai', 'Stirred when a new discovery was found.'),
  );
  const offReturn = eventBus.on('world:returned', () =>
    void react('living-radio', 'Welcomed the learner home again.'),
  );
  const offConversation = eventBus.on('conversation:completed', () =>
    void react('living-radio', 'Remembered another conversation from the journey.'),
  );
  const offAchievement = eventBus.on('achievement:earned', () =>
    void react('living-bonsai', 'Grew after an achievement was earned.'),
  );

  return () => {
    offLearning();
    offDiscovery();
    offReturn();
    offConversation();
    offAchievement();
    started = false;
  };
}
