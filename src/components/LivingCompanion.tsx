import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { Cassidy, CassidyMood } from '../characters/cassidy';
import { CassidyCharacter } from './CassidyCharacter';
import type { CassidySnapshot, Place } from '../characters/cassidyContext';

// Cassidy is a living companion, not a floating button. She follows the
// learner through the experience, reacts to place/context, and occasionally
// surfaces a small thought without interrupting the learner.
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
  const entrance = useRef(new Animated.Value(0)).current;
  const tapPulse = useRef(new Animated.Value(0)).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sayHere = useCallback(() => {
    const m = Cassidy.moodFor(activeTab);
    setMood(m);
    setLine(snapshot ? Cassidy.placeLine(activeTab, snapshot) : Cassidy.lineFor(m));
    setShowBubble(true);
    setSpeaking(true);
    const t = setTimeout(() => setSpeaking(false), 2600);
    timers.current.push(t);
  }, [activeTab, snapshot]);

  useEffect(() => {
    sayHere();
  }, [sayHere]);

  useEffect(() => {
    const floatAnim = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const enterAnim = Animated.spring(entrance, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 7 });
    floatAnim.start();
    enterAnim.start();

    const id = setInterval(() => {
      setShowBubble(false);
      setSpeaking(false);
      const t = setTimeout(() => {
        if (snapshot && Math.random() < 0.4) sayHere();
        else {
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
  }, [activeTab, entrance, float, sayHere, snapshot]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const entranceY = entrance.interpolate({ inputRange: [0, 1], outputRange: [26, 0] });
  const entranceScale = entrance.interpolate({ inputRange: [0, 1], outputRange: [.82, 1] });

  const handleTap = () => {
    Animated.sequence([
      Animated.timing(tapPulse, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.spring(tapPulse, { toValue: 0, useNativeDriver: true, speed: 30, bounciness: 9 }),
    ]).start();
    sayHere();
    onTap?.();
  };

  return (
    <View className="absolute bottom-[92px] right-2 z-50 items-end" pointerEvents="box-none">
      <Animated.View
        pointerEvents="none"
        style={{ opacity: showBubble ? 1 : 0, transform: [{ translateY: showBubble ? 0 : 6 }] }}
        className="mb-1 max-w-[210px]"
      >
        <View className="rounded-2xl rounded-br-sm border border-emerald-500/30 bg-emerald-900/80 px-3 py-2 shadow-lg">
          <Text className="text-[11px] italic leading-4 text-emerald-100">{line}</Text>
        </View>
      </Animated.View>

      <Pressable onPress={handleTap} className="active:opacity-90">
        <Animated.View style={{ transform: [{ translateY: Animated.add(translateY, entranceY) }, { scale: Animated.multiply(entranceScale, tapPulse.interpolate({ inputRange: [0, 1], outputRange: [1, .94] })) }] }}>
          <CassidyCharacter height={128} action="idle" speaking={speaking} expression={mood} />
        </Animated.View>
      </Pressable>
    </View>
  );
}
