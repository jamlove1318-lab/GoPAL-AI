import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

export type LivingWorldMomentKind = 'conversation' | 'notice' | 'weather' | 'discovery' | 'activity';

export type LivingWorldAmbientMoment = {
  id: string;
  kind: LivingWorldMomentKind;
  x: number;
  y: number;
  text: string;
  duration?: number;
};

const MOMENTS: LivingWorldAmbientMoment[] = [
  { id: 'ren-emi-chat', kind: 'conversation', x: 43, y: 54, text: 'Ren and Emi are sharing a story.', duration: 5200 },
  { id: 'market-call', kind: 'activity', x: 72, y: 62, text: 'Someone is opening the market.', duration: 4600 },
  { id: 'garden-breeze', kind: 'weather', x: 31, y: 69, text: 'The garden moves with the breeze.', duration: 4300 },
  { id: 'library-discovery', kind: 'discovery', x: 67, y: 23, text: 'A book has been left open nearby.', duration: 5000 },
  { id: 'learner-noticed', kind: 'notice', x: 52, y: 45, text: 'Someone notices you passing by.', duration: 3800 },
];

function pickMoment(seed: number, weather: string, activity: string) {
  const weatherBias = weather === 'rain' || weather === 'mist' ? 2 : 0;
  const activityBias = activity === 'festival' || activity === 'busy' ? 1 : 0;
  return MOMENTS[(seed + weatherBias + activityBias) % MOMENTS.length];
}

export function LivingWorldAmbientMoments({
  timeKey,
  weather = 'clear',
  activity = 'normal',
  enabled = true,
  seed = 0,
}: {
  timeKey: string;
  weather?: string;
  activity?: string;
  enabled?: boolean;
  seed?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(6)).current;
  const moment = useMemo(() => pickMoment(seed + timeKey.length, weather, activity), [seed, timeKey, weather, activity]);

  useEffect(() => {
    if (!enabled) {
      opacity.setValue(0);
      return;
    }
    opacity.setValue(0);
    rise.setValue(6);
    const animation = Animated.sequence([
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true, isInteraction: false }),
        Animated.timing(rise, { toValue: 0, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true, isInteraction: false }),
      ]),
      Animated.delay(Math.max(1200, moment.duration ?? 4200)),
      Animated.timing(opacity, { toValue: 0, duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true, isInteraction: false }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [enabled, moment.duration, opacity, rise, timeKey]);

  if (!enabled) return null;

  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: `${moment.x}%`, top: `${moment.y}%`, opacity, transform: [{ translateY: rise }] }}>
      <View className="max-w-[190px] rounded-full border border-white/10 bg-slate-950/55 px-3 py-1.5">
        <Text className="text-[9px] font-medium text-white/75">{moment.text}</Text>
      </View>
    </Animated.View>
  );
}
