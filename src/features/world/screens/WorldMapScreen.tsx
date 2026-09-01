import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass, Eye, Heart, Sparkles, Sun, Moon, CloudRain, MapPin } from 'lucide-react-native';
import { useWorldState } from '../../../hooks/useWorldState';
import { LocalStore, CulturalArtifact, RevisitRecord } from '../../../lib/localStore';
import { WaveStore, LivingObject } from '../../../lib/waveStore';
import { worldRevisitStore } from '../../../engines/world/worldRevisitStore';
import { eventBus } from '../../../engines/events/eventBus';
import { WonderPromptModal } from '../../learning/components/WonderPromptModal';
import { WorldThresholdModal } from '../components/WorldThresholdModal';
import { EmaRitualModal } from '../components/EmaRitualModal';

interface WorldMapScreenProps { onStartScenario?: (scenarioKey: string) => void; }
type PlaceMood = 'study' | 'cafe' | 'library' | 'market' | 'garden';
interface Place { id: string; key: string; name: string; npcName: string; npcRole: string; description: string; scenarioKey?: string; icon: string; mood: PlaceMood; x: number; y: number; color: string; }

const PLACES: Place[] = [
  { id: 'study-room', key: 'study_room', name: 'Sanctuary', npcName: 'Cassidy', npcRole: 'Companion', description: 'Your quiet home beneath the valley trees.', icon: '⌂', mood: 'study', x: 10, y: 61, color: 'emerald' },
  { id: 'cozy-cafe', key: 'cozy_cafe', name: 'Komorebi Café', npcName: 'Ren', npcRole: 'Barista', description: 'Warm lights, rain on glass, and conversations worth remembering.', scenarioKey: 'scen-cafe-order', icon: '☕', mood: 'cafe', x: 47, y: 34, color: 'amber' },
  { id: 'whispering-library', key: 'whispering_library', name: 'Whispering Library', npcName: 'Emi', npcRole: 'Historian', description: 'Old stories wait between the shelves.', scenarioKey: 'scen-library-inquiry', icon: '▤', mood: 'library', x: 72, y: 16, color: 'violet' },
  { id: 'lantern-market', key: 'lantern_market', name: 'Lantern Market', npcName: 'Kenji', npcRole: 'Stall Master', description: 'A lively evening street where every stall has a story.', scenarioKey: 'scen-market-browse', icon: '🏮', mood: 'market', x: 76, y: 65, color: 'rose' },
  { id: 'zen-garden', key: 'zen_garden', name: 'Whisper Garden', npcName: 'Master Jin', npcRole: 'Garden Keeper', description: 'Bamboo, stone, water, and room to think.', icon: '✦', mood: 'garden', x: 34, y: 78, color: 'sky' },
];

const colorClasses: Record<string, { glow: string; ring: string; text: string; dot: string }> = {
  emerald: { glow: 'bg-emerald-400/20', ring: 'border-emerald-300/50', text: 'text-emerald-200', dot: 'bg-emerald-300' },
  amber: { glow: 'bg-amber-300/20', ring: 'border-amber-300/50', text: 'text-amber-100', dot: 'bg-amber-300' },
  violet: { glow: 'bg-violet-300/20', ring: 'border-violet-300/50', text: 'text-violet-100', dot: 'bg-violet-300' },
  rose: { glow: 'bg-rose-300/20', ring: 'border-rose-300/50', text: 'text-rose-100', dot: 'bg-rose-300' },
  sky: { glow: 'bg-sky-300/20', ring: 'border-sky-300/50', text: 'text-sky-100', dot: 'bg-sky-300' },
};

function useBreath(duration: number = 3600) {
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

export function WorldMapScreen({ onStartScenario }: WorldMapScreenProps) {
  const { state, changeLocation, worldEngine, userId } = useWorldState();
  const [artifacts, setArtifacts] = useState<CulturalArtifact[]>([]);
  const [revisitStats, setRevisitStats] = useState<Record<string, RevisitRecord>>({});
  const [revisitNotes, setRevisitNotes] = useState<Record<string, string | null>>({});
  const [gatedByLoc, setGatedByLoc] = useState<Record<string, number>>({});
  const [living, setLiving] = useState<LivingObject[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<CulturalArtifact | null>(null);
  const [thresholdVisible, setThresholdVisible] = useState(false);
  const [showEmaModal, setShowEmaModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<Place | null>(null);
  const breath = useBreath();
  const slowBreath = useBreath(6200);

  const loadData = async () => {
    const nodes = await LocalStore.getKnowledgeNodes();
    const gated: Record<string, number> = {};
    for (const node of nodes) if (node.masteryLevel < 40) gated[node.locationKey] = (gated[node.locationKey] || 0) + 1;
    setGatedByLoc(gated);
    setArtifacts(await LocalStore.getCulturalArtifacts());
    setRevisitStats(await worldRevisitStore.getStats(userId));
    const notes: Record<string, string | null> = {};
    for (const place of PLACES) notes[place.key] = (await worldEngine.getRevisitDifference(place.key, userId)).note;
    setRevisitNotes(notes);
    setLiving(await WaveStore.getLivingObjects());
  };

  useEffect(() => {
    void loadData();
    return eventBus.on('world:returned', () => void loadData());
  }, [userId]);

  const growth = useMemo(() => Math.round(living.reduce((sum, object) => sum + object.growth, 0)), [living]);
  const currentPlace = PLACES.find(place => place.id === state?.location?.id) ?? PLACES[0];
  const currentWeather = String(state?.weather?.type ?? state?.weather ?? '').toLowerCase();
  const rainy = currentWeather.includes('rain');
  const night = (() => { const hour = new Date().getHours(); return hour >= 19 || hour < 6; })();

  const travel = async (place: Place) => {
    setPendingTarget(place);
    setThresholdVisible(true);
  };

  const finishTravel = async () => {
    if (!pendingTarget) return;
    await changeLocation(pendingTarget.id);
    await worldRevisitStore.recordVisit(userId, pendingTarget.key);
    setThresholdVisible(false);
    setSelectedPlace(null);
    setPendingTarget(null);
    await loadData();
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 44 }} className="flex-1">
        <View className="relative min-h-[780px] overflow-hidden px-5 pt-4">
          <View pointerEvents="none" className="absolute inset-0 bg-slate-950" />
          <Animated.View pointerEvents="none" style={{ opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.9] }) }} className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-indigo-500/15" />
          <Animated.View pointerEvents="none" style={{ opacity: slowBreath.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] }) }} className="absolute left-[-80px] top-36 h-72 w-72 rounded-full bg-emerald-400/10" />
          {Array.from({ length: 18 }).map((_, index) => (
            <Animated.View key={index} pointerEvents="none" style={{ opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0.18 + (index % 3) * 0.08, 0.55] }) }} className="absolute h-1 w-1 rounded-full bg-white" />
          ))}

          <View className="z-10 flex-row items-start justify-between">
            <View className="max-w-[78%]">
              <View className="flex-row items-center gap-2">
                {night ? <Moon size={14} color="#c4b5fd" /> : <Sun size={14} color="#fde68a" />}
                <Text className="text-[10px] font-bold uppercase tracking-[2.5px] text-emerald-300">Emerald Valley</Text>
              </View>
              <Text className="mt-2 text-[30px] font-black tracking-tight text-white">Where will you wander?</Text>
              <Text className="mt-1 text-sm leading-5 text-slate-400">Nothing here is waiting for you to complete it. The valley is simply alive.</Text>
            </View>
            <View className="items-center pt-1">
              {rainy ? <CloudRain size={20} color="#93c5fd" /> : <Sparkles size={20} color="#6ee7b7" />}
              <Text className="mt-1 text-[9px] text-slate-500">{rainy ? 'rain' : night ? 'night' : 'day'}</Text>
            </View>
          </View>

          <View pointerEvents="none" className="absolute left-[-20%] right-[-20%] top-[280px] h-80 rounded-[50%] bg-emerald-950/70" />
          <View pointerEvents="none" className="absolute left-[-15%] right-[-15%] top-[370px] h-72 rounded-[50%] bg-slate-900/90" />
          <View pointerEvents="none" className="absolute left-[8%] top-[290px] h-28 w-36 rounded-[45%] bg-emerald-900/50" />
          <View pointerEvents="none" className="absolute right-[4%] top-[300px] h-32 w-44 rounded-[45%] bg-indigo-950/60" />
          <View pointerEvents="none" className="absolute left-[48%] top-[390px] h-[320px] w-16 -rotate-[10deg] rounded-full border-l-[14px] border-r-[14px] border-slate-800/60" />
          <View pointerEvents="none" className="absolute left-[49%] top-[390px] h-[320px] w-10 -rotate-[10deg] rounded-full border-l-[2px] border-r-[2px] border-dashed border-emerald-400/20" />

          {PLACES.map((place) => {
            const selected = selectedPlace?.id === place.id;
            const current = currentPlace.id === place.id;
            const palette = colorClasses[place.color];
            const visits = revisitStats[place.key]?.count || 0;
            const hidden = gatedByLoc[place.key] || 0;
            return (
              <Pressable key={place.id} onPress={() => setSelectedPlace(place)} style={{ left: `${place.x}%`, top: `${place.y}%` }} className="absolute z-20 -ml-8 -mt-8 h-20 w-20 items-center justify-center">
                <Animated.View style={{ transform: [{ scale: current ? breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) : 1 }] }} className={`absolute h-16 w-16 rounded-full ${palette.glow} ${selected || current ? 'opacity-100' : 'opacity-60'}`} />
                <View className={`h-12 w-12 items-center justify-center rounded-full border bg-slate-950/75 ${palette.ring} ${current ? 'shadow-2xl' : ''}`}><Text className="text-2xl">{place.icon}</Text></View>
                {current && <View className="absolute -top-1 h-2.5 w-2.5 rounded-full bg-emerald-300" />}
                {visits > 0 && <Text className="absolute -bottom-1 rounded-full bg-slate-950/80 px-2 py-0.5 text-[8px] text-slate-400">{visits} visits</Text>}
                <Text className={`absolute top-[66px] whitespace-nowrap text-[11px] font-bold ${palette.text}`}>{place.name}</Text>
                {hidden > 0 && <View className="absolute -right-1 top-0 flex-row items-center rounded-full bg-slate-950/90 px-1.5 py-1"><Eye size={9} color="#94a3b8" /><Text className="ml-1 text-[8px] text-slate-400">{hidden}</Text></View>}
              </Pressable>
            );
          })}

          <View className="absolute bottom-7 left-5 right-5 z-20 flex-row items-center justify-between">
            <View className="flex-row items-center"><View className="h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-950/60"><Heart size={15} color="#6ee7b7" /></View><View className="ml-3"><Text className="text-[9px] uppercase tracking-[1.5px] text-slate-500">The valley remembers</Text><Text className="mt-0.5 text-xs text-slate-300">Living growth · {growth}</Text></View></View>
            <Pressable onPress={() => setShowEmaModal(true)} className="flex-row items-center rounded-full border border-amber-400/25 bg-amber-950/40 px-3 py-2 active:bg-amber-900/50"><Text className="mr-1.5 text-base">🎋</Text><Text className="text-[10px] font-bold text-amber-200">Make a wish</Text></Pressable>
          </View>
        </View>

        {selectedPlace && (() => {
          const place = selectedPlace;
          const palette = colorClasses[place.color];
          const note = revisitNotes[place.key];
          const placeArtifact = artifacts.find(a => a.locationKey === place.key);
          const current = currentPlace.id === place.id;
          return <View className="mx-5 mt-[-8px] rounded-[28px] border border-white/10 bg-slate-950/85 p-5 shadow-2xl">
            <View className="flex-row items-start justify-between"><View className="flex-1"><Text className={`text-[10px] font-bold uppercase tracking-[2px] ${palette.text}`}>{current ? 'You are here' : 'A place in the valley'}</Text><Text className="mt-1 text-xl font-black text-white">{place.name}</Text><Text className="mt-1 text-xs text-slate-400">{place.npcName} · {place.npcRole}</Text></View><Pressable onPress={() => setSelectedPlace(null)} className="h-8 w-8 items-center justify-center rounded-full bg-white/5"><Text className="text-slate-400">×</Text></Pressable></View>
            <Text className="mt-4 text-sm leading-5 text-slate-300">{place.description}</Text>
            {note && <Text className="mt-3 text-xs italic leading-5 text-indigo-200">“{note}”</Text>}
            {placeArtifact && <Pressable onPress={() => setSelectedArtifact(placeArtifact)} className="mt-4 flex-row items-center"><Sparkles size={14} color="#fbbf24" /><Text className="ml-2 text-xs font-semibold text-amber-200">Something here wants to be discovered.</Text></Pressable>}
            <View className="mt-5 flex-row gap-2">
              {!current && <Pressable onPress={() => void travel(place)} className="flex-1 flex-row items-center justify-center rounded-2xl bg-white/5 py-3 active:bg-white/10"><Compass size={15} color="#93c5fd" /><Text className="ml-2 text-xs font-bold text-slate-200">Wander here</Text></Pressable>}
              {place.scenarioKey && <Pressable onPress={() => onStartScenario?.(place.scenarioKey!)} className="flex-1 flex-row items-center justify-center rounded-2xl bg-emerald-400 py-3 active:bg-emerald-300"><Sparkles size={15} color="#022c22" /><Text className="ml-2 text-xs font-black text-emerald-950">Talk & learn</Text></Pressable>}
            </View>
          </View>;
        })()}

        <View className="mx-5 mt-5 flex-row items-center justify-center gap-2"><MapPin size={12} color="#64748b" /><Text className="text-[10px] text-slate-500">Explore slowly. Curiosity is the progression system.</Text></View>
      </ScrollView>

      <WorldThresholdModal visible={thresholdVisible} fromLocationName={currentPlace.name} toLocationName={pendingTarget?.name ?? 'Destination'} toLocationKey={pendingTarget?.key ?? 'study_room'} onTransitionComplete={finishTravel} />
      <WonderPromptModal visible={selectedArtifact !== null} artifact={selectedArtifact} onClose={() => setSelectedArtifact(null)} />
      <EmaRitualModal visible={showEmaModal} onClose={() => setShowEmaModal(false)} />
    </SafeAreaView>
  );
}
