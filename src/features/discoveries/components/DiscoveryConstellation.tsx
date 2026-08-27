import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { BookMarked, CalendarHeart, Gift, GitBranch, Layers, ListMusic, Newspaper, Sparkles } from 'lucide-react-native';

type DiscoveryKey = 'echoes' | 'library' | 'traditions' | 'threads' | 'souvenirs' | 'playlists' | 'editorial' | 'story' | 'decisions';

interface DiscoveryConstellationProps {
  active: DiscoveryKey;
  onSelect: (key: DiscoveryKey) => void;
}

const NODES: Array<{ key: DiscoveryKey; label: string; hint: string; Icon: typeof Sparkles }> = [
  { key: 'echoes', label: 'Echoes', hint: 'Ideas returning in new places', Icon: Sparkles },
  { key: 'library', label: 'Library', hint: 'Things worth keeping', Icon: BookMarked },
  { key: 'traditions', label: 'Traditions', hint: 'Rituals becoming yours', Icon: CalendarHeart },
  { key: 'threads', label: 'Threads', hint: 'Memories that connect', Icon: GitBranch },
  { key: 'souvenirs', label: 'Souvenirs', hint: 'What learning leaves behind', Icon: Gift },
  { key: 'playlists', label: 'Playlists', hint: 'Ways to spend a moment', Icon: ListMusic },
  { key: 'editorial', label: 'Stories', hint: 'The world noticing things', Icon: Newspaper },
  { key: 'story', label: 'Places', hint: 'Stories layered into space', Icon: Layers },
  { key: 'decisions', label: 'Echoes of You', hint: 'Choices still resonating', Icon: GitBranch },
];

export function DiscoveryConstellation({ active, onSelect }: DiscoveryConstellationProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View className="mb-5 overflow-hidden rounded-[28px] border border-emerald-300/10 bg-slate-900/65 px-4 py-5">
      <Animated.View pointerEvents="none" style={{ opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [.15, .4] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [.94, 1.08] }) }] }} className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-14 -translate-y-14 rounded-full bg-emerald-300/10" />
      <View className="mb-4 items-center">
        <Text className="text-[10px] font-semibold uppercase tracking-[3px] text-emerald-300/70">Your constellation</Text>
        <Text className="mt-1 text-xl font-light text-white">Things your journey has left behind</Text>
        <Text className="mt-1 text-center text-xs leading-5 text-slate-500">Nothing here is a separate world. These are traces of what happened while you were living in it.</Text>
      </View>
      <View className="flex-row flex-wrap justify-center gap-2">
        {NODES.map(({ key, label, hint, Icon }) => {
          const selected = active === key;
          return (
            <Pressable key={key} onPress={() => onSelect(key)} className={`min-w-[29%] flex-1 rounded-2xl border px-3 py-3 ${selected ? 'border-emerald-300/30 bg-emerald-300/10' : 'border-white/5 bg-slate-950/35'}`}>
              <Icon size={16} color={selected ? '#a7f3d0' : '#64748b'} />
              <Text className={`mt-2 text-xs font-semibold ${selected ? 'text-emerald-100' : 'text-slate-300'}`}>{label}</Text>
              <Text numberOfLines={2} className="mt-1 text-[9px] leading-3 text-slate-600">{hint}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
