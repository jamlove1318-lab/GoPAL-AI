import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { EnvironmentEngine } from '../../../engines/world/environmentEngine';
import type { Season, TimeOfDay } from '../../../lib/types';

export type WorldAtmospherePhase = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';
export type WorldWeatherMood = 'clear' | 'cloudy' | 'rain' | 'mist' | 'snow';
export type WorldLocationMood = 'study' | 'cafe' | 'library' | 'market' | 'garden' | 'unknown';
interface WorldAtmosphereProps { phase?: WorldAtmospherePhase; weather?: WorldWeatherMood; location?: WorldLocationMood; intensity?: number; season?: Season; timeOfDay?: TimeOfDay; }
const phaseOpacity: Record<WorldAtmospherePhase, number> = { dawn: 0.12, morning: 0.05, afternoon: 0, dusk: 0.13, night: 0.22 };
const locationOpacity: Record<WorldLocationMood, number> = { study: 0.08, cafe: 0.06, library: 0.04, market: 0.10, garden: 0.07, unknown: 0.03 };
const locationShift: Record<WorldLocationMood, number> = { study: -8, cafe: 10, library: -18, market: 22, garden: -2, unknown: 0 };
const seasonOpacity: Record<Season, number> = { spring: 0.035, summer: 0.015, autumn: 0.065, winter: 0.09 };
const seasonClass: Record<Season, string> = { spring: 'bg-emerald-200/20', summer: 'bg-amber-200/10', autumn: 'bg-orange-200/15', winter: 'bg-sky-200/15' };
const phaseForTime = (time: TimeOfDay): WorldAtmospherePhase => time === 'evening' ? 'dusk' : time;
const weatherMood = (weather: string): WorldWeatherMood => weather === 'snow' ? 'snow' : weather === 'rain' || weather === 'light-rain' ? 'rain' : weather === 'breeze' || weather === 'windy' ? 'cloudy' : 'clear';

/** Quiet visual atmosphere: the canonical environment is the fallback; callers may override only what they own. */
export function WorldAtmosphere({ phase, weather, location = 'unknown', intensity = 1, season, timeOfDay }: WorldAtmosphereProps) {
  const drift = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const environment = useMemo(() => new EnvironmentEngine().resolve(), []);
  const resolvedSeason = season ?? environment.season;
  const resolvedPhase = phase ?? phaseForTime(timeOfDay ?? environment.timeOfDay);
  const resolvedWeather = weather ?? weatherMood(environment.weather);

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

  const base = Math.min(0.34, Math.max(0, (phaseOpacity[resolvedPhase] + locationOpacity[location] + seasonOpacity[resolvedSeason]) * intensity));
  const weatherOpacity = resolvedWeather === 'mist' ? 0.12 : resolvedWeather === 'rain' ? 0.08 : resolvedWeather === 'cloudy' ? 0.04 : resolvedWeather === 'snow' ? 0.06 : 0;
  const opacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [base * 0.78, base] });
  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [locationShift[location] - 18, locationShift[location] + 18] });
  const secondaryX = Animated.multiply(translateX, 0.6);
  return <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
    <Animated.View style={{ opacity, transform: [{ translateX }] }} className={`absolute -left-20 -top-16 h-56 w-[140%] rounded-full ${seasonClass[resolvedSeason]}`} />
    {weatherOpacity > 0 && <Animated.View style={{ opacity: weatherOpacity * intensity, transform: [{ translateX: secondaryX }] }} className="absolute -left-16 top-24 h-48 w-[130%] rounded-full bg-slate-200/10" />}
  </View>;
}
