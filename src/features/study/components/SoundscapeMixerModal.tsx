import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AudioEngine } from '../../../engines/audio/audioEngine';
import { Music, X, Volume2, Sparkles, Sliders, Play, Pause } from 'lucide-react-native';

interface SoundscapeMixerModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SoundChannel {
  id: string;
  name: string;
  icon: string;
  volume: number; // 0 to 100
  color: string;
}

const PRESET_MIXES = [
  {
    name: 'Kyoto Midnight Rain',
    icon: '🌧️',
    channels: { rain: 80, lofi: 60, vinyl: 40, windchime: 20 },
  },
  {
    name: 'Emerald Dawn Focus',
    icon: '🌱',
    channels: { rain: 0, lofi: 80, vinyl: 20, windchime: 50 },
  },
  {
    name: 'Café Komorebi Vibe',
    icon: '☕',
    channels: { rain: 30, lofi: 90, vinyl: 50, windchime: 10 },
  },
  {
    name: 'Zen Temple Meditation',
    icon: '🎋',
    channels: { rain: 20, lofi: 0, vinyl: 10, windchime: 90 },
  },
];

export function SoundscapeMixerModal({ visible, onClose }: SoundscapeMixerModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [channels, setChannels] = useState<Record<string, number>>({
    rain: 70,
    lofi: 75,
    vinyl: 30,
    windchime: 40,
  });

  const handleAdjustVolume = (channelId: string, delta: number) => {
    setChannels((prev) => ({
      ...prev,
      [channelId]: Math.min(100, Math.max(0, (prev[channelId] || 0) + delta)),
    }));
  };

  const applyPreset = (presetChannels: Record<string, number>) => {
    setChannels(presetChannels);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <SafeAreaView className="h-[88%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <Sliders size={18} color="#818cf8" />
              <View>
                <Text className="text-base font-bold text-white">Soundscape Mixer Deck</Text>
                <Text className="text-[10px] text-indigo-400">Custom Multi-Layer Atmosphere</Text>
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
            {/* Presets Bar */}
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Atmosphere Presets
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {PRESET_MIXES.map((preset) => (
                  <Pressable
                    key={preset.name}
                    onPress={() => applyPreset(preset.channels)}
                    className="flex-row items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900 px-3.5 py-2 active:bg-slate-800"
                  >
                    <Text className="text-sm">{preset.icon}</Text>
                    <Text className="text-xs font-medium text-white">{preset.name}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Mixer Sliders */}
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Individual Audio Channels
            </Text>
            <View className="gap-3 mb-6">
              {[
                { id: 'rain', name: 'Kyoto Rain & Bamboo Gutter', icon: '🌧️', color: 'bg-blue-500' },
                { id: 'lofi', name: 'Lo-Fi Rhodes & Study Beats', icon: '🎹', color: 'bg-indigo-500' },
                { id: 'vinyl', name: 'Vintage Vinyl Crackle & Warmth', icon: '📻', color: 'bg-amber-500' },
                { id: 'windchime', name: 'Zen Windchimes & Stream', icon: '🎐', color: 'bg-emerald-500' },
              ].map((ch) => {
                const vol = channels[ch.id] ?? 50;
                return (
                  <View
                    key={ch.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-base">{ch.icon}</Text>
                        <Text className="text-xs font-bold text-white">{ch.name}</Text>
                      </View>
                      <Text className="text-xs font-bold text-slate-300">{vol}%</Text>
                    </View>

                    {/* Visual Volume Bar */}
                    <View className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-3 border border-slate-700">
                      <View
                        className={`h-full ${ch.color} rounded-full`}
                        style={{ width: `${vol}%` }}
                      />
                    </View>

                    {/* Step buttons */}
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleAdjustVolume(ch.id, -20)}
                        className="flex-1 items-center rounded-xl bg-slate-800 py-1.5 active:bg-slate-700"
                      >
                        <Text className="text-xs font-bold text-slate-300">- 20%</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleAdjustVolume(ch.id, 20)}
                        className="flex-1 items-center rounded-xl bg-slate-800 py-1.5 active:bg-slate-700"
                      >
                        <Text className="text-xs font-bold text-slate-300">+ 20%</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Master Toggle */}
            <Pressable
              onPress={() => setIsPlaying(!isPlaying)}
              className={`flex-row items-center justify-center gap-2 rounded-2xl py-3.5 mb-6 ${
                isPlaying ? 'bg-indigo-600 active:bg-indigo-700' : 'bg-slate-800'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={16} color="#ffffff" />
                  <Text className="text-xs font-bold text-white">Atmosphere Playing</Text>
                </>
              ) : (
                <>
                  <Play size={16} color="#ffffff" />
                  <Text className="text-xs font-bold text-white">Resume Soundscape</Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
