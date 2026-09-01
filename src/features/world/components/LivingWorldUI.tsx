import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleProp, View, ViewStyle } from 'react-native';

export type LivingWorldVisualState = {
  time?: 'morning' | 'day' | 'evening' | 'night' | string;
  weather?: 'clear' | 'mist' | 'rain' | 'wind' | string;
  activity?: 'quiet' | 'normal' | 'busy' | 'festival' | string;
  intensity?: number;
};

type LayerProps = { children?: ReactNode; style?: StyleProp<ViewStyle>; pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only' };

export function LivingWorldCanvas({ children, style }: LayerProps) {
  return <View style={[{ flex: 1, overflow: 'hidden' }, style]}>{children}</View>;
}

export function LivingWorldLayer({ children, style, pointerEvents = 'none' }: LayerProps) {
  return <View pointerEvents={pointerEvents} style={[{ position: 'absolute', inset: 0 }, style]}>{children}</View>;
}

export function LivingWorldAtmosphere({ state, children }: { state?: LivingWorldVisualState; children?: ReactNode }) {
  const breathe = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const intensity = Math.max(0, Math.min(1, state?.intensity ?? (state?.activity === 'busy' ? 0.8 : 0.45)));

  useEffect(() => {
    const breathing = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(breathe, { toValue: 0, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    const drifting = Animated.loop(Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: 11000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(drift, { toValue: 0, duration: 11000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    breathing.start(); drifting.start();
    return () => { breathing.stop(); drifting.stop(); };
  }, [breathe, drift]);

  const lift = breathe.interpolate({ inputRange: [0, 1], outputRange: [0, -1 - intensity * 2] });
  const driftX = drift.interpolate({ inputRange: [0, 1], outputRange: [-30, 45] });
  const night = state?.time === 'night';
  const evening = state?.time === 'evening';
  const morning = state?.time === 'morning';

  return <LivingWorldLayer>
    <Animated.View style={{ flex: 1, transform: [{ translateY: lift }] }}>
      <View style={{ flex: 1, backgroundColor: night ? 'rgba(12,18,48,0.30)' : evening ? 'rgba(91,48,24,0.14)' : morning ? 'rgba(78,145,177,0.08)' : 'transparent' }} />
    </Animated.View>
    {state?.weather === 'mist' && <Animated.View style={{ position: 'absolute', left: '-20%', top: '32%', width: '140%', height: 110, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', transform: [{ translateX: driftX }] }} />}
    {state?.weather === 'rain' && <LivingRain intensity={intensity} drift={drift} />}
    {state?.weather === 'wind' && <LivingWind intensity={intensity} drift={drift} />}
    {night && <LivingStars />}
    {children}
  </LivingWorldLayer>;
}

export function LivingRain({ intensity = 0.5, drift }: { intensity?: number; drift?: Animated.Value }) {
  const value = drift ?? new Animated.Value(0);
  const count = Math.round(14 + intensity * 18);
  return <LivingWorldLayer style={{ overflow: 'hidden' }}>{Array.from({ length: count }, (_, i) => (
    <Animated.View key={i} style={{ position: 'absolute', left: `${(i * 37) % 103}%`, top: -100, width: 1, height: 55 + (i % 5) * 18, opacity: 0.12 + (i % 4) * 0.035, backgroundColor: '#d9f4ff', transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, 260 + i * 5] }) }, { rotate: '-16deg' }] }} />
  ))}</LivingWorldLayer>;
}

export function LivingWind({ intensity = 0.5, drift }: { intensity?: number; drift?: Animated.Value }) {
  const value = drift ?? new Animated.Value(0);
  return <LivingWorldLayer>
    {Array.from({ length: 4 }, (_, i) => <Animated.View key={i} style={{ position: 'absolute', left: `${-15 + i * 22}%`, top: `${40 + i * 8}%`, width: '48%', height: 1, opacity: 0.05 + intensity * 0.08, backgroundColor: '#dff8ed', transform: [{ translateX: value.interpolate({ inputRange: [0, 1], outputRange: [-40 - i * 10, 80 + intensity * 50] }) }] }} />)}
  </LivingWorldLayer>;
}

export function LivingStars() {
  return <LivingWorldLayer>{Array.from({ length: 20 }, (_, i) => <View key={i} style={{ position: 'absolute', left: `${(i * 31 + 9) % 96}%`, top: `${(i * 17 + 4) % 48}%`, width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2, borderRadius: 4, backgroundColor: '#fff', opacity: 0.16 + (i % 3) * 0.1 }} />)}</LivingWorldLayer>;
}

export function LivingWorldSignal({ label, onPress, accent = '#6ee7b7' }: { label: string; onPress?: () => void; accent?: string }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 1500, useNativeDriver: true, isInteraction: false }),
    ])); loop.start(); return () => loop.stop();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const content = <Animated.View style={{ transform: [{ scale }] }} className="flex-row items-center rounded-full border border-white/10 bg-slate-950/70 px-3 py-2">
    <View style={{ width: 7, height: 7, borderRadius: 5, backgroundColor: accent, marginRight: 8 }} />
    <Animated.Text className="text-[11px] font-semibold text-white">{label}</Animated.Text>
  </Animated.View>;
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

export function LivingWorldHud({ children }: { children?: ReactNode }) {
  return <View pointerEvents="box-none" className="absolute inset-0 z-[100]">{children}</View>;
}
