import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCassidy } from '../../../hooks/useCassidy';
import { LocalStore } from '../../../lib/localStore';

import { Heart, Sparkles, User, Clock, MessageSquare, Coffee, BookOpen } from 'lucide-react-native';

const OTHER_CHARACTERS = [
  {
    key: 'ren',
    name: 'Ren',
    role: 'Barista at Café Komorebi',
    avatar: '☕',
    trust: 90,
    trait: 'Warm, patient listener, makes artisan matcha and coffee.',
    location: 'Café Komorebi',
  },
  {
    key: 'emi',
    name: 'Emi',
    role: 'Wisdom Keeper at The Whispering Library',
    avatar: '📚',
    trust: 75,
    trait: 'Curator of ancient scrolls, folktales, and idioms.',
    location: 'The Whispering Library',
  },
  {
    key: 'kenji',
    name: 'Kenji',
    role: 'Lantern Market Street Vendor',
    avatar: '🏮',
    trust: 60,
    trait: 'Energetic, loves conversational banter and bargaining.',
    location: 'Lantern Night Market',
  },
];

export function CharacterScreen() {
  const { view } = useCassidy();

  const routine = (view?.state?.routine_schedule as Record<string, string>) ?? {
    morning: 'Brewing tea and reviewing morning phrase cards',
    afternoon: 'Visiting Café Komorebi and reading stories',
    evening: 'Tending the bonsai plant and reflecting in the study',
    night: 'Listening to ambient lo-fi and stargazing',
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Living Companions & Friends
            </Text>
            <Text className="text-2xl font-bold text-white">Characters</Text>
          </View>
        </View>

        {/* Cassidy Main Profile Card */}
        <View className="mt-4 rounded-2xl border border-indigo-500/40 bg-slate-900 p-5 shadow-lg">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600/30 border border-indigo-500/50">
              <Text className="text-3xl">🦊</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl font-bold text-white">Cassidy</Text>
                <View className="rounded-full bg-emerald-500/20 px-2 py-0.5 border border-emerald-500/30">
                  <Text className="text-[10px] font-bold text-emerald-400">PRIMARY GUIDE</Text>
                </View>
              </View>
              <Text className="text-xs text-indigo-300">
                {view?.character?.role ?? 'Lifelong Learning Companion & Guide'}
              </Text>
            </View>
          </View>

          {/* Relationship Metrics */}
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-xl bg-slate-800/80 p-3 border border-slate-700/60">
              <View className="flex-row items-center gap-1.5">
                <Heart size={14} color="#f43f5e" />
                <Text className="text-[11px] font-semibold text-slate-300">Trust</Text>
              </View>
              <Text className="mt-1 text-lg font-bold text-white">{view?.relationship?.trust ?? 85}%</Text>
              <View className="mt-1.5 h-1.5 w-full rounded-full bg-slate-700">
                <View className="h-1.5 rounded-full bg-rose-500" style={{ width: `${view?.relationship?.trust ?? 85}%` }} />
              </View>
            </View>

            <View className="flex-1 rounded-xl bg-slate-800/80 p-3 border border-slate-700/60">
              <View className="flex-row items-center gap-1.5">
                <Sparkles size={14} color="#a78bfa" />
                <Text className="text-[11px] font-semibold text-slate-300">Friendship</Text>
              </View>
              <Text className="mt-1 text-lg font-bold text-white">{view?.relationship?.friendship ?? 80}%</Text>
              <View className="mt-1.5 h-1.5 w-full rounded-full bg-slate-700">
                <View className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${view?.relationship?.friendship ?? 80}%` }} />
              </View>
            </View>
          </View>

          {/* Daily Routine (Blueprint Part XI #34) */}
          <View className="mt-4 rounded-xl bg-slate-800/50 p-3 border border-slate-800">
            <View className="flex-row items-center gap-1.5 mb-2">
              <Clock size={13} color="#94a3b8" />
              <Text className="text-xs font-bold text-slate-200">Cassidy's Daily Routine</Text>
            </View>
            <View className="gap-1.5">
              {Object.entries(routine).map(([time, desc]) => (
                <View key={time} className="flex-row items-start gap-2">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 w-16 pt-0.5">
                    {time}
                  </Text>
                  <Text className="flex-1 text-xs text-slate-300 leading-snug">{desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Other World Characters */}
        <Text className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-400">
          World Residents & Acquaintances
        </Text>

        <View className="mt-3 gap-3">
          {OTHER_CHARACTERS.map((char) => (
            <View key={char.key} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700">
                    <Text className="text-xl">{char.avatar}</Text>
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-white">{char.name}</Text>
                    <Text className="text-xs text-slate-400">{char.role}</Text>
                  </View>
                </View>

                <View className="rounded-full bg-slate-800 px-2.5 py-1">
                  <Text className="text-[10px] text-slate-300">{char.location}</Text>
                </View>
              </View>

              <Text className="mt-2.5 text-xs text-slate-300 leading-relaxed">{char.trait}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

