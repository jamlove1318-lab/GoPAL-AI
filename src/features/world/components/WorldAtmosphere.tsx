import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

export type WorldAtmospherePhase = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';
export type WorldWeatherMood = 'clear' | 'cloudy' | 'rain' | 'mist' | 'snow';
export type WorldLocationMood = 'study' | 'cafe' | 'library' | 'market' | 'garden' | 'unknown';

interface WorldAtmosphereProps { phase: WorldAtmospherePhase; weather?: WorldWeatherMood; location?: WorldLocationMood; intensity?: number; }
const phaseOpacity: Record<WorldAtmospherePhase, number> = { dawn: 0.12, morning: 0.05, afternoon: 0, dusk: 0.13, night: 0.22 };
const locationOpacity: Record<WorldLocationMood, number> = { study: 0.08, cafe: 0.06, library: 0.04, market: 0.10, garden: 0.07, unknown: 0.03 };
const locationShift: Record<WorldLocationMood, number> = { study: -8, cafe: 10, library: -18, market: 22, garden: -2, unknown: 0 };

/** Quiet visual atmosphere: place, time and weather create depth without another UI panel. */
export function WorldAtmosphere({ phase, weather = 'clear', location = 'unknown', intensity = 1 }: WorldAtmosphereProps) {
  const drift = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const driftLoop = Animated.loop(Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(drift, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const breatheLoop = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 0, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    driftLoop.start(); breatheLoop.start();
    return () => { driftLoop.stop(); breatheLoop.stop(); };
  }, [drift, breathe]);
  const base = Math.min(0.30, Math.max(0, (phaseOpacity[phase] + locationOpacity[location]) * intensity));
  const weatherOpacity = weather === 'mist' ? 0.12 : weather === 'rain' ? 0.08 : weather === 'cloudy' ? 0.04 : weather === 'snow' ? 0.06 : 0;
  const opacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [base * 0.78, base] });
  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [locationShift[location] - 18, locationShift[location] + 18] });
  const secondaryX = Animated.multiply(translateX, 0.6);
  return <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
    <Animated.View style={{ opacity, transform: [{ translateX }] }} className="absolute -left-20 -top-16 h-56 w-[140%] rounded-full bg-indigo-200/20" />
    {weatherOpacity > 0 && <Animated.View style={{ opacity: weatherOpacity * intensity, transform: [{ translateX: secondaryX }] }} className="absolute -left-16 top-24 h-48 w-[130%] rounded-full bg-slate-200/10" />}
  </View>;
}
