import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { WaveStore, LivingObject } from '../lib/waveStore';

/** A small ambient glimpse of persistent world life — not a dashboard. */
export function LivingWorldPulse() {
  const [objects, setObjects] = useState<LivingObject[]>([]);
  const opacity = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const next = await WaveStore.getLivingObjects();
      if (alive) setObjects(next);
    };
    void load();
    const timer = setInterval(() => void load(), 6000);
    Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.delay(4200),
      Animated.timing(opacity, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.delay(1800),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(drift, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
    return () => { alive = false; clearInterval(timer); };
  }, [drift, opacity]);

  const bonsai = objects.find((o) => o.id === 'living-bonsai');
  const radio = objects.find((o) => o.id === 'living-radio');
  if (!bonsai && !radio) return null;

  return (
    <Animated.View pointerEvents="none" style={{ opacity, transform: [{ translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] }} className="absolute left-4 top-12 z-40 max-w-[240px]">
      <View className="rounded-2xl border border-emerald-400/15 bg-slate-950/55 px-3 py-2 shadow-lg">
        <View className="flex-row items-center">
          <Text className="text-sm">🌿</Text>
          <Text className="ml-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-emerald-300">The world remembers</Text>
        </View>
        {bonsai && <Text className="mt-1 text-[10px] leading-4 text-slate-300">Your bonsai is quietly growing · {bonsai.growth}%</Text>}
        {radio?.memory?.[radio.memory.length - 1] && <Text className="mt-0.5 text-[9px] italic leading-3 text-slate-500">{radio.memory[radio.memory.length - 1]}</Text>}
      </View>
    </Animated.View>
  );
}
