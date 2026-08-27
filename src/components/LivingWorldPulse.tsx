import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { WaveStore, LivingObject } from '../lib/waveStore';
import { eventBus } from '../engines/events/eventBus';

/** Ambient glimpse of persistent world life — deliberately not a dashboard. */
export function LivingWorldPulse() {
  const [objects, setObjects] = useState<LivingObject[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const bloom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const next = await WaveStore.getLivingObjects();
      if (alive) setObjects(next);
    };
    void load();

    const showChange = (message: string) => {
      setNotice(message);
      Animated.sequence([
        Animated.timing(bloom, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.delay(2800),
        Animated.timing(bloom, { toValue: 0, duration: 650, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start();
      void load();
    };

    const offs = [
      eventBus.on('learning:sessionCompleted', () => showChange('Something in the study changed with you.')),
      eventBus.on('discovery:made', () => showChange('A new memory has taken root.')),
      eventBus.on('achievement:earned', () => showChange('The world noticed what you accomplished.')),
      eventBus.on('world:returned', () => showChange('The valley remembers your return.')),
      eventBus.on('conversation:completed', () => showChange('A conversation became part of the journey.')),
    ];

    const timer = setInterval(() => void load(), 10000);
    return () => { alive = false; clearInterval(timer); offs.forEach((off) => off()); };
  }, [bloom]);

  useEffect(() => {
    const entrance = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.delay(4200),
      Animated.timing(opacity, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.delay(1800),
    ]);
    const float = Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(drift, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]);
    const a = Animated.loop(entrance); const b = Animated.loop(float);
    a.start(); b.start();
    return () => { a.stop(); b.stop(); };
  }, [drift, opacity]);

  const bonsai = objects.find((o) => o.id === 'living-bonsai');
  const radio = objects.find((o) => o.id === 'living-radio');
  if (!bonsai && !radio) return null;

  const scale = bloom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });
  const eventOpacity = bloom.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 1] });

  return (
    <Animated.View pointerEvents="none" style={{ opacity, transform: [{ translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }, { scale }] }} className="absolute left-4 top-12 z-40 max-w-[255px]">
      <View className="rounded-2xl border border-emerald-400/15 bg-slate-950/60 px-3 py-2 shadow-lg">
        <View className="flex-row items-center">
          <Text className="text-sm">🌿</Text>
          <Text className="ml-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-emerald-300">The world remembers</Text>
          <Animated.Text style={{ opacity: eventOpacity }} className="ml-auto text-xs">✦</Animated.Text>
        </View>
        {notice ? (
          <Animated.Text style={{ opacity: eventOpacity }} className="mt-1 text-[10px] leading-4 text-emerald-100">{notice}</Animated.Text>
        ) : (
          <>
            {bonsai && <Text className="mt-1 text-[10px] leading-4 text-slate-300">Your bonsai is quietly growing · {bonsai.growth}%</Text>}
            {radio?.memory?.[radio.memory.length - 1] && <Text className="mt-0.5 text-[9px] italic leading-3 text-slate-500">{radio.memory[radio.memory.length - 1]}</Text>}
          </>
        )}
      </View>
    </Animated.View>
  );
}