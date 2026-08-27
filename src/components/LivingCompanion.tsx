import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { Cassidy, CassidyMood, CassidyAction } from '../characters/cassidy';
import { CassidyCharacter } from './CassidyCharacter';
import type { CassidySnapshot, Place } from '../characters/cassidyContext';
import { eventBus } from '../engines/events/eventBus';

export function LivingCompanion({ activeTab = 'home', snapshot, onTap }: { activeTab?: Place; snapshot?: CassidySnapshot | null; onTap?: () => void }) {
  const [line, setLine] = useState(Cassidy.pickGreeting());
  const [showBubble, setShowBubble] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [mood, setMood] = useState<CassidyMood>('warm');
  const [eventAction, setEventAction] = useState<CassidyAction | null>(null);
  const [reactionPulse, setReactionPulse] = useState(false);
  const float = useRef(new Animated.Value(0)).current;
  const entrance = useRef(new Animated.Value(0)).current;
  const tapPulse = useRef(new Animated.Value(0)).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastReactionAt = useRef(0);

  const speak = useCallback((nextLine: string, nextMood: CassidyMood, action: CassidyAction = 'talking') => {
    const now = Date.now();
    if (now - lastReactionAt.current < 1200) return;
    lastReactionAt.current = now;
    setMood(nextMood); setLine(nextLine); setShowBubble(true); setSpeaking(true); setEventAction(action); setReactionPulse(true);
    const timer = setTimeout(() => { setSpeaking(false); setEventAction(null); setReactionPulse(false); }, 2800);
    timers.current.push(timer);
  }, []);

  const sayHere = useCallback(() => {
    const m = Cassidy.moodFor(activeTab);
    setMood(m); setLine(snapshot ? Cassidy.placeLine(activeTab, snapshot) : Cassidy.lineFor(m)); setShowBubble(true); setSpeaking(true); setEventAction(null);
    const timer = setTimeout(() => setSpeaking(false), 2600);
    timers.current.push(timer);
  }, [activeTab, snapshot]);

  useEffect(() => { sayHere(); }, [sayHere]);

  useEffect(() => {
    const offLearning = eventBus.on('learning:sessionCompleted', ({ accuracy }) => speak(accuracy >= 0.85 ? Cassidy.lineFor('excited') : Cassidy.lineFor('happy'), accuracy >= 0.85 ? 'excited' : 'happy'));
    const offDiscovery = eventBus.on('discovery:made', () => speak('Wait — did you see that? That belongs in your story.', 'excited', 'walking'));
    const offLocation = eventBus.on('location:unlocked', () => speak('A new place just opened. Shall we see what is there?', 'excited', 'walking'));
    const offMemory = eventBus.on('memory:recorded', () => speak('I’ll remember this one with you.', 'warm'));
    const offReturn = eventBus.on('world:returned', () => speak('There you are. The valley is glad to have you back.', 'warm', 'waving'));
    const offQuest = eventBus.on('quest:completed', () => speak('You did it. I knew that thread would lead somewhere.', 'excited', 'waving'));
    const offStory = eventBus.on('story:progressed', () => speak('The story moved because you did. Keep following it.', 'warm', 'walking'));
    const offAchievement = eventBus.on('achievement:earned', () => speak('That is worth remembering.', 'excited', 'waving'));
    return () => { offLearning(); offDiscovery(); offLocation(); offMemory(); offReturn(); offQuest(); offStory(); offAchievement(); };
  }, [speak]);

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const enter = Animated.spring(entrance, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 7 });
    loop.start(); enter.start();
    const id = setInterval(() => {
      if (Date.now() - lastReactionAt.current < 3500) return;
      setShowBubble(false); setSpeaking(false);
      const t = setTimeout(() => {
        if (snapshot && Math.random() < 0.4) sayHere();
        else { const m = Cassidy.moodFor(activeTab); setMood(m); setLine(Cassidy.lineFor(m)); setShowBubble(true); setSpeaking(true); timers.current.push(setTimeout(() => setSpeaking(false), 2600)); }
      }, 450);
      timers.current.push(t);
    }, 12000);
    return () => { loop.stop(); clearInterval(id); timers.current.forEach(clearTimeout); timers.current = []; };
  }, [activeTab, entrance, float, sayHere, snapshot]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const entranceY = entrance.interpolate({ inputRange: [0, 1], outputRange: [26, 0] });
  const entranceScale = entrance.interpolate({ inputRange: [0, 1], outputRange: [.82, 1] });
  const defaultAction: CassidyAction = activeTab === 'world' || activeTab === 'journey' ? 'walking' : activeTab === 'home' ? 'waving' : speaking ? 'talking' : 'idle';
  const action = eventAction ?? defaultAction;

  const handleTap = () => {
    Animated.sequence([Animated.timing(tapPulse, { toValue: 1, duration: 100, useNativeDriver: true }), Animated.spring(tapPulse, { toValue: 0, useNativeDriver: true, speed: 30, bounciness: 9 })]).start();
    sayHere(); onTap?.();
  };

  return <View className="absolute bottom-[92px] right-2 z-50 items-end" pointerEvents="box-none">
    <Animated.View pointerEvents="none" style={{ opacity: showBubble ? 1 : 0, transform: [{ translateY: showBubble ? 0 : 6 }] }} className="mb-1 max-w-[210px]">
      <View className="rounded-2xl rounded-br-sm border border-emerald-500/30 bg-emerald-900/80 px-3 py-2 shadow-lg"><Text className="text-[11px] italic leading-4 text-emerald-100">{line}</Text></View>
    </Animated.View>
    <Pressable onPress={handleTap} className="active:opacity-90">
      <Animated.View style={{ transform: [{ translateY: Animated.add(translateY, entranceY) }, { scale: Animated.multiply(entranceScale, tapPulse.interpolate({ inputRange: [0, 1], outputRange: [1, .94] })) }] }}>
        <Animated.View style={{ opacity: reactionPulse ? 1 : .94 }}><CassidyCharacter height={128} action={action} speaking={speaking} expression={mood} /></Animated.View>
      </Animated.View>
    </Pressable>
  </View>;
}