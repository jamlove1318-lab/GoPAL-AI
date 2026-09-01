import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { LivingCharacter, CharacterVisual } from './LivingCharacter';
import { LivingResident } from './LivingResidentLayer';

export type LivingWorldConversationMomentProps = {
  first: LivingResident;
  second: LivingResident;
  visible?: boolean;
  duration?: number;
  topic?: string;
};

export function LivingWorldConversationMoment({ first, second, visible = true, duration = 4200, topic = 'sharing a thought' }: LivingWorldConversationMomentProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const midpoint = useMemo(() => ({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }), [first.x, first.y, second.x, second.y]);

  useEffect(() => {
    if (!visible) { progress.setValue(0); return; }
    const sequence = Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true, isInteraction: false }),
      Animated.delay(Math.max(800, duration)),
      Animated.timing(progress, { toValue: 0, duration: 650, easing: Easing.in(Easing.cubic), useNativeDriver: true, isInteraction: false }),
    ]);
    const breathing = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    sequence.start(); breathing.start();
    return () => { sequence.stop(); breathing.stop(); };
  }, [duration, progress, pulse, visible]);

  if (!visible) return null;
  const opacity = progress;
  const bubbleScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });

  return <Animated.View pointerEvents="none" style={{ position: 'absolute', left: `${midpoint.x}%`, top: `${midpoint.y}%`, opacity, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
    <View className="-ml-16 -mt-16 items-center">
      <View className="mb-2 flex-row items-end">
        <LivingCharacter character={first.id as CharacterVisual} size={40} motion="talking" facing="right" />
        <View className="mx-1 h-1 w-5 rounded-full bg-white/20" />
        <LivingCharacter character={second.id as CharacterVisual} size={40} motion="talking" facing="left" />
      </View>
      <Animated.View style={{ transform: [{ scale: bubbleScale }] }} className="max-w-[180px] rounded-full border border-white/10 bg-slate-950/65 px-3 py-1.5">
        <Text className="text-center text-[9px] text-white/75">{first.name} and {second.name} are {topic}.</Text>
      </Animated.View>
    </View>
  </Animated.View>;
}
