import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocalStore } from '../../../lib/localStore';
import { EconomyEngine } from '../../../engines/economy/economyEngine';
import { Sparkles, X, Calendar, CheckCircle2 } from 'lucide-react-native';

interface SeasonalFestivalModalProps { visible: boolean; onClose: () => void; }
interface FestivalData { id: string; name: string; season: 'spring' | 'summer' | 'autumn' | 'winter'; japaneseName: string; icon: string; description: string; tradition: string; vocabTerms: { kanji: string; romaji: string; meaning: string }[]; rewardStamp: string; }
const FESTIVALS: FestivalData[] = [
  { id: 'fest-spring', name: 'Sakura Hanami Blossom Festival', season: 'spring', japaneseName: '花見 (Hanami)', icon: '🌸', description: 'Celebrating the transient beauty of cherry blossoms in full bloom under the sunlit cedar groves.', tradition: 'Gathering under blossom trees for tea, sweets, and composing spring waka poetry with Cassidy.', vocabTerms: [{ kanji: '桜 (Sakura)', romaji: 'Sa-ku-ra', meaning: 'Cherry Blossom' }, { kanji: '花見 (Hanami)', romaji: 'Ha-na-mi', meaning: 'Flower Viewing Picnic' }, { kanji: '満開 (Mankai)', romaji: 'Man-kai', meaning: 'Full Bloom' }], rewardStamp: '🌸 Sakura Blossom Crest' },
  { id: 'fest-summer', name: 'Tanabata Star Festival', season: 'summer', japaneseName: '七夕 (Tanabata)', icon: '🎋', description: 'Celebrating the celestial meeting of deities Orihime and Hikoboshi across the starry Milky Way.', tradition: 'Writing heartfelt learning wishes on colorful paper strips (Tanzaku) and hanging them on bamboo branches.', vocabTerms: [{ kanji: '短冊 (Tanzaku)', romaji: 'Tan-za-ku', meaning: 'Wish Paper Strips' }, { kanji: '天の川 (Amanogawa)', romaji: 'A-ma-no-ga-wa', meaning: 'Milky Way' }, { kanji: '星 (Hoshi)', romaji: 'Ho-shi', meaning: 'Star' }], rewardStamp: '⭐ Tanabata Celestial Star' },
  { id: 'fest-autumn', name: 'Momijigari Autumn Maple Harvest', season: 'autumn', japaneseName: '紅葉狩り (Momijigari)', icon: '🍁', description: 'The mountains of Emerald Valley turn vibrant crimson and gold as autumn evening lanterns are lit.', tradition: 'Enjoying hot roasted sweet potatoes (Yaki-imo) with Barista Ren while reading folklore scrolls.', vocabTerms: [{ kanji: '紅葉 (Momiji)', romaji: 'Mo-mi-ji', meaning: 'Red Autumn Maple Leaves' }, { kanji: '焼き芋 (Yaki-imo)', romaji: 'Ya-ki-i-mo', meaning: 'Roasted Sweet Potato' }, { kanji: '秋 (Aki)', romaji: 'A-ki', meaning: 'Autumn' }], rewardStamp: '🍁 Crimson Maple Leaf' },
  { id: 'fest-winter', name: 'Snow Lantern Matsuri', season: 'winter', japaneseName: '雪灯籠 (Yukidourou)', icon: '❄️', description: 'Stone paths and garden bridges are blanketed in pure snow, softly lit by candlelit snow lanterns.', tradition: 'Drinking hot roasted green tea (Hojicha) in the sunlit study while watching snowfall outside.', vocabTerms: [{ kanji: '雪 (Yuki)', romaji: 'Yu-ki', meaning: 'Snow' }, { kanji: '灯籠 (Tourou)', romaji: 'Tou-rou', meaning: 'Stone Lantern' }, { kanji: '冬 (Fuyu)', romaji: 'Fu-yu', meaning: 'Winter' }], rewardStamp: '❄️ Winter Snow Lantern' },
];

export function SeasonalFestivalModal({ visible, onClose }: SeasonalFestivalModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [celebrated, setCelebrated] = useState<Record<string, boolean>>({});
  const current = FESTIVALS[selectedIdx];
  const isCelebrated = Boolean(celebrated[current.id]);

  const handleCelebrate = async () => {
    const claim = await EconomyEngine.claimSparkles(`world:festival:${current.id}`, 40, `Celebrated ${current.name}`);
    setCelebrated((prev) => ({ ...prev, [current.id]: true }));
    if (!claim.claimed) return;
    await LocalStore.addCreation({ type: 'postcard', title: `Festival Memory: ${current.name}`, subtitle: `${current.japaneseName} (${current.season.toUpperCase()})`, content: current.tradition, visualTheme: current.season === 'spring' ? 'emerald' : current.season === 'summer' ? 'indigo' : 'warm', tags: ['Festival', current.season, current.japaneseName] });
    await LocalStore.addMemory('world', `Celebrated the ${current.name} in Emerald Valley with Cassidy and residents.`);
  };

  return <Modal visible={visible} animationType="slide" transparent><View className="flex-1 bg-black/80 justify-end"><SafeAreaView className="h-[90%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
    <View className="flex-row items-center justify-between pb-3 border-b border-slate-800"><View className="flex-row items-center gap-2"><Calendar size={18} color="#f472b6" /><View><Text className="text-base font-bold text-white">Seasonal Festivals & Matsuri</Text><Text className="text-[10px] text-pink-400">Emerald Valley Calendar & Traditions</Text></View></View><Pressable onPress={onClose} className="h-8 w-8 items-center justify-center rounded-full bg-slate-800"><X size={16} color="#94a3b8" /></Pressable></View>
    <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4"><View className="flex-row gap-2">{FESTIVALS.map((fest, idx) => <Pressable key={fest.id} onPress={() => setSelectedIdx(idx)} className={`flex-row items-center gap-1.5 rounded-2xl border p-3 ${selectedIdx === idx ? 'border-pink-500 bg-pink-950/40' : 'border-slate-800 bg-slate-900'}`}><Text className="text-xl">{fest.icon}</Text><View><Text className={`text-xs font-bold ${selectedIdx === idx ? 'text-white' : 'text-slate-300'}`}>{fest.japaneseName}</Text><Text className="text-[10px] text-slate-400 capitalize">{fest.season}</Text></View></Pressable>)}</View></ScrollView>
      <View className="rounded-3xl border border-pink-500/40 bg-gradient-to-br from-pink-950/40 to-slate-900 p-5 mb-4"><View className="flex-row items-center justify-between mb-2"><Text className="text-4xl">{current.icon}</Text><View className="rounded-full bg-pink-500/20 px-3 py-1 border border-pink-500/40"><Text className="text-[10px] font-bold text-pink-300 capitalize">{current.season} Season</Text></View></View><Text className="text-lg font-bold text-white mb-0.5">{current.name}</Text><Text className="text-xs font-semibold text-pink-300 mb-2">{current.japaneseName}</Text><Text className="text-xs text-slate-300 leading-relaxed mb-3">{current.description}</Text><View className="rounded-2xl bg-slate-950/60 p-3 border border-pink-500/20"><Text className="text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1">Living Tradition</Text><Text className="text-xs text-slate-200 italic leading-relaxed">“{current.tradition}”</Text></View></View>
      <View className="rounded-2xl border border-slate-800 bg-slate-900 p-4 mb-4"><Text className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Seasonal Vocabulary (季節の言葉)</Text><View className="gap-2">{current.vocabTerms.map((term, vIdx) => <View key={vIdx} className="flex-row items-center justify-between rounded-xl bg-slate-950 p-2.5 border border-slate-800"><View><Text className="text-xs font-bold text-white">{term.kanji}</Text><Text className="text-[10px] text-slate-400">{term.romaji}</Text></View><Text className="text-xs text-amber-300 font-semibold">{term.meaning}</Text></View>)}</View></View>
      {!isCelebrated ? <Pressable onPress={handleCelebrate} className="flex-row items-center justify-center gap-2 rounded-2xl bg-pink-600 py-3.5 mb-6 active:bg-pink-700"><Sparkles size={16} color="#ffffff" /><Text className="text-xs font-bold text-white">Join Festival & Claim {current.rewardStamp} (+40 ✨)</Text></Pressable> : <View className="rounded-2xl bg-emerald-950/60 p-4 border border-emerald-500/30 items-center mb-6"><CheckCircle2 size={24} color="#34d399" /><Text className="text-xs font-bold text-emerald-300 mt-1">Festival Celebrated! +40 Sparkles & Postcard added to Museum.</Text></View>}
    </ScrollView>
  </SafeAreaView></View></Modal>;
}
