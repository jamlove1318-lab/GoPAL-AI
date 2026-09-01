import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';

export type LivingActorMotion = 'idle' | 'walking' | 'working' | 'talking' | 'sitting' | 'celebrating';

export function LivingActor({
  children,
  x = 50,
  y = 50,
  motion = 'idle',
  onPress,
  label,
}: {
  children?: ReactNode;
  x?: number;
  y?: number;
  motion?: LivingActorMotion;
  onPress?: () => void;
  label?: string;
}) {
  const bob = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = motion === 'walking' ? 520 : motion === 'working' ? 760 : 1800;
    const amount = motion === 'celebrating' ? -5 : motion === 'walking' ? -3 : -1.5;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(bob, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    const swayLoop = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: duration * 1.6, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(sway, { toValue: 0, duration: duration * 1.6, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    loop.start(); swayLoop.start();
    return () => { loop.stop(); swayLoop.stop(); };
  }, [bob, sway, motion]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, amountFor(motion)] });
  const rotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '1.5deg'] });
  const content = <Animated.View style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: [{ translateY }, { rotate }], alignItems: 'center' }}>
    {label && <View className="mb-1 rounded-full border border-white/10 bg-slate-950/60 px-2 py-1"><Text className="text-[9px] text-slate-300">{label}</Text></View>}
    {children ?? <View className="h-8 w-6 rounded-full bg-white/20" />}
  </Animated.View>;
  return onPress ? <Pressable onPress={onPress} hitSlop={12}>{content}</Pressable> : content;
}

export function LivingAmbientActorField({ count = 5, renderActor }: { count?: number; renderActor?: (index: number) => ReactNode }) {
  return <View pointerEvents="none" className="absolute inset-0">{Array.from({ length: count }, (_, index) => (
    <LivingActor key={index} x={12 + ((index * 19) % 76)} y={46 + ((index * 13) % 38)} motion={index % 3 === 0 ? 'walking' : index % 3 === 1 ? 'working' : 'idle'}>
      {renderActor?.(index) ?? <View className="h-6 w-4 rounded-full bg-slate-200/20" />}
    </LivingActor>
  ))}</View>;
}

function amountFor(motion: LivingActorMotion) {
  switch (motion) {
    case 'walking': return -3.5;
    case 'working': return -2;
    case 'talking': return -1;
    case 'celebrating': return -6;
    default: return -1.2;
  }
}
