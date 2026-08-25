import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorldState } from '../../../hooks/useWorldState';
import { AtmosphereLayer } from '../components/AtmosphereLayer';
import { CassidyRoom } from '../components/CassidyRoom';
import { StudyObjects } from '../components/objects/StudyObjects';
import { MatchaCraftingModal } from '../../learning/components/MatchaCraftingModal';
import { PitchShadowTrainerModal } from '../../learning/components/PitchShadowTrainerModal';
import { CalligraphyStudioModal } from '../../learning/components/CalligraphyStudioModal';
import { SoundscapeMixerModal } from '../components/SoundscapeMixerModal';
import {
  Sparkles,
  Check,
  ChevronRight,
  TrendingUp,
  Sliders,
  PenTool,
} from 'lucide-react-native';

const QUICK_PRACTICE_ITEMS = [
  {
    id: 'qp-1',
    term: 'Komorebi (木漏れ日)',
    meaning: 'Sunlight filtering through trees',
    audioCue: 'Ko-mo-re-bi',
  },
  {
    id: 'qp-2',
    term: 'Kore o kudasai (これをください)',
    meaning: 'Please give me this (Ordering)',
    audioCue: 'Ko-re o ku-da-sai',
  },
  {
    id: 'qp-3',
    term: 'Otsukaresama (お疲れ様)',
    meaning: 'Thank you for your hard work',
    audioCue: 'O-tsu-ka-re-sa-ma',
  },
];

export function StudyScreen() {
  const { state } = useWorldState();
  const [practiced, setPracticed] = useState<Record<string, boolean>>({});

  // Modals
  const [showMatchaModal, setShowMatchaModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showCalligraphyModal, setShowCalligraphyModal] = useState(false);
  const [showMixerModal, setShowMixerModal] = useState(false);

  const togglePractice = (id: string) => {
    setPracticed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <AtmosphereLayer
        season={state?.season ?? 'spring'}
        timeOfDay={state?.timeOfDay ?? 'morning'}
      />
      <ScrollView
        className="flex-1 px-5 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              The Sunlit Study
            </Text>
            <Text className="text-2xl font-bold text-white">Living Study Room</Text>
          </View>
          <Pressable
            onPress={() => setShowMixerModal(true)}
            className="flex-row items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1.5 border border-slate-700 active:bg-slate-700"
          >
            <Sliders size={13} color="#818cf8" />
            <Text className="text-xs font-medium text-slate-300">Mixer Deck</Text>
          </Pressable>
        </View>

        {/* Study Arts Quick Triggers */}
        <View className="mt-3.5 flex-row flex-wrap gap-2.5">
          <Pressable
            onPress={() => setShowMatchaModal(true)}
            className="flex-1 min-w-[45%] flex-row items-center justify-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 py-2.5 active:bg-emerald-950/40"
          >
            <Text className="text-base">🍵</Text>
            <Text className="text-xs font-bold text-emerald-300">Matcha Workshop</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowCalligraphyModal(true)}
            className="flex-1 min-w-[45%] flex-row items-center justify-center gap-1.5 rounded-2xl border border-purple-500/30 bg-purple-950/20 py-2.5 active:bg-purple-950/40"
          >
            <PenTool size={14} color="#c084fc" />
            <Text className="text-xs font-bold text-purple-300">Calligraphy Studio</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowPitchModal(true)}
            className="flex-1 min-w-[45%] flex-row items-center justify-center gap-1.5 rounded-2xl border border-sky-500/30 bg-sky-950/20 py-2.5 active:bg-sky-950/40"
          >
            <TrendingUp size={14} color="#38bdf8" />
            <Text className="text-xs font-bold text-sky-300">Pitch Trainer</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowMixerModal(true)}
            className="flex-1 min-w-[45%] flex-row items-center justify-center gap-1.5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 py-2.5 active:bg-indigo-950/40"
          >
            <Sliders size={14} color="#818cf8" />
            <Text className="text-xs font-bold text-indigo-300">Soundscape Mix</Text>
          </Pressable>
        </View>

        {/* Cassidy Companion */}
        <CassidyRoom />

        {/* Interactive Study Room Objects (Bonsai, Radio, Notes) */}
        <StudyObjects />

        {/* Quick Knowledge Practice / Constellation (Blueprint Part VIII & XV) */}
        <View className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Sparkles size={16} color="#fbbf24" />
              <Text className="text-sm font-bold text-white">Knowledge Constellation</Text>
            </View>
            <Text className="text-xs text-amber-400">Tap to review</Text>
          </View>

          <View className="mt-3 gap-2.5">
            {QUICK_PRACTICE_ITEMS.map((item) => {
              const isDone = Boolean(practiced[item.id]);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => togglePractice(item.id)}
                  className={`flex-row items-center justify-between rounded-xl border p-3 ${
                    isDone
                      ? 'border-emerald-500/60 bg-emerald-950/30'
                      : 'border-slate-800 bg-slate-800/50'
                  }`}
                >
                  <View className="flex-1 pr-3">
                    <Text
                      className={`text-sm font-bold ${isDone ? 'text-emerald-300' : 'text-white'}`}
                    >
                      {item.term}
                    </Text>
                    <Text className="mt-0.5 text-xs text-slate-300">{item.meaning}</Text>
                    <Text className="mt-1 text-[10px] text-indigo-300">
                      Phonetic: {item.audioCue}
                    </Text>
                  </View>

                  <View
                    className={`h-7 w-7 items-center justify-center rounded-lg border ${
                      isDone
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                  >
                    {isDone ? (
                      <Check size={16} color="#ffffff" />
                    ) : (
                      <ChevronRight size={16} color="#94a3b8" />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <MatchaCraftingModal
        visible={showMatchaModal}
        onClose={() => setShowMatchaModal(false)}
      />
      <CalligraphyStudioModal
        visible={showCalligraphyModal}
        onClose={() => setShowCalligraphyModal(false)}
      />
      <PitchShadowTrainerModal
        visible={showPitchModal}
        onClose={() => setShowPitchModal(false)}
      />
      <SoundscapeMixerModal
        visible={showMixerModal}
        onClose={() => setShowMixerModal(false)}
      />
    </SafeAreaView>
  );
}
