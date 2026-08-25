import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocalStore } from '../../../lib/localStore';
import { EconomyEngine } from '../../../engines/economy/economyEngine';
import { Sparkles, X, Award, CheckCircle2, RotateCcw, PenTool } from 'lucide-react-native';

interface CalligraphyStudioModalProps {
  visible: boolean;
  onClose: () => void;
}

interface KanjiStrokeData {
  kanji: string;
  romaji: string;
  meaning: string;
  strokes: number;
  radical: string;
  mnemonic: string;
  strokeSteps: string[];
}

const CALLIGRAPHY_ITEMS: KanjiStrokeData[] = [
  {
    kanji: '木',
    romaji: 'Ki / Moku',
    meaning: 'Tree / Wood 🌲',
    strokes: 4,
    radical: '木 (Tree)',
    mnemonic: 'Imagine a tall cedar trunk with roots spreading left and branches right.',
    strokeSteps: [
      '1. Horizontal branch: Left to right (一)',
      '2. Central trunk: Vertical downward pierce (十)',
      '3. Left root: Sweeping diagonal down-left',
      '4. Right root: Sweeping diagonal down-right',
    ],
  },
  {
    kanji: '水',
    romaji: 'Mizu / Sui',
    meaning: 'Water 💧',
    strokes: 4,
    radical: '水 (Water)',
    mnemonic: 'A flowing central mountain stream with splashing water droplets on both sides.',
    strokeSteps: [
      '1. Central river spine: Vertical hook down',
      '2. Left ripple: Angled slash',
      '3. Right upper spray: Short downward diagonal',
      '4. Right lower stream: Long flowing diagonal sweep',
    ],
  },
  {
    kanji: '日',
    romaji: 'Hi / Nichi',
    meaning: 'Sun / Day ☀️',
    strokes: 4,
    radical: '日 (Sun)',
    mnemonic: 'The circular radiant sun enclosed in a celestial window frame with the horizon line inside.',
    strokeSteps: [
      '1. Left frame pillar: Vertical line down',
      '2. Top & right frame: Horizontal right and turn down',
      '3. Solar core: Inner horizontal line',
      '4. Foundation seal: Bottom closing horizontal',
    ],
  },
  {
    kanji: '月',
    romaji: 'Tsuki / Getsu',
    meaning: 'Moon / Month 🌙',
    strokes: 4,
    radical: '月 (Moon)',
    mnemonic: 'A crescent moon with two horizontal cloud wisps passing over its face.',
    strokeSteps: [
      '1. Left crescent curve: Sweeping downward curve',
      '2. Upper arc & spine: Across right and straight down with hook',
      '3. Upper cloud wisp: Horizontal inside bar',
      '4. Lower cloud wisp: Second horizontal bar',
    ],
  },
  {
    kanji: '山',
    romaji: 'Yama / San',
    meaning: 'Mountain ⛰️',
    strokes: 3,
    radical: '山 (Mountain)',
    mnemonic: 'Three towering mountain peaks rising against the Kyoto sky.',
    strokeSteps: [
      '1. Central peak: Tall vertical central line down',
      '2. Left peak & valley: Down and horizontal bottom ridge',
      '3. Right peak: Right vertical line down to base',
    ],
  },
];

export function CalligraphyStudioModal({ visible, onClose }: CalligraphyStudioModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [drawnStrokes, setDrawnStrokes] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const current = CALLIGRAPHY_ITEMS[selectedIdx];

  const handleDrawStroke = () => {
    if (drawnStrokes.length >= current.strokes) return;
    const nextStrokes = [...drawnStrokes, drawnStrokes.length + 1];
    setDrawnStrokes(nextStrokes);
    setCurrentStepIndex(nextStrokes.length);

    if (nextStrokes.length === current.strokes) {
      setIsFinished(true);
    }
  };

  const handleClaimMastery = async () => {
    if (rewardClaimed) return;
    setRewardClaimed(true);
    await EconomyEngine.awardSparkles(30, `Mastered calligraphy for "${current.kanji}"`);

    // Add creation to Memory Museum
    await LocalStore.addCreation({
      type: 'phrase_card',
      title: `Calligraphy Masterwork: ${current.kanji}`,
      subtitle: `${current.meaning} (${current.romaji})`,
      content: `Mastered all ${current.strokes} stroke order steps. Mnemonic: ${current.mnemonic}`,
      visualTheme: 'indigo',
      tags: ['Kanji', 'Calligraphy', current.kanji],
    });

    await LocalStore.addMemory(
      'learning',
      `Mastered the traditional ink brush stroke order for the Kanji "${current.kanji}" (${current.meaning}).`
    );
  };

  const handleReset = () => {
    setDrawnStrokes([]);
    setCurrentStepIndex(0);
    setIsFinished(false);
    setRewardClaimed(false);
  };

  const handleSelectKanji = (idx: number) => {
    setSelectedIdx(idx);
    setDrawnStrokes([]);
    setCurrentStepIndex(0);
    setIsFinished(false);
    setRewardClaimed(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <SafeAreaView className="h-[90%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <PenTool size={18} color="#a78bfa" />
              <View>
                <Text className="text-base font-bold text-white">Calligraphy & Stroke Studio</Text>
                <Text className="text-[10px] text-purple-400">Traditional Ink & Stroke Art (書道)</Text>
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
            {/* Kanji Selector Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {CALLIGRAPHY_ITEMS.map((item, idx) => (
                  <Pressable
                    key={item.kanji}
                    onPress={() => handleSelectKanji(idx)}
                    className={`h-12 w-12 items-center justify-center rounded-2xl border ${
                      selectedIdx === idx
                        ? 'border-purple-500 bg-purple-950/40'
                        : 'border-slate-800 bg-slate-900'
                    }`}
                  >
                    <Text
                      className={`text-lg font-bold ${
                        selectedIdx === idx ? 'text-purple-300' : 'text-slate-400'
                      }`}
                    >
                      {item.kanji}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Ink Practice Canvas Grid */}
            <View className="items-center mb-4">
              <View className="h-44 w-44 items-center justify-center rounded-3xl bg-slate-900 border-2 border-dashed border-purple-500/40 relative shadow-inner">
                {/* 2x2 Grid Guidelines */}
                <View className="absolute h-full w-[1px] bg-slate-800" />
                <View className="absolute w-full h-[1px] bg-slate-800" />

                {/* Drawn Kanji Representation */}
                <Text
                  className={`text-7xl font-bold transition-all ${
                    isFinished ? 'text-purple-300 scale-105' : 'text-slate-100'
                  }`}
                >
                  {current.kanji}
                </Text>

                {/* Seal Stamp when finished */}
                {isFinished && (
                  <View className="absolute bottom-2 right-2 rounded-lg bg-rose-600/90 border border-rose-400 px-2 py-0.5 shadow-lg">
                    <Text className="text-[10px] font-extrabold text-white">極上 MASTER</Text>
                  </View>
                )}
              </View>

              {/* Progress counter */}
              <View className="flex-row items-center gap-1.5 mt-3">
                <Text className="text-xs font-bold text-white">{current.meaning}</Text>
                <Text className="text-xs text-purple-400">· {current.romaji}</Text>
                <View className="rounded-full bg-slate-800 px-2 py-0.5 ml-1">
                  <Text className="text-[10px] text-slate-300">
                    Strokes: {drawnStrokes.length} / {current.strokes}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stroke Step-by-Step Instructions */}
            <View className="rounded-2xl border border-slate-800 bg-slate-900 p-4 mb-4">
              <Text className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                Stroke Order Breakdown (筆順)
              </Text>
              <View className="gap-2">
                {current.strokeSteps.map((stepText, sIdx) => {
                  const isDrawn = drawnStrokes.includes(sIdx + 1);
                  const isCurrent = currentStepIndex === sIdx && !isFinished;
                  return (
                    <View
                      key={sIdx}
                      className={`flex-row items-center justify-between rounded-xl p-2.5 border ${
                        isDrawn
                          ? 'border-emerald-500/40 bg-emerald-950/20'
                          : isCurrent
                          ? 'border-purple-500/60 bg-purple-950/30'
                          : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          isDrawn
                            ? 'text-emerald-300 font-medium line-through'
                            : isCurrent
                            ? 'text-purple-200 font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {stepText}
                      </Text>
                      {isDrawn ? (
                        <CheckCircle2 size={14} color="#34d399" />
                      ) : isCurrent ? (
                        <Text className="text-[10px] text-purple-400 font-bold">NEXT</Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Mnemonic Insight */}
            <View className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 mb-4">
              <Text className="text-[11px] font-bold text-amber-300 mb-1">
                Visual Mnemonic & Radical ({current.radical})
              </Text>
              <Text className="text-xs text-slate-300 italic leading-relaxed">
                “{current.mnemonic}”
              </Text>
            </View>

            {/* Action Buttons */}
            {!isFinished ? (
              <Pressable
                onPress={handleDrawStroke}
                className="flex-row items-center justify-center gap-2 rounded-2xl bg-purple-600 py-3.5 mb-3 active:bg-purple-700"
              >
                <PenTool size={16} color="#ffffff" />
                <Text className="text-xs font-bold text-white">
                  Draw Stroke {drawnStrokes.length + 1} with Ink Brush 🖌️
                </Text>
              </Pressable>
            ) : (
              <View>
                {!rewardClaimed ? (
                  <Pressable
                    onPress={handleClaimMastery}
                    className="flex-row items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 mb-3 active:bg-amber-600"
                  >
                    <Award size={16} color="#451a03" />
                    <Text className="text-xs font-bold text-amber-950">
                      Seal Calligraphy Scroll (+30 ✨)
                    </Text>
                  </Pressable>
                ) : (
                  <View className="rounded-xl bg-emerald-950/60 p-3 border border-emerald-500/30 items-center mb-3">
                    <Text className="text-xs font-bold text-emerald-300">
                      Scroll archived to Memory Museum & +30 Sparkles awarded!
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={handleReset}
                  className="flex-row items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2.5 mb-6"
                >
                  <RotateCcw size={13} color="#94a3b8" />
                  <Text className="text-xs text-slate-300">Practice Again</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
