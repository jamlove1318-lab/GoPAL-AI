import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuestEngine, Quest } from '../../../engines/quest/questEngine';
import { EconomyEngine, EconomyState, InventoryItem } from '../../../engines/economy/economyEngine';
import {
  Sparkles,
  X,
  CheckCircle2,
  Circle,
  Plus,
  ShoppingBag,
  Gift,
  Coins,
  Compass,
} from 'lucide-react-native';

interface QuestShopModalProps {
  visible: boolean;
  onClose: () => void;
}

export function QuestShopModal({ visible, onClose }: QuestShopModalProps) {
  const [activeTab, setActiveTab] = useState<'quests' | 'shop'>('quests');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [economy, setEconomy] = useState<EconomyState | null>(null);
  const [shopCatalog, setShopCatalog] = useState<InventoryItem[]>([]);

  // Personal challenge creation
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDesc, setChallengeDesc] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    const qList = await QuestEngine.getQuests();
    const eco = await EconomyEngine.getEconomyState();
    setQuests(qList);
    setEconomy(eco);
    setShopCatalog(EconomyEngine.getShopCatalog());
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleCompleteQuest = async (questId: string) => {
    const updatedQuests = await QuestEngine.completeQuest(questId);
    setQuests(updatedQuests);
    const target = updatedQuests.find((q) => q.id === questId);
    if (target) {
      await EconomyEngine.awardSparkles(target.rewardSparkles, 'Quest completion');
      const eco = await EconomyEngine.getEconomyState();
      setEconomy(eco);
      showToast(`+${target.rewardSparkles} Sparkles Earned! ✨`);
    }
  };

  const handleAddChallenge = async () => {
    if (!challengeTitle.trim()) return;
    await QuestEngine.addPersonalChallenge({
      title: challengeTitle.trim(),
      description: challengeDesc.trim() || 'Self-designed learning objective',
      targetCount: 1,
      category: 'personal',
    });
    setChallengeTitle('');
    setChallengeDesc('');
    setShowChallengeForm(false);
    await loadData();
    showToast('Personal Challenge Added! 🎯');
  };

  const handleBuy = async (itemId: string) => {
    const res = await EconomyEngine.purchaseItem(itemId);
    if (res.success) {
      setEconomy(res.state);
      showToast('Item Purchased! 🎁');
    } else {
      showToast(res.error || 'Could not complete purchase');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <SafeAreaView className="h-[92%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <Sparkles size={18} color="#fbbf24" />
              <Text className="text-lg font-bold text-white">Quests & Emerald Shop</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 border border-amber-500/40">
                <Coins size={14} color="#fbbf24" />
                <Text className="text-xs font-bold text-amber-300">
                  {economy?.sparkles ?? 0} Sparkles
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="h-8 w-8 items-center justify-center rounded-full bg-slate-800"
              >
                <X size={16} color="#94a3b8" />
              </Pressable>
            </View>
          </View>

          {/* Toast Notification */}
          {toastMessage && (
            <View className="mt-3 rounded-xl bg-emerald-950/80 p-2.5 border border-emerald-500/40 items-center">
              <Text className="text-xs font-bold text-emerald-300">{toastMessage}</Text>
            </View>
          )}

          {/* Tab Selector */}
          <View className="mt-3 flex-row rounded-xl bg-slate-900 p-1 border border-slate-800">
            <Pressable
              onPress={() => setActiveTab('quests')}
              className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 ${
                activeTab === 'quests' ? 'bg-indigo-600' : 'bg-transparent'
              }`}
            >
              <Compass size={14} color={activeTab === 'quests' ? '#ffffff' : '#94a3b8'} />
              <Text
                className={`text-xs font-semibold ${
                  activeTab === 'quests' ? 'text-white' : 'text-slate-400'
                }`}
              >
                Quests ({quests.filter((q) => !q.completed).length} active)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('shop')}
              className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 ${
                activeTab === 'shop' ? 'bg-amber-600' : 'bg-transparent'
              }`}
            >
              <ShoppingBag size={14} color={activeTab === 'shop' ? '#ffffff' : '#94a3b8'} />
              <Text
                className={`text-xs font-semibold ${
                  activeTab === 'shop' ? 'text-white' : 'text-slate-400'
                }`}
              >
                Emerald Shop & Items
              </Text>
            </Pressable>
          </View>

          {/* Tab 1: Quests & Personal Challenges */}
          {activeTab === 'quests' && (
            <ScrollView className="flex-1 mt-3" showsVerticalScrollIndicator={false}>
              {/* Add Personal Challenge Banner (Blueprint #169) */}
              {!showChallengeForm ? (
                <Pressable
                  onPress={() => setShowChallengeForm(true)}
                  className="flex-row items-center justify-center gap-2 rounded-2xl bg-indigo-950/40 p-3 border border-indigo-500/30 mb-3 active:bg-indigo-950/60"
                >
                  <Plus size={15} color="#818cf8" />
                  <Text className="text-xs font-bold text-indigo-200">
                    Create Self-Designed Challenge
                  </Text>
                </Pressable>
              ) : (
                <View className="rounded-2xl border border-indigo-500/40 bg-slate-900 p-3.5 mb-3">
                  <Text className="text-xs font-bold text-indigo-300 mb-2">
                    New Self-Designed Goal
                  </Text>
                  <TextInput
                    value={challengeTitle}
                    onChangeText={setChallengeTitle}
                    placeholder="e.g. Practice 3 phrases with Barista Ren"
                    placeholderTextColor="#64748b"
                    className="rounded-xl bg-slate-950 px-3 py-2 text-xs text-white mb-2 border border-slate-800"
                  />
                  <TextInput
                    value={challengeDesc}
                    onChangeText={setChallengeDesc}
                    placeholder="Description or context..."
                    placeholderTextColor="#64748b"
                    className="rounded-xl bg-slate-950 px-3 py-2 text-xs text-white mb-3 border border-slate-800"
                  />
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setShowChallengeForm(false)}
                      className="flex-1 rounded-xl bg-slate-800 py-2 items-center"
                    >
                      <Text className="text-xs text-slate-300">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleAddChallenge}
                      className="flex-1 rounded-xl bg-indigo-600 py-2 items-center"
                    >
                      <Text className="text-xs font-bold text-white">Save Challenge</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Quest List */}
              <View className="gap-2.5 mb-6">
                {quests.map((q) => (
                  <View
                    key={q.id}
                    className={`rounded-2xl border p-3.5 ${
                      q.completed
                        ? 'border-emerald-500/30 bg-emerald-950/20 opacity-80'
                        : 'border-slate-800 bg-slate-900'
                    }`}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-row items-center gap-2 flex-1 pr-2">
                        {q.completed ? (
                          <CheckCircle2 size={16} color="#34d399" />
                        ) : (
                          <Circle size={16} color="#94a3b8" />
                        )}
                        <View className="flex-1">
                          <Text
                            className={`text-xs font-bold ${
                              q.completed ? 'text-emerald-300 line-through' : 'text-white'
                            }`}
                          >
                            {q.title}
                          </Text>
                          <Text className="text-[11px] text-slate-400 mt-0.5">{q.description}</Text>
                        </View>
                      </View>

                      <View className="items-end">
                        <Text className="text-[11px] font-bold text-amber-400">
                          +{q.rewardSparkles} ✨
                        </Text>
                        {q.rewardStamp && (
                          <Text className="text-[9px] text-slate-400">{q.rewardStamp}</Text>
                        )}
                      </View>
                    </View>

                    {!q.completed && (
                      <Pressable
                        onPress={() => handleCompleteQuest(q.id)}
                        className="mt-2.5 self-end rounded-lg bg-emerald-600 px-3 py-1 active:bg-emerald-500"
                      >
                        <Text className="text-[10px] font-bold text-white">Mark Complete</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Tab 2: Shop & Inventory */}
          {activeTab === 'shop' && (
            <ScrollView className="flex-1 mt-3" showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                Bonsai Care & Cultural Keepsakes
              </Text>

              <View className="gap-3 mb-6">
                {shopCatalog.map((item) => {
                  const canAfford = (economy?.sparkles ?? 0) >= item.costSparkles;
                  return (
                    <View
                      key={item.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center gap-3 flex-1 pr-3">
                        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30">
                          <Text className="text-2xl">{item.icon}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs font-bold text-white">{item.name}</Text>
                          <Text className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                            {item.description}
                          </Text>
                        </View>
                      </View>

                      <Pressable
                        onPress={() => handleBuy(item.id)}
                        disabled={!canAfford}
                        className={`rounded-xl px-3 py-2 items-center justify-center ${
                          canAfford ? 'bg-amber-500 active:bg-amber-600' : 'bg-slate-800 opacity-50'
                        }`}
                      >
                        <Text className="text-xs font-bold text-amber-950">
                          {item.costSparkles} ✨
                        </Text>
                        <Text className="text-[9px] font-semibold text-amber-950">Buy</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              {/* Current Backpack Inventory */}
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Your Backpack Inventory ({economy?.inventory.length ?? 0} items)
              </Text>
              <View className="gap-2 mb-6">
                {economy?.inventory.map((inv, idx) => (
                  <View
                    key={idx}
                    className="flex-row items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3"
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xl">{inv.icon}</Text>
                      <Text className="text-xs font-bold text-white">{inv.name}</Text>
                    </View>
                    <View className="rounded-full bg-slate-800 px-2.5 py-0.5">
                      <Text className="text-[10px] font-bold text-emerald-400">
                        Qty: {inv.quantity}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
