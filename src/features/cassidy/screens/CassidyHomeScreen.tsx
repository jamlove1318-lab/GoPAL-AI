import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WaveStore } from '../../../lib/waveStore';
import { Cassidy, CassidyMood } from '../../../characters/cassidy';
import { CassidyCharacter } from '../../../components/CassidyCharacter';
import { Radio, BookOpen } from 'lucide-react-native';

type Action = 'idle' | 'talking' | 'waving';

const PERIOD = (() => {
  const h = new Date().getHours();
  if (h < 5) return 'night' as const;
  if (h < 12) return 'morning' as const;
  if (h < 17) return 'afternoon' as const;
  if (h < 20) return 'evening' as const;
  return 'night' as const;
})();

const THEME: Record<typeof PERIOD, { wall: string; sky: string; orb: string; orbRight: number; orbTop: number; lamp: number; word: string }> = {
  morning: { wall: '#3a3357', sky: '#fde6b8', orb: '#fff0c0', orbRight: -3, orbTop: 3, lamp: 0.08, word: 'morning' },
  afternoon: { wall: '#473a63', sky: '#cfe8f7', orb: '#fff6d8', orbRight: 6, orbTop: -2, lamp: 0.04, word: 'afternoon' },
  evening: { wall: '#3a2c4d', sky: '#f7c79b', orb: '#ffd9a0', orbRight: 8, orbTop: 6, lamp: 0.32, word: 'evening' },
  night: { wall: '#241d38', sky: '#33406b', orb: '#dfe6ff', orbRight: 10, orbTop: 2, lamp: 0.5, word: 'night' },
};

export function CassidyHomeScreen() {
  const [objects, setObjects] = useState<any[]>([]);
  const [action, setAction] = useState<Action>('idle');
  const [mood, setMood] = useState<CassidyMood>('warm');
  const [speech, setSpeech] = useState<string | null>(Cassidy.pickGreeting());

  useEffect(() => {
    WaveStore.getLivingObjects().then(setObjects);
  }, []);

  // Ambient life: every so often she glances up and gives a little wave.
  useEffect(() => {
    const id = setInterval(() => {
      if (action === 'idle' && Math.random() < 0.5) {
        setAction('waving');
        setTimeout(() => setAction('idle'), 2200);
      }
    }, 9000);
    return () => clearInterval(id);
  }, [action]);

  const t = THEME[PERIOD];

  const bonsai = objects.find((o) => o.id === 'living-bonsai');
  const radio = objects.find((o) => o.id === 'living-radio');
  const bonsaiSize = 46 + (bonsai ? Math.round((bonsai.growth / 100) * 34) : 0);

  const say = (line: string, act: Action = 'talking', m: CassidyMood = 'happy') => {
    setSpeech(line);
    setMood(m);
    setAction(act);
    if (act === 'waving') setTimeout(() => setAction('idle'), 2200);
    if (act === 'talking') setTimeout(() => setAction('idle'), 2800);
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="relative" style={{ minHeight: Dimensions.get('window').height - 160 }}>
          {/* Wall */}
          <View className="h-[58%]" style={{ backgroundColor: t.wall }} />
          {/* Floor (wood) */}
          <View className="h-[42%] bg-[#4a3a2c]" />

          {/* Window with the sky of this hour */}
          <View
            className="absolute left-6 top-10 h-36 w-28 overflow-hidden rounded-2xl border-2 border-[#6b5a8a]"
            style={{ backgroundColor: t.sky }}
          >
            <View
              className="absolute h-10 w-10 rounded-full opacity-90"
              style={{ right: t.orbRight, top: t.orbTop, backgroundColor: t.orb }}
            />
            <View className="absolute bottom-0 left-0 right-0 h-10 bg-[#b9d6e8] opacity-50" />
            <View className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#6b5a8a] opacity-60" />
            <View className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#6b5a8a] opacity-60" />
          </View>

          {/* Wall shelf with her things */}
          <View className="absolute right-5 top-12 flex-row items-end gap-3 rounded-xl bg-[#5b4636] px-3 py-2">
            <View className="items-center">
              <BookOpen size={16} color="#cbb89a" />
              <Text className="mt-0.5 text-[8px] text-[#cbb89a]">books</Text>
            </View>
            <Pressable
              onPress={() => say('Oh — the radio’s playing your favorite track. I left it on for you.', 'talking', 'warm')}
              className="items-center"
            >
              <Radio size={16} color={radio ? '#34d399' : '#8a7a66'} />
              <Text className="mt-0.5 text-[8px] text-[#cbb89a]">radio</Text>
            </Pressable>
          </View>

          {/* Floor rug */}
          <View className="absolute bottom-24 left-1/2 h-6 w-72 -translate-x-1/2 rounded-full bg-[#6b4f8a] opacity-50" />

          {/* Bonsai — grows with the learner's sessions */}
          <Pressable
            onPress={() => say(bonsai ? `The bonsai’s at ${bonsai.growth}% now. It grows a little every time you visit.` : 'I keep a little bonsai here. It grows when you practice.', 'talking', 'warm')}
            className="absolute bottom-28 left-8 items-center"
          >
            <View className="items-center justify-end rounded-t-full bg-[#3f6b3f]" style={{ width: bonsaiSize, height: bonsaiSize * 0.7 }} />
            <View className="mt-1 h-5 w-8 rounded-b-md bg-[#7a4a2c]" />
            <Text className="mt-1 text-[8px] text-emerald-200">bonsai {bonsai ? `${bonsai.growth}%` : ''}</Text>
          </Pressable>

          {/* Cassidy, living here */}
          <View className="absolute bottom-16 left-1/2 -translate-x-1/2 items-center">
            {speech && (
              <View className="mb-2 max-w-[240px] rounded-2xl rounded-bl-sm border border-emerald-500/30 bg-emerald-900/85 px-3 py-2">
                <Text className="text-[12px] italic text-emerald-100">{speech}</Text>
              </View>
            )}
            <Pressable onPress={() => say(Cassidy.lineFor('happy'), 'waving', 'happy')} className="active:opacity-80">
              <CassidyCharacter height={230} action={action} speaking={action === 'talking'} expression={mood} />
            </Pressable>
            <Text className="mt-1 text-[11px] font-semibold text-emerald-300">Cassidy</Text>
            <Text className="text-[9px] text-slate-400">tap her to say hello</Text>
          </View>

          {/* Lamp glow — brighter after dark */}
          <View
            className="absolute right-10 top-40 h-24 w-24 rounded-full bg-amber-300"
            style={{ opacity: t.lamp }}
            pointerEvents="none"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
