import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

// Slow, breathing ambient light behind every screen. Pure core Animated —
// no worklets, no babel plugin required, cannot crash the bundle.
// `intensity` (0..1) makes the world glow brighter the more the learner
// has lived in it.
export function AmbientBackground({ intensity = 0.5 }: { intensity?: number }) {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;
  const c = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mk = (dur: number, value: Animated.Value) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
    const anims = [mk(16000, a), mk(21000, b), mk(19000, c)];
    anims.forEach((x) => x.start());
    return () => anims.forEach((x) => x.stop());
  }, [a, b, c]);

  const aX = a.interpolate({ inputRange: [0, 1], outputRange: [-40, 40] });
  const aY = a.interpolate({ inputRange: [0, 1], outputRange: [-30, 50] });
  const bX = b.interpolate({ inputRange: [0, 1], outputRange: [40, -30] });
  const bY = b.interpolate({ inputRange: [0, 1], outputRange: [20, -40] });
  const cX = c.interpolate({ inputRange: [0, 1], outputRange: [-20, 30] });
  const cY = c.interpolate({ inputRange: [0, 1], outputRange: [30, -20] });

  return (
    <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
      <Animated.View
        style={{ transform: [{ translateX: aX }, { translateY: aY }], opacity: intensity }}
        className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-emerald-700/20"
      />
      <Animated.View
        style={{ transform: [{ translateX: bX }, { translateY: bY }], opacity: Math.min(1, intensity * 0.8) }}
        className="absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-indigo-700/15"
      />
      <Animated.View
        style={{ transform: [{ translateX: cX }, { translateY: cY }], opacity: Math.min(1, intensity * 0.6) }}
        className="absolute bottom-[-120px] left-1/3 h-80 w-80 rounded-full bg-teal-700/10"
      />
    </View>
  );
}
