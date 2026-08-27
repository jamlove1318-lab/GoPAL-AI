import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocalStore } from '../../../lib/localStore';
import { EconomyEngine } from '../../../engines/economy/economyEngine';
import { X, Award, RotateCcw } from 'lucide-react-native';

interface MatchaCraftingModalProps { visible: boolean; onClose: () => void; }

export function MatchaCraftingModal({ visible, onClose }: MatchaCraftingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [foamLevel, setFoamLevel] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const resetGame = () => { setStep(1); setFoamLevel(0); setRewardClaimed(false); };
  const handleWhiskTap = () => { if (step !== 3) return; const nextFoam = Math.min(100, foamLevel + 15); setFoamLevel(nextFoam); if (nextFoam >= 100) setStep(4); };

  const handleClaimReward = async () => {
    if (rewardClaimed) return;
    const claim = await EconomyEngine.claimSparkles('learning:matcha:usucha-mastery', 35, 'Crafted artisan matcha bowl at Café Komorebi');
    setRewardClaimed(true);
    if (!claim.claimed) return;
    await LocalStore.addPostcard({ title: 'Artisan Matcha Masterwork', locationKey: 'cozy_cafe', locationName: 'Café Komorebi', cassidyNote: 'You created a beautifully aerated Usucha matcha with silky microfoam!', imageTheme: 'emerald' });
    await LocalStore.addMemory('learning', 'Mastered the traditional matcha whisking ritual (Usucha) with Barista Ren.');
  };

  return <Modal visible={visible} animationType="slide" transparent><View className="flex-1 bg-black/80 justify-end"><SafeAreaView className="h-[88%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
    <View className="flex-row items-center justify-between pb-3 border-b border-slate-800"><View className="flex-row items-center gap-2"><Text className="text-xl">🍵</Text><View><Text className="text-base font-bold text-white">Artisan Matcha Workshop</Text><Text className="text-[10px] text-emerald-400">Café Komorebi Daily Arts</Text></View></View><Pressable onPress={onClose} className="h-8 w-8 items-center justify-center rounded-full bg-slate-800"><X size={16} color="#94a3b8" /></Pressable></View>
    <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
      {step === 1 && <View className="items-center py-6"><Text className="text-5xl mb-4">🎋</Text><Text className="text-base font-bold text-white mb-1">Step 1: Measure Ceremonial Matcha</Text><Text className="text-xs text-slate-300 text-center px-4 leading-relaxed mb-6">Use the curved bamboo scoop (<Text className="text-emerald-300 font-semibold">Chashaku 茶杓</Text>) to measure two delicate scoops of stone-ground green tea into the ceramic chawan.</Text><Pressable onPress={() => setStep(2)} className="rounded-2xl bg-emerald-600 px-6 py-3 active:bg-emerald-500"><Text className="text-xs font-bold text-white">Scoop Matcha Powder ✨</Text></Pressable></View>}
      {step === 2 && <View className="items-center py-6"><Text className="text-5xl mb-4">🫖</Text><Text className="text-base font-bold text-white mb-1">Step 2: Pour 80°C Hot Spring Water</Text><Text className="text-xs text-slate-300 text-center px-4 leading-relaxed mb-6">Pour 70ml of hot water. Barista Ren notes: Boiling water scorches the sweet amino acids (L-theanine); 80°C unlocks a smooth umami aroma.</Text><Pressable onPress={() => setStep(3)} className="rounded-2xl bg-blue-600 px-6 py-3 active:bg-blue-500"><Text className="text-xs font-bold text-white">Pour Hot Water 💧</Text></Pressable></View>}
      {step === 3 && <View className="items-center py-4"><Text className="text-5xl mb-3">🥢</Text><Text className="text-base font-bold text-white mb-1">Step 3: Whisk in Rapid "W" Motion</Text><Text className="text-xs text-slate-400 text-center mb-4">Tap the whisk rapidly to aerate the matcha and create velvety microfoam (<Text className="text-emerald-300">泡 Awa</Text>)!</Text><View className="w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-4 border border-slate-700"><View className="h-full bg-emerald-500 rounded-full" style={{ width: `${foamLevel}%` }} /></View><Text className="text-xs font-bold text-emerald-300 mb-6">Foam Density: {foamLevel}%</Text><Pressable onPress={handleWhiskTap} className="h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-400 active:scale-95 active:bg-emerald-500/40"><Text className="text-xs font-extrabold text-emerald-300 text-center">TAP TO{'\n'}WHISK!</Text></Pressable></View>}
      {step === 4 && <View className="py-2"><View className="items-center rounded-2xl bg-emerald-950/40 p-5 border border-emerald-500/40 mb-4"><Text className="text-5xl mb-2">🍵</Text><Text className="text-lg font-bold text-emerald-300">Perfect Usucha (Thin Tea) Crafted!</Text><Text className="text-xs text-slate-300 text-center mt-2 leading-relaxed">“Magnificent wrist movement! Look at that bright jade micro-foam without a single bubble broken.” — <Text className="font-semibold text-white">Barista Ren</Text></Text></View><View className="rounded-2xl bg-slate-900 p-4 border border-slate-800 mb-4"><Text className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Vocabulary Mastered</Text><View className="gap-2"><View className="flex-row justify-between"><Text className="text-xs text-white">茶筅 (Chasen)</Text><Text className="text-xs text-slate-400">Bamboo Whisk</Text></View><View className="flex-row justify-between"><Text className="text-xs text-white">茶碗 (Chawan)</Text><Text className="text-xs text-slate-400">Ceramic Tea Bowl</Text></View><View className="flex-row justify-between"><Text className="text-xs text-white">薄茶 (Usucha)</Text><Text className="text-xs text-slate-400">Light Frothy Matcha</Text></View></View></View>{!rewardClaimed ? <Pressable onPress={handleClaimReward} className="flex-row items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 mb-3 active:bg-amber-600"><Award size={16} color="#451a03" /><Text className="text-xs font-bold text-amber-950">Claim +35 Sparkles & Museum Postcard ✨</Text></Pressable> : <View className="rounded-xl bg-emerald-950/60 p-3 border border-emerald-500/30 items-center mb-3"><Text className="text-xs font-bold text-emerald-300">Mastery reward has been recorded for this workshop. ✨</Text></View>}<Pressable onPress={resetGame} className="flex-row items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2.5"><RotateCcw size={13} color="#94a3b8" /><Text className="text-xs text-slate-300">Brew Another Bowl</Text></Pressable></View>}
    </ScrollView>
  </SafeAreaView></View></Modal>;
}
