import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { Cassidy, CassidyMood } from '../characters/cassidy';
import { CassidyCharacter } from './CassidyCharacter';
import type { CassidySnapshot, Place } from '../characters/cassidyContext';

// Cassidy — a living person who follows you through the whole app and knows
// where you are and what you've done. Uses core RN Animated (no worklets) so
// it can never crash the bundle.
export function LivingCompanion({
  activeTab = 'home',
  snapshot,
  onTap,
}: {
  activeTab?: Place;
  snapshot?: CassidySnapshot | null;
  onTap?: () => void;
}) {
  const [line, setLine] = useState(Cassidy.pickGreeting());
  const [showBubble, setShowBubble] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [mood, setMood] = useState<CassidyMood>('warm');
  const float = useRef(new Animated.Value(0)).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Speak for the current place, grounded in what the learner has done.
  const sayHere = useCallback(() => {
    const m = Cassidy.moodFor(activeTab);
    setMood(m);
    setLine(snapshot ? Cassidy.placeLine(activeTab, snapshot) : Cassidy.lineFor(m));
    setShowBubble(true);
    setSpeaking(true);
    const t = setTimeout(() => setSpeaking(false), 2600);
    timers.current.push(t);
  }, [activeTab, snapshot]);

  // When you move, she notices and reacts.
  useEffect(() => {
    sayHere();
  }, [sayHere]);

  useEffect(() => {
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    floatAnim.start();

    // Every so often she shares a small thought — sometimes about the place,
    // sometimes just a friendly murmur.
    const id = setInterval(() => {
      setShowBubble(false);
      setSpeaking(false);
      const t = setTimeout(() => {
        if (snapshot && Math.random() < 0.4) {
          sayHere();
        } else {
          const m = Cassidy.moodFor(activeTab);
          setMood(m);
          setLine(Cassidy.lineFor(m));
          setShowBubble(true);
          setSpeaking(true);
          const t2 = setTimeout(() => setSpeaking(false), 2600);
          timers.current.push(t2);
        }
      }, 450);
      timers.current.push(t);
    }, 12000);

    return () => {
      floatAnim.stop();
      clearInterval(id);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [float, sayHere, activeTab, snapshot]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <View className="absolute bottom-[92px] right-2 z-50 items-end" pointerEvents="box-none">
      <Animated.View
        style={{ opacity: showBubble ? 1 : 0, transform: [{ translateY: showBubble ? 0 : 6 }] }}
        className="mb-1 max-w-[210px]"
      >
        <View className="rounded-2xl rounded-br-sm border border-emerald-500/30 bg-emerald-900/80 px-3 py-2">
          <Text className="text-[11px] italic text-emerald-100">{line}</Text>
        </View>
      </Animated.View>

      <Pressable onPress={onTap} className="active:opacity-80">
        <Animated.View style={{ transform: [{ translateY }] }}>
          <CassidyCharacter height={128} action="idle" speaking={speaking} expression={mood} />
        </Animated.View>
      </Pressable>
    </View>
  );
}
