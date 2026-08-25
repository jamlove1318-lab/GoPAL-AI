import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { MapPin, Sparkles, Compass } from 'lucide-react-native';

interface WorldThresholdModalProps {
  visible: boolean;
  fromLocationName: string;
  toLocationName: string;
  toLocationKey: string;
  onTransitionComplete: () => void;
}

const LOCATION_LORE: Record<string, { subtitle: string; cassidyQuote: string; theme: string }> = {
  study_room: {
    subtitle: 'The Sanctuary of Quiet Knowledge',
    cassidyQuote: 'Welcome back to our study room. The tea is warm and the books are waiting.',
    theme: 'emerald',
  },
  cozy_cafe: {
    subtitle: 'A Warm Meeting Place by the Stream',
    cassidyQuote: 'Ren is steaming matcha milk. Listen to the gentle conversation around the bar.',
    theme: 'amber',
  },
  whispering_library: {
    subtitle: 'Ancient Cedar Shelves & Folktale Scrolls',
    cassidyQuote: 'Shh... the whisper of paper scrolls reveals old trails and forgotten idioms.',
    theme: 'indigo',
  },
  lantern_market: {
    subtitle: 'Glowing Evening Stalls & Street Delicacies',
    cassidyQuote: 'Look at the lanterns lighting up! Kenji is welcoming evening shoppers.',
    theme: 'rose',
  },
  zen_garden: {
    subtitle: 'Moonlit Stepping Stones & Bamboo Groves',
    cassidyQuote: 'Take a deep breath here. The filtered moonlight is serene.',
    theme: 'purple',
  },
};

export function WorldThresholdModal({
  visible,
  fromLocationName,
  toLocationName,
  toLocationKey,
  onTransitionComplete,
}: WorldThresholdModalProps) {
  const [step, setStep] = useState(0); // 0: departing, 1: arriving

  useEffect(() => {
    if (visible) {
      setStep(0);
      const t1 = setTimeout(() => setStep(1), 600);
      const t2 = setTimeout(() => {
        onTransitionComplete();
      }, 1800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [visible]);

  if (!visible) return null;

  const lore = LOCATION_LORE[toLocationKey] || {
    subtitle: 'A New Corner of Emerald Valley',
    cassidyQuote: 'Let us explore this place together!',
    theme: 'emerald',
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 items-center justify-center bg-black/90 p-6">
        <View className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-950 p-6 items-center">
          {/* Compass Animation */}
          <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-500/40 mb-4">
            <Compass size={32} color="#34d399" />
          </View>

          <Text className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
            World Threshold Crossing
          </Text>

          <Text className="text-xl font-extrabold text-white text-center mb-1">
            {toLocationName}
          </Text>

          <Text className="text-xs text-slate-400 text-center mb-4 italic">
            {lore.subtitle}
          </Text>

          {/* Cassidy Remark */}
          <View className="w-full rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-3.5 flex-row items-center gap-3">
            <Text className="text-2xl">🦊</Text>
            <Text className="flex-1 text-xs text-indigo-200 leading-snug">
              "{lore.cassidyQuote}"
            </Text>
          </View>

          <Pressable
            onPress={onTransitionComplete}
            className="mt-5 rounded-full bg-slate-800 px-5 py-2 border border-slate-700 active:bg-slate-700"
          >
            <Text className="text-xs text-slate-300">Enter Immediately</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
