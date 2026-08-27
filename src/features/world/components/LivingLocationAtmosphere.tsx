import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

/** Ambient motion for a location: deliberately subtle so the map feels inhabited, not noisy. */
export function LivingLocationAtmosphere({ active = false, kind = 'default' }: { active?: boolean; kind?: string }) {
  const breathe = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: active ? 2200 : 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: active ? 2200 : 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const shimmering = Animated.loop(
      Animated.sequence([
        Animated.delay(active ? 300 : 900),
        Animated.timing(glow, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    breathing.start();
    shimmering.start();
    return () => { breathing.stop(); shimmering.stop(); };
  }, [active, breathe, glow]);

  const lift = breathe.interpolate({ inputRange: [0, 1], outputRange: [0, active ? -2 : -1] });
  const opacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.12, active ? 0.34 : 0.2] });

  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', inset: 0, transform: [{ translateY: lift }] }}>
      <Animated.View
        style={{ opacity, borderRadius: 18, flex: 1 }}
        className={`border ${active ? 'border-emerald-400/30' : 'border-slate-500/10'}`}
      />
      {kind === 'cafe' && <View pointerEvents="none" className="absolute right-5 top-3 h-1.5 w-1.5 rounded-full bg-amber-300/30" />}
      {kind === 'garden' && <View pointerEvents="none" className="absolute left-7 top-4 h-1 w-1 rounded-full bg-emerald-300/25" />}
      {kind === 'market' && <View pointerEvents="none" className="absolute right-9 bottom-4 h-1.5 w-1.5 rounded-full bg-orange-300/25" />}
    </Animated.View>
  );
}
