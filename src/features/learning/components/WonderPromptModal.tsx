import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CulturalArtifact } from '../../../lib/localStore';
import { Sparkles, X, HelpCircle, Lightbulb, CheckCircle2, BookOpen } from 'lucide-react-native';

interface WonderPromptModalProps {
  visible: boolean;
  artifact: CulturalArtifact | null;
  onClose: () => void;
}

export function WonderPromptModal({ visible, artifact, onClose }: WonderPromptModalProps) {
  const [revealedLevel, setRevealedLevel] = useState<number>(0); // 0: Question only, 1: Hint 1, 2: Hint 2, 3: Full Solution & Cultural Fact

  if (!artifact) return null;

  const handleRevealNext = () => {
    setRevealedLevel((prev) => Math.min(3, prev + 1));
  };

  const handleClose = () => {
    setRevealedLevel(0);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <SafeAreaView className="h-[90%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <Sparkles size={18} color="#f59e0b" />
              <Text className="text-lg font-bold text-white">Cultural Wonder & Discovery</Text>
            </View>
            <Pressable
              onPress={handleClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-800"
            >
              <X size={16} color="#94a3b8" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
            {/* Artifact Overview Card */}
            <View className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 mb-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-lg font-bold text-white">{artifact.name}</Text>
                  <Text className="text-xs text-amber-300 font-semibold mt-0.5">
                    {artifact.japaneseName} ({artifact.romaji})
                  </Text>
                </View>
                <View className="rounded-full bg-amber-500/20 px-2.5 py-1 border border-amber-500/30">
                  <Text className="text-[10px] font-bold text-amber-300">
                    {artifact.locationName}
                  </Text>
                </View>
              </View>
              <Text className="mt-2.5 text-xs text-slate-300 leading-relaxed">
                {artifact.description}
              </Text>
            </View>

            {/* Wonder Prompt Section (Wave 5F: Questions before explanations) */}
            <View className="rounded-2xl border border-slate-800 bg-slate-900 p-4 mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <HelpCircle size={16} color="#60a5fa" />
                <Text className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Wonder Prompt
                </Text>
              </View>
              <Text className="text-sm font-semibold text-white leading-snug">
                "{artifact.wonderPrompt.question}"
              </Text>
            </View>

            {/* Progressive Hint 1 */}
            {revealedLevel >= 1 && (
              <View className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 mb-3">
                <View className="flex-row items-center gap-1.5 mb-1.5">
                  <Lightbulb size={14} color="#818cf8" />
                  <Text className="text-xs font-bold text-indigo-300">Observation Clue 1</Text>
                </View>
                <Text className="text-xs text-slate-300 leading-relaxed">
                  {artifact.wonderPrompt.hint1}
                </Text>
              </View>
            )}

            {/* Progressive Hint 2 */}
            {revealedLevel >= 2 && (
              <View className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 mb-3">
                <View className="flex-row items-center gap-1.5 mb-1.5">
                  <Lightbulb size={14} color="#a78bfa" />
                  <Text className="text-xs font-bold text-purple-300">Observation Clue 2</Text>
                </View>
                <Text className="text-xs text-slate-300 leading-relaxed">
                  {artifact.wonderPrompt.hint2}
                </Text>
              </View>
            )}

            {/* Full Solution & Cultural Context */}
            {revealedLevel >= 3 && (
              <View className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 mb-4">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <CheckCircle2 size={16} color="#34d399" />
                  <Text className="text-xs font-bold text-emerald-300">Solution & Discovery</Text>
                </View>
                <Text className="text-xs font-semibold text-white mb-2 leading-relaxed">
                  {artifact.wonderPrompt.solution}
                </Text>

                <View className="mt-2 pt-2 border-t border-emerald-500/20">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <BookOpen size={12} color="#6ee7b7" />
                    <Text className="text-[11px] font-bold text-emerald-400">Deep Cultural Context</Text>
                  </View>
                  <Text className="text-xs italic text-slate-300 leading-relaxed">
                    {artifact.wonderPrompt.culturalFact}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            {revealedLevel < 3 ? (
              <Pressable
                onPress={handleRevealNext}
                className="flex-row items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 mb-6 active:bg-amber-600"
              >
                <Lightbulb size={16} color="#78350f" />
                <Text className="font-bold text-amber-950">
                  {revealedLevel === 0
                    ? 'Show Gentle Hint 1'
                    : revealedLevel === 1
                    ? 'Show Gentle Hint 2'
                    : 'Reveal Full Solution & Context'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleClose}
                className="flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 mb-6 active:bg-emerald-600"
              >
                <CheckCircle2 size={16} color="#064e3b" />
                <Text className="font-bold text-emerald-950">Discovery Recorded! ✨</Text>
              </Pressable>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
