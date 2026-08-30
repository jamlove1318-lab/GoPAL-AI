import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JourneyEngine, JourneyEntry } from '../../../engines/journey/journeyEngine';
import { auth } from '../../../services/auth';
import { LocalStore } from '../../../lib/localStore';
import { getLanguageWorlds, type LanguageWorld, type WorldPlace } from '../../../engines/world/languageWorldEngine';
import { Compass, Sparkles, BookOpen, Heart, MapPin, Feather, Plane } from 'lucide-react-native';

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

export function LivingJourneyScreen({ onTravel }: { onTravel?: (worldId: string, placeId: string) => Promise<void> | void }) {
  const [timeline, setTimeline] = useState<JourneyEntry[]>([]);
  const [milestones, setMilestones] = useState<string[]>([]);
  const [mastered, setMastered] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState('ja');
  const [travelling, setTravelling] = useState<string | null>(null);
  const float = useFloat();
  const worlds = getLanguageWorlds();
  const activeWorld = worlds.find(world => world.id === selectedWorld) ?? worlds[0];

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
  const beginJourney = async (world: LanguageWorld, place: WorldPlace) => {
    if (!onTravel || travelling) return;
    setTravelling(place.id);
    try { await onTravel(world.id, place.id); } finally { setTravelling(null); }
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="relative overflow-hidden px-5 pt-5">
          <View pointerEvents="none" className="absolute inset-0 bg-slate-950" />
          <Animated.View pointerEvents="none" style={{ opacity: float.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.42] }), transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [14, -14] }) }] }} className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-violet-500/15" />
          <Animated.View pointerEvents="none" style={{ opacity: float.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.28] }) }} className="absolute -left-20 top-80 h-80 w-80 rounded-full bg-emerald-400/10" />
          <View className="z-10">
            <View className="flex-row items-center gap-2"><Feather size={15} color="#a7f3d0" /><Text className="text-[10px] font-bold uppercase tracking-[2.5px] text-emerald-300">Your Living Journey</Text></View>
            <Text className="mt-2 text-[31px] font-black tracking-tight text-white">A story, not a checklist.</Text>
            <Text className="mt-2 max-w-[92%] text-sm leading-5 text-slate-400">Go somewhere real. Let the place create the reason to learn, then bring what you discover home.</Text>
          </View>

          <View className="z-10 mt-7 rounded-3xl border border-emerald-300/10 bg-slate-900/70 p-4">
            <View className="flex-row items-center gap-2"><Plane size={15} color="#6ee7b7" /><Text className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-300">Choose a living language world</Text></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 -mx-1" contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}>
              {worlds.map(world => <Pressable key={world.id} onPress={() => setSelectedWorld(world.id)} className={`rounded-2xl border px-4 py-2.5 ${selectedWorld === world.id ? 'border-emerald-300/40 bg-emerald-300/10' : 'border-white/10 bg-white/5'}`}>
                <Text className={`text-xs font-bold ${selectedWorld === world.id ? 'text-emerald-200' : 'text-slate-300'}`}>{world.worldName}</Text>
                <Text className="mt-0.5 text-[9px] text-slate-500">{world.languageName}</Text>
              </Pressable>)}
            </ScrollView>
            <Text className="mt-3 text-xs leading-5 text-slate-400">{activeWorld.regionLabel}. These are destinations to experience, not lesson labels.</Text>
            <View className="mt-3 gap-2">
              {activeWorld.places.map(place => <DestinationCard key={place.id} place={place} busy={travelling === place.id} onPress={() => beginJourney(activeWorld, place)} />)}
            </View>
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

function DestinationCard({ place, busy, onPress }: { place: WorldPlace; busy: boolean; onPress: () => void }) {
  return <Pressable disabled={busy} onPress={onPress} className="rounded-2xl border border-white/10 bg-white/5 p-3 active:bg-white/10">
    <View className="flex-row items-start justify-between"><View className="flex-1 pr-3"><Text className="text-base font-black text-white">{place.name}</Text><Text className="mt-0.5 text-[10px] text-slate-500">{place.city}, {place.country}</Text></View><View className="rounded-full bg-emerald-300/10 px-2 py-1"><Text className="text-[9px] font-bold text-emerald-300">{busy ? 'TRAVELLING…' : 'ENTER'}</Text></View></View>
    <Text className="mt-2 text-xs leading-5 text-slate-400">{place.purpose}</Text>
    <Text className="mt-2 text-[9px] uppercase tracking-[1.2px] text-slate-600">{place.landmarks.slice(0, 2).join(' · ')}</Text>
  </Pressable>;
}
