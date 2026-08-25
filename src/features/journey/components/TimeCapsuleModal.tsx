import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocalStore, TimeCapsule } from '../../../lib/localStore';
import { Hourglass, Sparkles, X, Lock, Unlock, Plus, Check } from 'lucide-react-native';

interface TimeCapsuleModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TimeCapsuleModal({ visible, onClose }: TimeCapsuleModalProps) {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [daysFuture, setDaysFuture] = useState(90);
  const [createdToast, setCreatedToast] = useState(false);

  useEffect(() => {
    LocalStore.getTimeCapsules().then(setCapsules);
  }, [visible]);

  const handleCreate = async () => {
    if (!message.trim()) return;

    const targetUnlockDate = new Date(Date.now() + daysFuture * 86400000).toISOString();
    const created = await LocalStore.addTimeCapsule({
      message: message.trim(),
      targetUnlockDate,
      theme: 'emerald',
    });

    setCapsules((prev) => [created, ...prev]);
    setMessage('');
    setIsCreating(false);
    setCreatedToast(true);
    setTimeout(() => setCreatedToast(false), 2000);
  };

  const handleUnlockDemo = async (id: string) => {
    await LocalStore.unlockTimeCapsule(id);
    const updated = await LocalStore.getTimeCapsules();
    setCapsules(updated);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <SafeAreaView className="h-[90%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <Hourglass size={18} color="#a78bfa" />
              <Text className="text-lg font-bold text-white">Personal Time Capsules</Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-800"
            >
              <X size={16} color="#94a3b8" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 mt-3" showsVerticalScrollIndicator={false}>
            <Text className="text-xs text-slate-400 leading-relaxed mb-4">
              Leave private messages, learning reflections, or promises for your future self. Cassidy seals them away until target milestone dates.
            </Text>

            {createdToast && (
              <View className="mb-4 flex-row items-center gap-2 rounded-xl bg-emerald-950/60 p-3 border border-emerald-500/40">
                <Check size={16} color="#34d399" />
                <Text className="text-xs font-bold text-emerald-300">Time Capsule Sealed! ⏳</Text>
              </View>
            )}

            {/* Creation Card Toggle */}
            {!isCreating ? (
              <Pressable
                onPress={() => setIsCreating(true)}
                className="flex-row items-center justify-center gap-2 rounded-2xl bg-indigo-600/30 p-3.5 border border-indigo-500/40 mb-5 active:bg-indigo-600/40"
              >
                <Plus size={16} color="#c7d2fe" />
                <Text className="text-xs font-bold text-indigo-200">Seal a New Message to Future Self</Text>
              </Pressable>
            ) : (
              <View className="rounded-2xl border border-indigo-500/40 bg-slate-900 p-4 mb-5">
                <Text className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
                  Author Capsule Message (Blueprint #71)
                </Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="What would you like your future self to remember about this moment?"
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="h-24 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white mb-3"
                />

                <Text className="text-[11px] font-semibold text-slate-400 mb-2">
                  Seal Duration:
                </Text>
                <View className="flex-row gap-2 mb-4">
                  {[30, 90, 180, 365].map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => setDaysFuture(d)}
                      className={`flex-1 items-center justify-center rounded-xl border py-2 ${
                        daysFuture === d
                          ? 'border-indigo-500 bg-indigo-950/50'
                          : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          daysFuture === d ? 'text-indigo-300' : 'text-slate-400'
                        }`}
                      >
                        {d >= 365 ? '1 Year' : `${d} Days`}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => setIsCreating(false)}
                    className="flex-1 items-center justify-center rounded-xl bg-slate-800 py-2.5"
                  >
                    <Text className="text-xs font-medium text-slate-300">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleCreate}
                    className="flex-1 items-center justify-center rounded-xl bg-indigo-500 py-2.5"
                  >
                    <Text className="text-xs font-bold text-white">Seal Capsule</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* List of Sealed & Unlocked Capsules */}
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Your Time Capsules ({capsules.length})
            </Text>

            <View className="gap-3 mb-8">
              {capsules.map((capsule) => {
                const targetDate = new Date(capsule.targetUnlockDate);
                const isReady = capsule.unlocked || Date.now() >= targetDate.getTime();
                return (
                  <View
                    key={capsule.id}
                    className={`rounded-2xl border p-4 ${
                      isReady
                        ? 'border-emerald-500/40 bg-slate-900'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <View className="flex-row items-center justify-between pb-2 border-b border-slate-800/80">
                      <View className="flex-row items-center gap-1.5">
                        {isReady ? (
                          <Unlock size={14} color="#34d399" />
                        ) : (
                          <Lock size={14} color="#a78bfa" />
                        )}
                        <Text
                          className={`text-xs font-bold ${
                            isReady ? 'text-emerald-300' : 'text-purple-300'
                          }`}
                        >
                          {isReady ? 'Unlocked Time Capsule' : 'Sealed in Emerald Valley'}
                        </Text>
                      </View>
                      <Text className="text-[10px] text-slate-500">
                        Target: {targetDate.toLocaleDateString()}
                      </Text>
                    </View>

                    <Text
                      className={`mt-2.5 text-xs leading-relaxed ${
                        isReady ? 'text-slate-200' : 'text-slate-400 italic'
                      }`}
                    >
                      {isReady
                        ? capsule.message
                        : '🔒 This capsule is currently sealed. Keep exploring and learning; Cassidy will unseal this when the date arrives.'}
                    </Text>

                    {!capsule.unlocked && (
                      <Pressable
                        onPress={() => handleUnlockDemo(capsule.id)}
                        className="mt-3 self-start rounded-lg bg-slate-800/80 px-2.5 py-1 border border-slate-700"
                      >
                        <Text className="text-[10px] font-semibold text-indigo-300">
                          Inspect / Unlock Early (Demo)
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
