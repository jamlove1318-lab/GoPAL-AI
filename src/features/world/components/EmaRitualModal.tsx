import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocalStore } from '../../../lib/localStore';
import { EconomyEngine } from '../../../engines/economy/economyEngine';
import { Sparkles, X, Heart, Check, Plus } from 'lucide-react-native';

interface EmaRitualModalProps {
  visible: boolean;
  onClose: () => void;
}

const EMA_PATTERNS = [
  { id: 'cedar', name: 'Sunlit Cedar', icon: '🌲', kanji: '成長', theme: 'border-emerald-500' },
  { id: 'moon', name: 'Moonlit Night', icon: '🌙', kanji: '希望', theme: 'border-indigo-500' },
  { id: 'blossom', name: 'Cherry Blossom', icon: '🌸', kanji: '友情', theme: 'border-rose-500' },
];

export function EmaRitualModal({ visible, onClose }: EmaRitualModalProps) {
  const [selectedPattern, setSelectedPattern] = useState(EMA_PATTERNS[0]);
  const [wishText, setWishText] = useState('');
  const [hung, setHung] = useState(false);

  const handleHangEma = async () => {
    if (!wishText.trim()) return;
    setHung(true);

    // Add creation to Memory Museum
    await LocalStore.addCreation({
      type: 'postcard',
      title: `Ema Prayer: ${selectedPattern.name}`,
      subtitle: `Inscribed at Moonlit Zen Garden (${selectedPattern.kanji})`,
      content: wishText.trim(),
      visualTheme: selectedPattern.id === 'cedar' ? 'emerald' : selectedPattern.id === 'moon' ? 'indigo' : 'warm',
      tags: ['Ema', 'Zen Garden', 'Wish'],
    });

    // Add canonical memory
    await LocalStore.addMemory(
      'world',
      `Inscribed an Ema wooden wish plaque at the Moonlit Zen Garden: "${wishText.trim()}".`
    );

    // Award sparkles
    await EconomyEngine.awardSparkles(25, 'Hung Ema wish plaque at Zen Garden');
  };

  const handleReset = () => {
    setWishText('');
    setHung(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <SafeAreaView className="h-[88%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl">🎋</Text>
              <View>
                <Text className="text-base font-bold text-white">Ema Wish Hanging (絵馬)</Text>
                <Text className="text-[10px] text-amber-400">Moonlit Zen Garden Ritual</Text>
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
            {!hung ? (
              <View>
                <Text className="text-xs text-slate-300 leading-relaxed mb-4">
                  Inscribe your learning goal, dedication, or heartfelt gratitude upon a wooden votive plaque. Hang it under the sacred cedar eaves of the Moonlit Zen Garden.
                </Text>

                {/* Pattern Selection */}
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  1. Select Plaque Carving
                </Text>
                <View className="flex-row gap-2.5 mb-4">
                  {EMA_PATTERNS.map((pat) => (
                    <Pressable
                      key={pat.id}
                      onPress={() => setSelectedPattern(pat)}
                      className={`flex-1 items-center rounded-2xl border p-3 ${
                        selectedPattern.id === pat.id
                          ? `${pat.theme} bg-slate-900`
                          : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <Text className="text-2xl mb-1">{pat.icon}</Text>
                      <Text className="text-xs font-bold text-white">{pat.name}</Text>
                      <Text className="text-[10px] text-amber-400 mt-0.5">{pat.kanji}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* Wish Input */}
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  2. Inscribe Your Learning Wish
                </Text>
                <TextInput
                  value={wishText}
                  onChangeText={setWishText}
                  placeholder="e.g. In 3 months, I want to talk freely in Japanese about art and tea with Cassidy and friends..."
                  placeholderTextColor="#64748b"
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs text-white leading-relaxed mb-5 min-h-[90px]"
                  multiline
                />

                {/* Submit */}
                <Pressable
                  onPress={handleHangEma}
                  disabled={!wishText.trim()}
                  className={`flex-row items-center justify-center gap-2 rounded-2xl py-3.5 ${
                    wishText.trim()
                      ? 'bg-amber-500 active:bg-amber-600'
                      : 'bg-slate-800 opacity-50'
                  }`}
                >
                  <Sparkles size={16} color="#451a03" />
                  <Text className="text-xs font-bold text-amber-950">
                    Hang Plaque & Bless Wish (+25 ✨)
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="items-center py-4">
                <View className="w-full rounded-2xl border border-amber-500/40 bg-amber-950/20 p-5 items-center mb-4">
                  <Text className="text-5xl mb-2">{selectedPattern.icon}</Text>
                  <Text className="text-base font-bold text-amber-300">
                    {selectedPattern.name} Plaque Hung
                  </Text>
                  <Text className="text-xs italic text-slate-200 text-center mt-3 px-2 leading-relaxed">
                    “{wishText}”
                  </Text>

                  {/* Cassidy Blessing */}
                  <View className="mt-4 rounded-xl bg-indigo-950/50 p-3 border border-indigo-500/30 w-full">
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <Heart size={12} color="#f43f5e" />
                      <Text className="text-[10px] font-bold text-indigo-300">Cassidy's Blessing</Text>
                    </View>
                    <Text className="text-xs text-slate-300 italic leading-relaxed">
                      “The garden wind whispers gently through the cedar trees. I promise to support you every step of this journey!”
                    </Text>
                  </View>
                </View>

                <View className="rounded-xl bg-emerald-950/60 p-3 border border-emerald-500/30 items-center w-full mb-3">
                  <Text className="text-xs font-bold text-emerald-300">
                    +25 Sparkles earned & memory recorded! ✨
                  </Text>
                </View>

                <Pressable
                  onPress={handleReset}
                  className="rounded-xl bg-slate-800 py-2.5 px-6"
                >
                  <Text className="text-xs text-slate-300">Inscribe Another Wish</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
