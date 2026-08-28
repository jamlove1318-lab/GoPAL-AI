import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JourneyEngine, JourneyEntry } from '../../../engines/journey/journeyEngine';
import { auth } from '../../../services/auth';
import { LocalStore } from '../../../lib/localStore';
import { Sparkles, Compass, BookOpen, Heart, MapPin, Feather } from 'lucide-react-native';

const journeyEngine = new JourneyEngine();

function useFloat(duration = 4200) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [duration, value]);
  return value;
}

export function LivingJourneyScreen() {
  const [timeline, setTimeline] = useState<JourneyEntry[]>([]);
  const [milestones, setMilestones] = useState<string[]>([]);
  const [mastered, setMastered] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const float = useFloat();

  useEffect(() => {
    const unsub = auth.onAuthStateChange(async user => {
      const uid = user?.id ?? 'local-explorer-user';
      const book = await journeyEngine.buildBook(uid);
      setTimeline(book.timeline);
      setMilestones(book.milestones);
      const nodes = await LocalStore.getKnowledgeNodes();
      setMastered(nodes.filter(node => node.masteryLevel >= 70).length);
    });
    return () => unsub.data.subscription.unsubscribe();
  }, []);

  const visible = showAll ? timeline : timeline.slice(-7);

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="relative min-h-[820px] overflow-hidden px-5 pt-5">
          <View pointerEvents="none" className="absolute inset-0 bg-slate-950" />
          <Animated.View pointerEvents="none" style={{ opacity: float.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.42] }), transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [14, -14] }) }] }} className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-violet-500/15" />
          <Animated.View pointerEvents="none" style={{ opacity: float.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.28] }) }} className="absolute -left-20 top-80 h-80 w-80 rounded-full bg-emerald-400/10" />

          <View className="z-10">
            <View className="flex-row items-center gap-2"><Feather size={15} color="#a7f3d0" /><Text className="text-[10px] font-bold uppercase tracking-[2.5px] text-emerald-300">Your Living Journey</Text></View>
            <Text className="mt-2 text-[31px] font-black tracking-tight text-white">A story, not a checklist.</Text>
            <Text className="mt-2 max-w-[92%] text-sm leading-5 text-slate-400">Every place you visited, person you met, challenge you overcame, and discovery you made leaves a little light behind.</Text>
          </View>

          <View className="relative z-10 mt-8 h-[520px]">
            <View pointerEvents="none" className="absolute left-[50%] top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent" />
            {visible.map((entry, index) => {
              const left = index % 2 === 0;
              const y = 18 + index * 67;
              return <Animated.View key={entry.id || `${entry.at}-${index}`} style={{ top: y, opacity: float.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] }), transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [index % 2 ? 3 : -3, index % 2 ? -3 : 3] }) }] }} className={`absolute w-[46%] ${left ? 'left-0 items-end pr-4' : 'right-0 items-start pl-4'}`}>
                <View className="flex-row items-center gap-2"><Text className="max-w-[135px] text-right text-[11px] font-bold text-slate-200">{entry.label}</Text><View className="h-8 w-8 items-center justify-center rounded-full border border-emerald-300/30 bg-slate-950"><Sparkles size={13} color="#6ee7b7" /></View></View>
                <Text className="mt-1 text-[8px] text-slate-500">{new Date(entry.at).toLocaleDateString()}</Text>
              </Animated.View>;
            })}
            {visible.length === 0 && <View className="absolute inset-0 items-center justify-center"><Compass size={34} color="#475569" /><Text className="mt-3 text-sm text-slate-500">Your first light is waiting.</Text></View>}
          </View>

          <View className="z-10 mt-2 flex-row items-end justify-between">
            <View><Text className="text-[9px] font-bold uppercase tracking-[1.8px] text-slate-500">Growing knowledge</Text><View className="mt-2 flex-row items-center gap-2"><BookOpen size={17} color="#6ee7b7" /><Text className="text-xl font-black text-white">{mastered}</Text><Text className="text-xs text-slate-400">mastered concepts</Text></View></View>
            <View className="items-end"><Text className="text-[9px] font-bold uppercase tracking-[1.8px] text-slate-500">Memories</Text><View className="mt-2 flex-row items-center gap-2"><Heart size={15} color="#fda4af" /><Text className="text-xl font-black text-white">{timeline.length}</Text></View></View>
          </View>
        </View>

        <View className="mx-5 mt-1">
          {milestones.length > 0 && <View className="flex-row items-center gap-2"><View className="h-2 w-2 rounded-full bg-amber-300" /><Text className="text-xs font-semibold text-amber-200">{milestones[milestones.length - 1]}</Text></View>}
          {timeline.length > 7 && <Pressable onPress={() => setShowAll(v => !v)} className="mt-4 self-center flex-row items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 active:bg-white/10"><MapPin size={12} color="#94a3b8" /><Text className="text-[10px] font-bold text-slate-300">{showAll ? 'Let the newest moments breathe' : 'Reveal more of the story'}</Text></Pressable>}
          <Text className="mt-5 text-center text-[10px] italic text-slate-600">Your journey keeps changing while you live it.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
