import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { BookOpen, Compass, Gift, GitBranch, Sparkles } from 'lucide-react-native';

export type DiscoveryKind = 'echo' | 'thread' | 'souvenir' | 'story' | 'decision';

export interface DiscoveryTrace {
  id: string;
  kind: DiscoveryKind;
  title: string;
  detail: string;
  progress?: number;
  fresh?: boolean;
}

interface Props {
  traces: DiscoveryTrace[];
  onOpen: (trace: DiscoveryTrace) => void;
  onWander?: () => void;
}

const META: Record<DiscoveryKind, { label: string; Icon: typeof Sparkles }> = {
  echo: { label: 'Echo', Icon: Sparkles },
  thread: { label: 'Thread', Icon: GitBranch },
  souvenir: { label: 'Souvenir', Icon: Gift },
  story: { label: 'Story', Icon: BookOpen },
  decision: { label: 'Decision', Icon: Compass },
};

function Node({ trace, index, onPress }: { trace: DiscoveryTrace; index: number; onPress: () => void }) {
  const breathe = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(index * 180),
      Animated.timing(breathe, { toValue: 1, duration: 1800 + index * 90, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 0, duration: 1800 + index * 90, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [breathe, index]);
  const { Icon, label } = META[trace.kind];
  return (
    <Pressable onPress={onPress} className="mr-3 w-52 rounded-3xl border border-white/10 bg-slate-900/55 p-4 active:bg-slate-800/80">
      <View className="flex-row items-center justify-between">
        <Animated.View style={{ transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }} className="h-9 w-9 items-center justify-center rounded-full bg-emerald-300/10">
          <Icon size={17} color="#a7f3d0" />
        </Animated.View>
        {trace.fresh && <View className="rounded-full bg-amber-300/15 px-2 py-1"><Text className="text-[9px] font-bold uppercase tracking-wider text-amber-200">New</Text></View>}
      </View>
      <Text className="mt-4 text-[9px] font-semibold uppercase tracking-[2px] text-emerald-300/70">{label}</Text>
      <Text className="mt-1 text-base font-medium text-white" numberOfLines={2}>{trace.title}</Text>
      <Text className="mt-2 text-xs leading-5 text-slate-400" numberOfLines={2}>{trace.detail}</Text>
      {trace.progress !== undefined && <View className="mt-3 h-1 overflow-hidden rounded-full bg-white/5"><View style={{ width: `${Math.max(0, Math.min(100, trace.progress))}%` }} className="h-full rounded-full bg-emerald-300/60" /></View>}
    </Pressable>
  );
}

export function DiscoveryConstellation({ traces, onOpen, onWander }: Props) {
  const [active, setActive] = useState<DiscoveryTrace | null>(null);
  const intro = useRef(new Animated.Value(0)).current;
  const visible = useMemo(() => traces.filter(Boolean).slice(0, 8), [traces]);

  useEffect(() => {
    Animated.timing(intro, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [intro, visible.length]);

  if (visible.length === 0) {
    return <View className="rounded-3xl border border-white/10 bg-slate-900/35 p-5"><Text className="text-xs font-semibold uppercase tracking-[2px] text-emerald-300/70">Your constellation</Text><Text className="mt-2 text-sm leading-6 text-slate-400">Keep wandering. The world will leave traces behind when something becomes meaningful.</Text>{onWander && <Pressable onPress={onWander} className="mt-4 self-start rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2"><Text className="text-xs font-semibold text-emerald-100">Go discover</Text></Pressable>}</View>;
  }

  return <Animated.View style={{ opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
    <View className="mb-3 flex-row items-end justify-between"><View><Text className="text-[10px] font-semibold uppercase tracking-[2px] text-emerald-300/70">Your constellation</Text><Text className="mt-1 text-xl font-light text-white">Things worth remembering</Text></View>{onWander && <Pressable onPress={onWander}><Text className="text-xs text-slate-400">Wander →</Text></Pressable>}</View>
    <View className="flex-row"><View className="absolute left-6 right-6 top-12 h-px bg-emerald-200/10" />{visible.map((trace, index) => <Node key={trace.id} trace={trace} index={index} onPress={() => { setActive(trace); onOpen(trace); }} />)}</View>
    {active && <View className="mt-3 rounded-2xl border border-emerald-300/10 bg-emerald-300/5 p-4"><Text className="text-xs font-semibold text-emerald-200">{META[active.kind].label}</Text><Text className="mt-1 text-base text-white">{active.title}</Text><Text className="mt-1 text-xs leading-5 text-slate-400">{active.detail}</Text></View>}
  </Animated.View>;
}
