import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KnowledgeEngine, SearchResultCategory } from '../../../engines/knowledge/knowledgeEngine';
import type { KnowledgeNode } from '../../../lib/localStore';
import { Search, Sparkles, X, Share2, BookOpen, ChevronRight } from 'lucide-react-native';

interface KnowledgeGraphModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation?: (locationKey: string) => void;
}

export function KnowledgeGraphModal({ visible, onClose, onSelectLocation }: KnowledgeGraphModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultCategory[]>([]);
  const [constellation, setConstellation] = useState<{
    nodes: KnowledgeNode[];
    categories: string[];
    averageMastery: number;
  }>({ nodes: [], categories: [], averageMastery: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

  useEffect(() => {
    KnowledgeEngine.getKnowledgeConstellation().then(setConstellation);
  }, [visible]);

  const handleSearchChange = async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    const res = await KnowledgeEngine.searchAll(text);
    setSearchResults(res);
  };

  const filteredNodes =
    selectedCategory === 'all'
      ? constellation.nodes
      : constellation.nodes.filter((n) => n.category === selectedCategory);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <SafeAreaView className="h-[92%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <Sparkles size={18} color="#60a5fa" />
              <Text className="text-lg font-bold text-white">Knowledge Constellation</Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-800"
            >
              <X size={16} color="#94a3b8" />
            </Pressable>
          </View>

          {/* Universal Search "Ask / Find / Go" (Wave 4J) */}
          <View className="mt-4 flex-row items-center rounded-2xl border border-slate-800 bg-slate-900 px-3.5 py-2.5">
            <Search size={16} color="#94a3b8" />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Ask / Find / Go (e.g. matcha, café, quiet, book)"
              placeholderTextColor="#64748b"
              className="flex-1 ml-2 text-xs text-white"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => handleSearchChange('')}>
                <X size={14} color="#64748b" />
              </Pressable>
            )}
          </View>

          {/* Search Results Mode */}
          {searchQuery.trim().length > 0 ? (
            <ScrollView className="flex-1 mt-3" showsVerticalScrollIndicator={false}>
              {searchResults.length === 0 ? (
                <View className="items-center justify-center py-10">
                  <Text className="text-sm text-slate-500">No matching world entities found.</Text>
                </View>
              ) : (
                searchResults.map((cat) => (
                  <View key={cat.title} className="mb-4">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                      {cat.title}
                    </Text>
                    <View className="gap-2">
                      {cat.items.map((item) => (
                        <Pressable
                          key={item.id}
                          onPress={() => {
                            if (cat.category === 'knowledge') {
                              setSelectedNode(item.payload as KnowledgeNode);
                            } else if (cat.category === 'locations' && onSelectLocation) {
                              onSelectLocation(item.payload.key);
                              onClose();
                            }
                          }}
                          className="flex-row items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3"
                        >
                          <View className="flex-1 pr-2">
                            <Text className="text-xs font-bold text-white">{item.title}</Text>
                            <Text className="mt-0.5 text-[11px] text-slate-400">{item.subtitle}</Text>
                          </View>
                          {item.badge && (
                            <View className="rounded-full bg-slate-800 px-2 py-0.5 border border-slate-700">
                              <Text className="text-[10px] text-slate-300 capitalize">{item.badge}</Text>
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          ) : (
            /* Constellation Explorer Mode */
            <ScrollView className="flex-1 mt-3" showsVerticalScrollIndicator={false}>
              {/* Mastery Banner */}
              <View className="flex-row items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 p-4 border border-indigo-500/30 mb-4">
                <View>
                  <Text className="text-[11px] font-semibold text-indigo-300">Connected Knowledge</Text>
                  <Text className="text-xl font-bold text-white mt-0.5">
                    {constellation.nodes.length} Concepts Tracked
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-purple-300">Avg Mastery</Text>
                  <Text className="text-2xl font-extrabold text-emerald-400">
                    {constellation.averageMastery}%
                  </Text>
                </View>
              </View>

              {/* Category Filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => setSelectedCategory('all')}
                    className={`rounded-xl px-3 py-1.5 border ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selectedCategory === 'all' ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      All ({constellation.nodes.length})
                    </Text>
                  </Pressable>
                  {constellation.categories.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      className={`rounded-xl px-3 py-1.5 border capitalize ${
                        selectedCategory === cat
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          selectedCategory === cat ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              {/* Nodes Grid */}
              <View className="gap-2.5">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <Pressable
                      key={node.id}
                      onPress={() => setSelectedNode(node)}
                      className={`rounded-2xl border p-4 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-950/40'
                          : 'border-slate-800 bg-slate-900'
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-base font-bold text-white">{node.term}</Text>
                          <Text className="text-xs text-slate-400">{node.reading}</Text>
                        </View>
                        <View className="rounded-full bg-slate-800 px-2 py-0.5">
                          <Text className="text-[10px] text-emerald-400 font-bold">
                            {node.masteryLevel}%
                          </Text>
                        </View>
                      </View>

                      <Text className="mt-1 text-xs text-slate-300 font-medium">{node.meaning}</Text>

                      {/* Expanded Node Details */}
                      {isSelected && (
                        <View className="mt-3 pt-3 border-t border-slate-800/80">
                          <Text className="text-[11px] font-semibold text-slate-400 mb-1">
                            Contextual Examples:
                          </Text>
                          {node.examples.map((ex, i) => (
                            <Text key={i} className="text-xs italic text-slate-200 mb-1">
                              • {ex}
                            </Text>
                          ))}
                          {node.relatedKeys.length > 0 && (
                            <View className="mt-2 flex-row items-center gap-1.5">
                              <Share2 size={12} color="#94a3b8" />
                              <Text className="text-[10px] text-slate-400">
                                Connected to: {node.relatedKeys.join(', ')}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
