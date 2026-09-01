import React, { ReactNode, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

export function LivingWorldSurface({ children, tone = 'glass', onPress }: { children?: ReactNode; tone?: 'glass' | 'dark' | 'soft' | 'glow'; onPress?: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const background = tone === 'dark' ? 'rgba(2,6,23,0.86)' : tone === 'soft' ? 'rgba(15,23,42,0.62)' : tone === 'glow' ? 'rgba(12,34,38,0.72)' : 'rgba(15,23,42,0.72)';
  const content = <Animated.View style={{ transform: [{ scale }], backgroundColor: background }} className="rounded-[28px] border border-white/10 p-4 shadow-2xl">{children}</Animated.View>;
  if (!onPress) return content;
  return <Pressable onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()} onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()} onPress={onPress}>{content}</Pressable>;
}

export function LivingWorldInteractionBubble({ title, detail, action, onPress, accent = '#6ee7b7' }: { title: string; detail?: string; action?: string; onPress?: () => void; accent?: string }) {
  return <LivingWorldSurface tone="dark" onPress={onPress}>
    <View className="flex-row items-start">
      <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: accent, marginTop: 5, marginRight: 10 }} />
      <View className="flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-[1.7px]" style={{ color: accent }}>{title}</Text>
        {detail && <Text className="mt-1 text-sm leading-5 text-slate-300">{detail}</Text>}
        {action && <Text className="mt-3 text-xs font-bold text-white">{action}  ›</Text>}
      </View>
    </View>
  </LivingWorldSurface>;
}
