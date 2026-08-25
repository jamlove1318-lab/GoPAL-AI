import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EconomyEngine } from '../../../engines/economy/economyEngine';
import { Sparkles, X, Volume2, Award, CheckCircle2, TrendingUp, Mic } from 'lucide-react-native';

interface PitchShadowTrainerModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PitchPair {
  id: string;
  word1: string;
  romaji1: string;
  meaning1: string;
  pitchPattern1: 'LH' | 'HL' | 'LHL';
  word2: string;
  romaji2: string;
  meaning2: string;
  pitchPattern2: 'LH' | 'HL' | 'LHL';
  contextTip: string;
}

const PITCH_PAIRS: PitchPair[] = [
  {
    id: 'p1',
    word1: '雨 (Ame)',
    romaji1: 'á-me (High-Low)',
    meaning1: 'Rain 🌧️',
    pitchPattern1: 'HL',
    word2: '飴 (Ame)',
    romaji2: 'a-mé (Low-High)',
    meaning2: 'Candy 🍬',
    pitchPattern2: 'LH',
    contextTip: 'Notice the drop on the second syllable for "Rain", but the rise for "Candy".',
  },
  {
    id: 'p2',
    word1: '箸 (Hashi)',
    romaji1: 'há-shi (High-Low)',
    meaning1: 'Chopsticks 🥢',
    pitchPattern1: 'HL',
    word2: '橋 (Hashi)',
    romaji2: 'ha-shí (Low-High)',
    meaning2: 'Bridge 🌉',
    pitchPattern2: 'LH',
    contextTip: 'When eating ramen with Barista Ren, start high on "Háshi" to ask for chopsticks.',
  },
  {
    id: 'p3',
    word1: '今 (Ima)',
    romaji1: 'í-ma (High-Low)',
    meaning1: 'Now ⏰',
    pitchPattern1: 'HL',
    word2: '居間 (Ima)',
    romaji2: 'i-má (Low-High)',
    meaning2: 'Living Room 🛋️',
    pitchPattern2: 'LH',
    contextTip: 'Say "Íma" when indicating the present moment during your study sessions.',
  },
];

export function PitchShadowTrainerModal({ visible, onClose }: PitchShadowTrainerModalProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedWord, setSelectedWord] = useState<1 | 2>(1);
  const [practicedCount, setPracticedCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const current = PITCH_PAIRS[activeIdx];

  const handlePracticeSyllables = async () => {
    setFeedback(`✨ Cassidy: Great natural rhythm! High pitch followed by clean decay.`);
    const newCount = practicedCount + 1;
    setPracticedCount(newCount);
    if (newCount % 2 === 0) {
      await EconomyEngine.awardSparkles(15, 'Completed pitch accent shadow training');
    }
  };

  const handleNextPair = () => {
    setFeedback(null);
    setActiveIdx((prev) => (prev + 1) % PITCH_PAIRS.length);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <SafeAreaView className="h-[88%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <TrendingUp size={18} color="#38bdf8" />
              <View>
                <Text className="text-base font-bold text-white">Pitch Accent Shadow Trainer</Text>
                <Text className="text-[10px] text-sky-400">Natural Japanese Cadence & Tone</Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-800"
            >
              <X size={16} color="#94a3b8" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
            <Text className="text-xs text-slate-400 mb-3 leading-relaxed">
              Japanese is a pitch-accent language. Compare how slight pitch rises and falls change word meanings completely!
            </Text>

            {/* Pair Selector Cards */}
            <View className="flex-row gap-3 mb-4">
              {/* Option 1 */}
              <Pressable
                onPress={() => {
                  setSelectedWord(1);
                  setFeedback(null);
                }}
                className={`flex-1 rounded-2xl border p-4 ${
                  selectedWord === 1
                    ? 'border-sky-500 bg-sky-950/40'
                    : 'border-slate-800 bg-slate-900'
                }`}
              >
                <Text className="text-xl font-bold text-white mb-1">{current.word1}</Text>
                <Text className="text-xs font-semibold text-sky-300">{current.romaji1}</Text>
                <Text className="text-xs text-slate-300 mt-1">{current.meaning1}</Text>
                <View className="mt-2 rounded-lg bg-sky-500/20 px-2 py-0.5 self-start">
                  <Text className="text-[10px] font-bold text-sky-300">
                    Pitch: {current.pitchPattern1}
                  </Text>
                </View>
              </Pressable>

              {/* Option 2 */}
              <Pressable
                onPress={() => {
                  setSelectedWord(2);
                  setFeedback(null);
                }}
                className={`flex-1 rounded-2xl border p-4 ${
                  selectedWord === 2
                    ? 'border-emerald-500 bg-emerald-950/40'
                    : 'border-slate-800 bg-slate-900'
                }`}
              >
                <Text className="text-xl font-bold text-white mb-1">{current.word2}</Text>
                <Text className="text-xs font-semibold text-emerald-300">{current.romaji2}</Text>
                <Text className="text-xs text-slate-300 mt-1">{current.meaning2}</Text>
                <View className="mt-2 rounded-lg bg-emerald-500/20 px-2 py-0.5 self-start">
                  <Text className="text-[10px] font-bold text-emerald-300">
                    Pitch: {current.pitchPattern2}
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* Pitch Contour Visualizer */}
            <View className="rounded-2xl border border-slate-800 bg-slate-900 p-4 mb-4">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Pitch Contour Guide
              </Text>
              <View className="flex-row items-center justify-around py-3">
                {selectedWord === 1 ? (
                  <View className="flex-row items-center gap-6">
                    <View className="items-center">
                      <View className="h-10 w-10 items-center justify-center rounded-xl bg-sky-500 border border-sky-300">
                        <Text className="text-sm font-bold text-slate-950">HIGH ↗</Text>
                      </View>
                      <Text className="text-xs text-white mt-1">First mora</Text>
                    </View>
                    <Text className="text-xl text-sky-400">→</Text>
                    <View className="items-center">
                      <View className="h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-600">
                        <Text className="text-sm font-bold text-slate-300">LOW ↘</Text>
                      </View>
                      <Text className="text-xs text-slate-400 mt-1">Second mora</Text>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-6">
                    <View className="items-center">
                      <View className="h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-600">
                        <Text className="text-sm font-bold text-slate-300">LOW ↘</Text>
                      </View>
                      <Text className="text-xs text-slate-400 mt-1">First mora</Text>
                    </View>
                    <Text className="text-xl text-emerald-400">→</Text>
                    <View className="items-center">
                      <View className="h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 border border-emerald-300">
                        <Text className="text-sm font-bold text-slate-950">HIGH ↗</Text>
                      </View>
                      <Text className="text-xs text-white mt-1">Second mora</Text>
                    </View>
                  </View>
                )}
              </View>
              <Text className="text-[11px] text-slate-400 italic text-center mt-2">
                {current.contextTip}
              </Text>
            </View>

            {/* Practice Button */}
            <Pressable
              onPress={handlePracticeSyllables}
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-sky-500 py-3.5 mb-3 active:bg-sky-600"
            >
              <Mic size={16} color="#0c4a6e" />
              <Text className="text-xs font-bold text-sky-950">
                Shadow Practice: "{selectedWord === 1 ? current.word1 : current.word2}"
              </Text>
            </Pressable>

            {feedback && (
              <View className="rounded-xl bg-sky-950/60 p-3 border border-sky-500/30 mb-3">
                <Text className="text-xs text-sky-200">{feedback}</Text>
              </View>
            )}

            {/* Next Pair button */}
            <Pressable
              onPress={handleNextPair}
              className="rounded-xl bg-slate-800 py-2.5 items-center mb-6"
            >
              <Text className="text-xs text-slate-300">Next Pitch Pair →</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
