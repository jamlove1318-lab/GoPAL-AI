import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

export type WorldActivityKind = 'walker' | 'worker' | 'conversation' | 'spark' | 'bird';

export function LivingWorldActivityField({
  activity = 'normal',
  weather = 'clear',
  renderActor,
}: {
  activity?: 'quiet' | 'normal' | 'busy' | 'festival' | string;
  weather?: 'clear' | 'mist' | 'rain' | 'wind' | string;
  renderActor?: (index: number, kind: WorldActivityKind) => ReactNode;
}) {
  const phase = useRef(new Animated.Value(0)).current;
  const count = activity === 'quiet' ? 3 : activity === 'busy' ? 8 : activity === 'festival' ? 11 : 5;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(phase, { toValue: 1, duration: weather === 'wind' ? 5000 : 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(phase, { toValue: 0, duration: weather === 'wind' ? 5000 : 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [phase, weather]);

  return <View pointerEvents="none" className="absolute inset-0">
    {Array.from({ length: count }, (_, index) => {
      const kind: WorldActivityKind = index % 4 === 0 ? 'walker' : index % 4 === 1 ? 'worker' : index % 4 === 2 ? 'conversation' : 'spark';
      const x = 8 + ((index * 17) % 82);
      const y = 48 + ((index * 11) % 35);
      const travel = phase.interpolate({ inputRange: [0, 1], outputRange: [index % 2 ? -10 : 8, index % 2 ? 18 : -14] });
      return <Animated.View key={index} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: [{ translateX: kind === 'walker' ? travel : 0 }], opacity: kind === 'spark' ? 0.55 : 1 }}>
        {renderActor?.(index, kind) ?? <ActivityGlyph kind={kind} />}
      </Animated.View>;
    })}
  </View>;
}

function ActivityGlyph({ kind }: { kind: WorldActivityKind }) {
  if (kind === 'spark') return <View style={{ width: 5, height: 5, borderRadius: 5, backgroundColor: '#fcd34d' }} />;
  if (kind === 'conversation') return <View className="h-2 w-5 rounded-full bg-sky-200/25" />;
  if (kind === 'worker') return <View className="h-7 w-4 rounded-t-full rounded-b-md bg-amber-100/20" />;
  return <View className="h-8 w-4 rounded-full bg-white/20" />;
}
