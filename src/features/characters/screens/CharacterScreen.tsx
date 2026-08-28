import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Heart, MessageCircle, MapPin, Sparkles } from 'lucide-react-native';
import { useCassidy } from '../../../hooks/useCassidy';
import { resolveTimeOfDay } from '../../../lib/time';

type Resident = { key: string; name: string; role: string; avatar: string; location: string; trait: string; mood: string };

const RESIDENTS: Resident[] = [
  { key: 'ren', name: 'Ren', role: 'Barista', avatar: '☕', location: 'Café Komorebi', trait: 'Warm, patient, and always experimenting with tea.', mood: 'content' },
  { key: 'emi', name: 'Emi', role: 'Wisdom Keeper', avatar: '📚', location: 'Whispering Library', trait: 'Collects folktales, idioms, and stories from travelers.', mood: 'curious' },
  { key: 'kenji', name: 'Kenji', role: 'Market Vendor', avatar: '🏮', location: 'Lantern Night Market', trait: 'Energetic, playful, and impossible to bargain with.', mood: 'cheerful' },
];

const TIME_LABELS: Record<string, string> = {
  morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night',
};

export function CharacterScreen() {
  const { view } = useCassidy();
  const [selected, setSelected] = useState<Resident | null>(null);
  const time = resolveTimeOfDay();
  const routine = (view?.state?.routine_schedule as Record<string, string>) ?? {};
  const activeResidents = useMemo(() => RESIDENTS.map((resident, index) => ({ ...resident, mood: index === 0 && time === 'morning' ? 'welcoming' : resident.mood })), [time]);

  useEffect(() => { setSelected(null); }, [time]);

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-emerald-400">The Valley · {TIME_LABELS[time]}</Text>
        <Text className="mt-1 text-3xl font-bold text-white">People you may meet</Text>
        <Text className="mt-2 max-w-[340px] text-sm leading-5 text-slate-400">They are not entries in a directory. They are living parts of the world, with places to be and reasons to be there.</Text>

        <View className="mt-7 overflow-hidden rounded-[32px] border border-indigo-400/20 bg-slate-950/55 px-5 py-6">
          <View className="items-center">
            <View className="h-24 w-24 items-center justify-center rounded-full border border-indigo-300/30 bg-indigo-400/10">
              <Text className="text-5xl">🦊</Text>
            </View>
            <Text className="mt-3 text-2xl font-bold text-white">Cassidy</Text>
            <Text className="mt-1 text-center text-sm text-indigo-200">{view?.character?.role ?? 'Your companion through the living world'}</Text>
            <View className="mt-4 flex-row items-center rounded-full bg-emerald-400/10 px-4 py-2">
              <Sparkles size={14} color="#34d399" />
              <Text className="ml-2 text-xs font-semibold text-emerald-300">Present · {time}</Text>
            </View>
          </View>

          <View className="mt-6 flex-row justify-around border-t border-white/5 pt-5">
            <LivingMetric label="Trust" value={view?.relationship?.trust ?? 85} />
            <LivingMetric label="Friendship" value={view?.relationship?.friendship ?? 80} />
            <LivingMetric label="Shared" value={view?.relationship?.shared_history?.length ?? 0} suffix=" moments" />
          </View>
        </View>

        <View className="mt-8">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-white">Around the valley</Text>
            <Text className="text-xs text-slate-500">people are moving</Text>
          </View>
          <View className="relative min-h-[330px] overflow-hidden rounded-[36px] border border-slate-700/50 bg-slate-950/50">
            <View className="absolute -left-12 top-20 h-40 w-40 rounded-full bg-emerald-500/10" />
            <View className="absolute -right-12 bottom-8 h-52 w-52 rounded-full bg-indigo-500/10" />
            <View className="absolute left-8 right-8 top-[155px] h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
            {activeResidents.map((resident, index) => {
              const positions = [
                'left-5 top-8',
                'right-5 top-20',
                'left-20 bottom-8',
              ];
              return <Pressable key={resident.key} onPress={() => setSelected(resident)} className={`absolute ${positions[index]} items-center`}>
                <View className={`h-16 w-16 items-center justify-center rounded-full border ${selected?.key === resident.key ? 'border-emerald-300 bg-emerald-400/20' : 'border-slate-600/70 bg-slate-900/90'} shadow-xl`}>
                  <Text className="text-2xl">{resident.avatar}</Text>
                </View>
                <Text className="mt-2 text-sm font-bold text-white">{resident.name}</Text>
                <View className="mt-1 flex-row items-center rounded-full bg-slate-900/80 px-2.5 py-1">
                  <MapPin size={10} color="#94a3b8" /><Text className="ml-1 text-[9px] text-slate-400">{resident.location}</Text>
                </View>
                <Text className="mt-1 text-[9px] text-emerald-300">{resident.mood}</Text>
              </Pressable>;
            })}
            <View className="absolute bottom-[135px] left-1/2 -ml-7 h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Text className="text-xl">✦</Text>
            </View>
          </View>
        </View>

        {selected && <Pressable onPress={() => setSelected(null)} className="mt-4 rounded-[28px] border border-emerald-400/20 bg-emerald-400/5 p-5">
          <View className="flex-row items-center"><Text className="text-3xl">{selected.avatar}</Text><View className="ml-3 flex-1"><Text className="text-lg font-bold text-white">{selected.name}</Text><Text className="text-xs text-emerald-300">{selected.role} · {selected.mood}</Text></View><MessageCircle size={19} color="#34d399" /></View>
          <Text className="mt-3 text-sm leading-5 text-slate-300">{selected.trait}</Text>
          <Text className="mt-3 text-xs font-medium text-emerald-300">Walk over and see what happens.</Text>
        </Pressable>}

        <View className="mt-8 rounded-[28px] border border-slate-800/70 bg-slate-950/35 p-5">
          <View className="flex-row items-center"><Clock size={15} color="#94a3b8" /><Text className="ml-2 text-sm font-bold text-slate-200">Cassidy's rhythm</Text></View>
          <Text className="mt-2 text-xs leading-5 text-slate-400">Her routine is a suggestion, not a schedule card. The world can interrupt it when something meaningful happens.</Text>
          {routine[time] && <Text className="mt-3 text-sm text-indigo-200">Right now: {routine[time]}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LivingMetric({ label, value, suffix = '%' }: { label: string; value: number; suffix?: string }) {
  return <View className="items-center"><Text className="text-lg font-bold text-white">{value}{suffix}</Text><Text className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{label}</Text></View>;
}
