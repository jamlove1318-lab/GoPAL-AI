import { useEffect, useState, useCallback } from 'react';
import { CharacterEngine } from '../engines/character/characterEngine';
import type { CassidyView } from '../engines/character/characterEngine';
import { tutorEngine } from '../engines/tutor/tutorEngine';
import { auth } from '../services/auth';
import type { Mood } from '../lib/types';

const characterEngine = new CharacterEngine();
const RELATIONSHIP_INTERACTION_GAIN = 1;
const MAX_RELATIONSHIP_SCORE = 100;

export interface CassidyChatMessage {
  id: string;
  sender: 'user' | 'cassidy';
  text: string;
  timestamp: string;
}

export function useCassidy() {
  const [view, setView] = useState<CassidyView | null>(null);
  const [userId, setUserId] = useState<string>('local-explorer-user');
  const [messages, setMessages] = useState<CassidyChatMessage[]>([
    {
      id: 'init-1',
      sender: 'cassidy',
      text: '“Welcome back to our world! What shall we discover or practice together today?”',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const reload = useCallback(async (uid: string) => {
    const loaded = await characterEngine.loadCassidy(uid);
    setView(loaded);
  }, []);

  useEffect(() => {
    let active = true;
    const unsub = auth.onAuthStateChange(async (user) => {
      const uid = user ? user.id : 'local-explorer-user';
      setUserId(uid);
      const loaded = await characterEngine.loadCassidy(uid);
      if (active) setView(loaded);
    });
    return () => {
      active = false;
      unsub.data.subscription.unsubscribe();
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: CassidyChatMessage = {
        id: 'msg-' + Date.now(),
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);

      const mood = view?.state?.mood ?? 'curious';
      const cassidyReply = tutorEngine.generateCassidyResponse(text, mood);

      setTimeout(async () => {
        const replyMsg: CassidyChatMessage = {
          id: 'msg-' + (Date.now() + 1),
          sender: 'cassidy',
          text: cassidyReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, replyMsg]);

        // Keep the interaction reward explicit and bounded instead of scattering
        // relationship constants through the chat flow.
        if (view?.relationship) {
          const newTrust = Math.min(
            MAX_RELATIONSHIP_SCORE,
            (view.relationship.trust ?? 80) + RELATIONSHIP_INTERACTION_GAIN
          );
          const newFriendship = Math.min(
            MAX_RELATIONSHIP_SCORE,
            (view.relationship.friendship ?? 75) + RELATIONSHIP_INTERACTION_GAIN
          );
          await characterEngine.recordRelationship(userId, view.character?.id ?? 'char-cassidy', {
            trust: newTrust,
            friendship: newFriendship,
          });
          await reload(userId);
        }
      }, 500);
    },
    [view, userId, reload]
  );

  const updateMood = useCallback(
    async (newMood: Mood) => {
      if (!view?.character) return;
      await characterEngine.setMood(
        view.character.id,
        newMood,
        view.state?.energy ?? 85,
        view.state?.current_activity ?? null
      );
      await reload(userId);
    },
    [view, userId, reload]
  );

  return {
    view,
    characterEngine,
    messages,
    sendMessage,
    updateMood,
    refresh: () => reload(userId),
  };
}
