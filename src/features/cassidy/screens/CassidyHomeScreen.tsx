import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../services/auth';
import { livingWorldObjectsStore } from '../../../engines/world/livingWorldObjectsStore';
import { Cassidy, CassidyMood } from '../../../characters/cassidy';
import { Radio, BookOpen } from 'lucide-react-native';

type Action = 'idle' | 'talking' | 'waving';
type Period = 'morning' | 'afternoon' | 'evening' | 'night';

function resolvePeriod(): Period {
  const h = new Date().getHours();
  if (h < 5) return 'night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 20) return 'evening';
  return 'night';
}

const THEME: Record<Period, { wall: string; sky: string; orb: string; orbRight: number; orbTop: number; lamp: number; word: string }> = {
  morning: { wall: '#3a3357', sky: '#fde6b8', orb: '#fff0c0', orbRight: -3, orbTop: 3, lamp: 0.08, word: 'morning' },
  afternoon: { wall: '#473a63', sky: '#cfe8f7', orb: '#fff6d8', orbRight: 6, orbTop: -2, lamp: 0.04, word: 'afternoon' },
  evening: { wall: '#3a2c4d', sky: '#f7c79b', orb: '#ffd9a0', orbRight: 8, orbTop: 6, lamp: 0.32, word: 'evening' },
  night: { wall: '#241d38', sky: '#33406b', orb: '#dfe6ff', orbRight: 10, orbTop: 2, lamp: 0.5, word: 'night' },
};

// Real Cassidy artwork. This proof intentionally uses the authored companion image;
// it does not pretend a flattened image contains independently animatable body parts.
const CASSIDY_COMPANION = require('../../../../cassidy_canonical_companion.jpg');

export function CassidyHomeScreen() {
  const [objects, setObjects] = useState<any[]>([]);
  const [action, setAction] = useState<Action>('idle');
  const [mood, setMood] = useState<CassidyMood>('warm');
  const [speech, setSpeech] = useState<string | null>(Cassidy.pickGreeting());
  const [period, setPeriod] = useState<Period>(resolvePeriod);
  const livingMotion = useRef(new Animated.Value(0)).current;
  const scenePulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const user = await auth.getCurrentUser();
        const userId = user?.id ?? 'local-explorer-user';
        await livingWorldObjectsStore.migrateLegacyLocalState(userId);
        const next = await livingWorldObjectsStore.getAll(userId);
        if (active) setObjects(next);
      } catch {
        if (active) setObjects([]);
      }
    };
    void refresh();
    const id = setInterval(() => void refresh(), 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const sync = () => setPeriod(resolvePeriod());
    sync();
    const id = setInterval(sync, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const motion = Animated.loop(
      Animated.sequence([
        Animated.timing(livingMotion, { toValue: 1, duration: 3600, useNativeDriver: true }),
        Animated.timing(livingMotion, { toValue: 0, duration: 3600, useNativeDriver: true }),
      ]),
    );
    motion.start();
    return () => motion.stop();
  }, [livingMotion]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scenePulse, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(scenePulse, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scenePulse]);

  useEffect(() => {
    const id = setInterval(() => {
      setAction((current) => {
        if (current !== 'idle' || Math.random() >= 0.5) return current;
        setTimeout(() => setAction('idle'), 2200);
        return 'waving';
      });
    }, 9000);
    return () => clearInterval(id);
  }, []);

  const t = THEME[period];
  const bonsai = objects.find((o) => o.id === 'living-bonsai');
  const radio = objects.find((o) => o.id === 'living-radio');
  const bonsaiSize = 46 + (bonsai ? Math.round((bonsai.growth / 100) * 34) : 0);
  const imageLift = livingMotion.interpolate({ inputRange: [0, 1], outputRange: [3, -3] });
  const imageScale = livingMotion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] });
  const sceneGlowOpacity = scenePulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.18] });
  const screenWidth = Dimensions.get('window').width;
  const artworkWidth = Math.min(Math.max(screenWidth - 24, 300), 560);
  const artworkHeight = artworkWidth * (768 / 1376);

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
          <View className="absolute inset-0" style={{ backgroundColor: t.wall }} />
          <View className="absolute bottom-0 left-0 right-0 h-[42%] bg-[#4a3a2c]" />

          <View
            className="absolute left-5 right-5 top-5 overflow-hidden rounded-[28px] border border-emerald-300/20 bg-black/20"
            style={{ height: artworkHeight + 2, alignSelf: 'center', width: artworkWidth }}
          >
            <Animated.Image
              accessibilityLabel="Cassidy companion scene"
              source={CASSIDY_COMPANION}
              resizeMode="cover"
              style={{
                width: artworkWidth,
                height: artworkHeight,
                transform: [{ translateY: imageLift }, { scale: imageScale }],
              }}
            />
            <Animated.View
              pointerEvents="none"
              className="absolute inset-0 bg-emerald-300"
              style={{ opacity: sceneGlowOpacity }}
            />
            <View pointerEvents="none" className="absolute inset-0 rounded-[28px] border border-white/10" />
          </View>

          <View className="absolute right-5 top-7 flex-row items-end gap-3 rounded-xl bg-[#5b4636]/90 px-3 py-2">
            <View className="items-center">
              <BookOpen size={16} color="#cbb89a" />
              <Text className="mt-0.5 text-[8px] text-[#cbb89a]">books</Text>
            </View>
            <Pressable onPress={() => say('Oh — the radio is playing your favorite track. I left it on for you.', 'talking', 'warm')} className="items-center">
              <Radio size={16} color={radio ? '#34d399' : '#8a7a66'} />
              <Text className="mt-0.5 text-[8px] text-[#cbb89a]">radio</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => say(Cassidy.lineFor('happy'), 'waving', 'happy')}
            className="absolute left-1/2 items-center"
            style={{ top: artworkHeight + 38, width: Math.min(screenWidth - 40, 520), transform: [{ translateX: -Math.min(screenWidth - 40, 520) / 2 }] }}
          >
            {speech && (
              <View className="mb-2 max-w-[280px] rounded-2xl rounded-bl-sm border border-emerald-400/30 bg-emerald-950/90 px-4 py-2.5 shadow-lg">
                <Text className="text-[12px] italic leading-5 text-emerald-100">{speech}</Text>
              </View>
            )}
            <View className="rounded-full border border-emerald-300/20 bg-emerald-950/30 px-4 py-1.5">
              <Text className="text-[11px] font-semibold text-emerald-300">Cassidy · {action === 'talking' ? 'speaking' : action === 'waving' ? 'greeting you' : 'here with you'}</Text>
            </View>
            <Text className="mt-1 text-[9px] text-slate-400">{t.word} · tap Cassidy to say hello</Text>
          </Pressable>

          <Pressable
            onPress={() => say(bonsai ? `The bonsai is at ${bonsai.growth}% now. It grows a little as our world changes.` : 'I keep a little bonsai here. It grows when you practice.', 'talking', 'warm')}
            className="absolute bottom-28 left-8 items-center"
          >
            <View className="items-center justify-end rounded-t-full bg-[#3f6b3f]" style={{ width: bonsaiSize, height: bonsaiSize * 0.7 }} />
            <View className="mt-1 h-5 w-8 rounded-b-md bg-[#7a4a2c]" />
            <Text className="mt-1 text-[8px] text-emerald-200">bonsai {bonsai ? `${bonsai.growth}%` : ''}</Text>
          </Pressable>

          <View className="absolute right-10 top-40 h-24 w-24 rounded-full bg-amber-300" style={{ opacity: t.lamp }} pointerEvents="none" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
