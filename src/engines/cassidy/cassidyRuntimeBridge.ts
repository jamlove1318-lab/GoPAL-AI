import { auth } from '../../services/auth';
import { eventBus } from '../events/eventBus';
import { worldPresenceEngine } from '../world/worldPresenceEngine';
import { restoreCassidySession, enterCassidyWorld, returnCassidyHome, noteCassidyInteraction } from './cassidyRuntimeSessionEngine';

let stopBridge: (() => void) | null = null;

export function startCassidyRuntimeBridge(): () => void {
  if (stopBridge) return stopBridge;
  let active = true;
  let userId = 'local-explorer-user';
  const restore = async (id: string) => { userId = id || 'local-explorer-user'; await restoreCassidySession(userId); };
  const authSubscription = auth.onAuthStateChange((user) => { void restore(user?.id ?? 'local-explorer-user'); });
  const offLocation = eventBus.on('world:locationChanged', (payload) => {
    if (!active || payload.userId !== userId) return;
    const presence = worldPresenceEngine.current();
    void enterCassidyWorld(userId, presence.worldId, presence.kind === 'journey' ? presence.placeId : undefined, payload.locationId);
  });
  const offReturn = eventBus.on('world:returned', (payload) => {
    if (!active || payload.userId !== userId) return;
    void returnCassidyHome(userId);
  });
  const offConversation = eventBus.on('conversation:completed', (payload) => {
    if (!active || payload.userId !== userId) return;
    void noteCassidyInteraction(userId, { worldId: worldPresenceEngine.current().worldId });
  });
  void restore(userId);
  stopBridge = () => {
    active = false;
    authSubscription.data.subscription.unsubscribe();
    offLocation();
    offReturn();
    offConversation();
    stopBridge = null;
  };
  return stopBridge;
}

export const cassidyRuntimeBridge = { start: startCassidyRuntimeBridge };
