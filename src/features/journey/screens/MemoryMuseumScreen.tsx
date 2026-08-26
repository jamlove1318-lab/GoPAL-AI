import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LocalStore,
  PostcardItem,
  CustomCreation,
  CulturalArtifact,
} from '../../../lib/localStore';
import type { MemoriesRow } from '../../../types/database';
import { WonderPromptModal } from '../../learning/components/WonderPromptModal';
import {
  Sparkles,
  Image as ImageIcon,
  MapPin,
  Heart,
  Bookmark,
  Palette,
  Eye,
  Tag,
} from 'lucide-react-native';

export function MemoryMuseumScreen() {
  const [postcards, setPostcards] = useState<PostcardItem[]>([]);
  const [creations, setCreations] = useState<CustomCreation[]>([]);
  const [artifacts, setArtifacts] = useState<CulturalArtifact[]>([]);
  const [memories, setMemories] = useState<MemoriesRow[]>([]);
  const [activeTab, setActiveTab] = useState<'postcards' | 'creations' | 'artifacts' | 'exhibits'>('postcards');

  const [selectedArtifact, setSelectedArtifact] = useState<CulturalArtifact | null>(null);

  useEffect(() => {
    LocalStore.getPostcards().then(setPostcards);
    LocalStore.getCreations().then(setCreations);
    LocalStore.getCulturalArtifacts().then(setArtifacts);
    LocalStore.getMemories().then(setMemories);
  }, []);

  const getLayerColor = (layer: string) => {
    switch (layer) {
      case 'learning':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'character':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'story':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView
        className="flex-1 px-5 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Living Archive
            </Text>
            <Text className="text-2xl font-bold text-white">Memory Museum</Text>
          </View>
          <View className="rounded-full bg-slate-800/80 px-3 py-1 border border-slate-700">
            <Text className="text-xs font-medium text-slate-300">
              {postcards.length + creations.length} Exhibits
            </Text>
          </View>
        </View>

        <Text className="mt-2 text-xs leading-relaxed text-slate-400">
          Significant milestones, cultural discoveries, learner creations, and shared moments with Cassidy materialize here as permanent museum exhibits.
        </Text>

        {/* 4-Way Tab Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 mb-2">
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setActiveTab('postcards')}
              className={`flex-row items-center gap-1.5 rounded-xl px-3 py-2 border ${
                activeTab === 'postcards'
                  ? 'bg-indigo-600 border-indigo-500'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <ImageIcon size={13} color={activeTab === 'postcards' ? '#ffffff' : '#94a3b8'} />
              <Text
                className={`text-xs font-semibold ${
                  activeTab === 'postcards' ? 'text-white' : 'text-slate-400'
                }`}
              >
                Postcards ({postcards.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('creations')}
              className={`flex-row items-center gap-1.5 rounded-xl px-3 py-2 border ${
                activeTab === 'creations'
                  ? 'bg-emerald-600 border-emerald-500'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <Palette size={13} color={activeTab === 'creations' ? '#ffffff' : '#94a3b8'} />
              <Text
                className={`text-xs font-semibold ${
                  activeTab === 'creations' ? 'text-white' : 'text-slate-400'
                }`}
              >
                Creations ({creations.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('artifacts')}
              className={`flex-row items-center gap-1.5 rounded-xl px-3 py-2 border ${
                activeTab === 'artifacts'
                  ? 'bg-amber-600 border-amber-500'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <Eye size={13} color={activeTab === 'artifacts' ? '#ffffff' : '#94a3b8'} />
              <Text
                className={`text-xs font-semibold ${
                  activeTab === 'artifacts' ? 'text-white' : 'text-slate-400'
                }`}
              >
                Artifacts ({artifacts.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('exhibits')}
              className={`flex-row items-center gap-1.5 rounded-xl px-3 py-2 border ${
                activeTab === 'exhibits'
                  ? 'bg-purple-600 border-purple-500'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <Bookmark size={13} color={activeTab === 'exhibits' ? '#ffffff' : '#94a3b8'} />
              <Text
                className={`text-xs font-semibold ${
                  activeTab === 'exhibits' ? 'text-white' : 'text-slate-400'
                }`}
              >
                Memories ({memories.length})
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Tab 1: Postcards (Blueprint Part XV #50 Postcards) */}
        {activeTab === 'postcards' && (
          <View className="mt-3 gap-4">
            {postcards.map((post) => (
              <View
                key={post.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg"
              >
                {/* Postcard Header with Location Stamp */}
                <View className="flex-row items-start justify-between border-b border-slate-800/80 pb-3">
                  <View className="flex-1 pr-2">
                    <Text className="text-base font-bold text-white">{post.title}</Text>
                    <View className="mt-1 flex-row items-center gap-1">
                      <MapPin size={12} color="#34d399" />
                      <Text className="text-xs font-medium text-emerald-400">{post.locationName}</Text>
                    </View>
                  </View>
                  <View className="rounded-lg bg-slate-800 px-2 py-1 border border-slate-700">
                    <Text className="text-[10px] font-mono text-slate-400">
                      {new Date(post.unlockedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* Postcard Visual Representation */}
                <View className="mt-3 h-28 w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-indigo-900/40 border border-slate-700/50">
                  <Text className="text-4xl">🍵</Text>
                  <Text className="mt-1 text-[11px] font-semibold text-slate-300">
                    Authentic Cultural Memory
                  </Text>
                </View>

                {/* Cassidy Handwritten Note */}
                <View className="mt-3 rounded-xl bg-indigo-950/40 p-3 border border-indigo-500/20">
                  <Text className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                    Cassidy's Handwritten Note
                  </Text>
                  <Text className="mt-1 text-xs italic leading-relaxed text-slate-200">
                    “{post.cassidyNote}”
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab 2: Learner Creations (Creative Studio - Wave 4A) */}
        {activeTab === 'creations' && (
          <View className="mt-3 gap-3.5">
            {creations.map((cr) => (
              <View
                key={cr.id}
                className="rounded-2xl border border-emerald-500/30 bg-slate-900 p-4"
              >
                <View className="flex-row items-center justify-between pb-2 border-b border-slate-800">
                  <View>
                    <Text className="text-sm font-bold text-white">{cr.title}</Text>
                    <Text className="text-[10px] text-emerald-400 capitalize">{cr.subtitle}</Text>
                  </View>
                  <View className="rounded-full bg-slate-800 px-2 py-0.5 border border-slate-700">
                    <Text className="text-[10px] text-slate-300 capitalize">{cr.type}</Text>
                  </View>
                </View>

                <Text className="mt-2.5 text-xs text-slate-200 leading-relaxed">
                  {cr.content}
                </Text>

                {cr.tags && cr.tags.length > 0 && (
                  <View className="mt-3 flex-row flex-wrap gap-1.5">
                    {cr.tags.map((tg, i) => (
                      <View key={i} className="flex-row items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5">
                        <Tag size={9} color="#94a3b8" />
                        <Text className="text-[9px] text-slate-300">{tg}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Tab 3: Cultural Artifacts (Wave 5E, 5F) */}
        {activeTab === 'artifacts' && (
          <View className="mt-3 gap-3">
            {artifacts.map((art) => (
              <Pressable
                key={art.id}
                onPress={() => setSelectedArtifact(art)}
                className="rounded-2xl border border-amber-500/30 bg-slate-900 p-4 active:bg-slate-800"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-bold text-white">{art.name}</Text>
                    <Text className="text-xs text-amber-300 font-semibold mt-0.5">
                      {art.japaneseName} ({art.romaji})
                    </Text>
                  </View>
                  <View className="rounded-full bg-amber-500/20 px-2 py-0.5 border border-amber-500/40">
                    <Text className="text-[10px] font-bold text-amber-300">{art.locationName}</Text>
                  </View>
                </View>

                <Text className="mt-2 text-xs text-slate-300 leading-relaxed" numberOfLines={2}>
                  {art.description}
                </Text>

                <View className="mt-3 flex-row items-center justify-between pt-2 border-t border-slate-800">
                  <Text className="text-[11px] text-amber-400 font-semibold">
                    Wonder Prompt: "{art.wonderPrompt.question.slice(0, 45)}..."
                  </Text>
                  <Eye size={14} color="#fbbf24" />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Tab 4: Canonical Memory Exhibits */}
        {activeTab === 'exhibits' && (
          <View className="mt-3 gap-3">
            {memories.map((mem) => {
              const badgeClass = getLayerColor(mem.layer);
              return (
                <View
                  key={mem.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <View className={`rounded-full px-2.5 py-0.5 border ${badgeClass}`}>
                      <Text className="text-[10px] font-bold uppercase tracking-wider">
                        {mem.layer}
                      </Text>
                    </View>
                    <Text className="text-[10px] text-slate-500">
                      {new Date(mem.occurred_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text className="mt-2 text-sm font-semibold text-white leading-snug">
                    {mem.canonical_fact}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Wonder Prompt Modal */}
      <WonderPromptModal
        visible={selectedArtifact !== null}
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
      />
    </SafeAreaView>
  );
}
