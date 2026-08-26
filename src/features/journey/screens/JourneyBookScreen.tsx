import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JourneyEngine, JourneyEntry, ThenVsNowItem } from '../../../engines/journey/journeyEngine';
import { auth } from '../../../services/auth';
import { LocalStore, CulturalArtifact } from '../../../lib/localStore';
import { ConversationArchiveModal } from '../components/ConversationArchiveModal';
import {
  BookOpen,
  Sparkles,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react-native';

const journeyEngine = new JourneyEngine();

export function JourneyBookScreen() {
  const [timeline, setTimeline] = useState<JourneyEntry[]>([]);
  const [milestones, setMilestones] = useState<string[]>([]);
  const [thenVsNow, setThenVsNow] = useState<ThenVsNowItem[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'thenVsNow'>('timeline');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [artifacts, setArtifacts] = useState<CulturalArtifact[]>([]);
  const [mastered, setMastered] = useState(0);

  useEffect(() => {
    const unsub = auth.onAuthStateChange(async (user) => {
      const uid = user ? user.id : 'local-explorer-user';
      const book = await journeyEngine.buildBook(uid);
      setTimeline(book.timeline);
      setMilestones(book.milestones);
      setThenVsNow(book.thenVsNow);
      setArtifacts(await LocalStore.getCulturalArtifacts());
      const nodes = await LocalStore.getKnowledgeNodes();
      setMastered(nodes.filter((n) => n.masteryLevel >= 70).length);
    });
    return () => unsub.data.subscription.unsubscribe();
  }, []);

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
              Personal Chronicle
            </Text>
            <Text className="text-2xl font-bold text-white">Journey Book</Text>
          </View>
          <Pressable
            onPress={() => setShowArchiveModal(true)}
            className="flex-row items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1.5 border border-slate-700 active:bg-slate-700"
          >
            <MessageSquare size={13} color="#34d399" />
            <Text className="text-xs font-medium text-slate-300">Transcripts</Text>
          </Pressable>
        </View>

        <Text className="mt-2 text-xs leading-relaxed text-slate-400">
          Your personal journey record. GoPAL-AI turns every breakthrough, mistake overcome, and discovery into a living autobiographical story.
        </Text>

        {/* Milestone Badges */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mx-5 px-5">
          <View className="flex-row gap-2">
            {milestones.map((m, idx) => (
              <View
                key={idx}
                className="flex-row items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-2"
              >
                <Award size={14} color="#fbbf24" />
                <Text className="text-xs font-semibold text-amber-200">{m}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Wave 5N: Tangible State Representations — progress shown as spatial objects, not bars. */}
        <View className="mt-5 rounded-2xl border border-emerald-500/30 bg-slate-900 p-4">
          <Text className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Your Tangible State
          </Text>

          {/* Cultural Shelf */}
          <Text className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            Cultural Shelf · {artifacts.length} collected
          </Text>
          {artifacts.length === 0 ? (
            <Text className="mt-1 text-xs text-slate-500">Nothing collected yet — explore the world to gather keepsakes.</Text>
          ) : (
            <View className="mt-2 flex-row flex-wrap gap-2">
              {artifacts.slice(0, 8).map((a) => (
                <View key={a.id} className="items-center rounded-xl bg-amber-950/30 px-2 py-1.5 border border-amber-500/20">
                  <Text className="text-lg">🏺</Text>
                  <Text className="mt-0.5 max-w-[64px] text-[9px] text-amber-200">{a.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Journey Markers */}
          <Text className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
            Journey Markers · {milestones.length} milestones
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {milestones.length === 0 ? (
              <Text className="text-xs text-slate-500">Your path is just beginning.</Text>
            ) : (
              milestones.map((m, idx) => (
                <View key={idx} className="flex-row items-center gap-1 rounded-full bg-indigo-950/40 px-2.5 py-1 border border-indigo-500/20">
                  <Text className="text-xs">📍</Text>
                  <Text className="text-[10px] text-indigo-200">{m}</Text>
                </View>
              ))
            )}
          </View>

          {/* Growth Board */}
          <Text className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Growth Board · {mastered} concepts mastered
          </Text>
          <View className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <View className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, mastered * 12)}%` }} />
          </View>
        </View>

        {/* Tab Toggle: Timeline vs Then-vs-Now */}
        <View className="mt-5 flex-row rounded-xl bg-slate-900 p-1 border border-slate-800">
          <Pressable
            onPress={() => setActiveTab('timeline')}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg py-2 ${
              activeTab === 'timeline' ? 'bg-indigo-600' : 'bg-transparent'
            }`}
          >
            <Calendar size={14} color={activeTab === 'timeline' ? '#ffffff' : '#94a3b8'} />
            <Text
              className={`text-xs font-semibold ${
                activeTab === 'timeline' ? 'text-white' : 'text-slate-400'
              }`}
            >
              Timeline Chronicle
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('thenVsNow')}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg py-2 ${
              activeTab === 'thenVsNow' ? 'bg-emerald-600' : 'bg-transparent'
            }`}
          >
            <TrendingUp size={14} color={activeTab === 'thenVsNow' ? '#ffffff' : '#94a3b8'} />
            <Text
              className={`text-xs font-semibold ${
                activeTab === 'thenVsNow' ? 'text-white' : 'text-slate-400'
              }`}
            >
              Then vs. Now
            </Text>
          </Pressable>
        </View>

        {/* Tab 1: Timeline Feed */}
        {activeTab === 'timeline' && (
          <View className="mt-4 gap-3">
            {timeline.map((entry, idx) => (
              <View
                key={entry.id || idx}
                className="flex-row items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3.5"
              >
                <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                  <Sparkles size={14} color="#a78bfa" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-white">{entry.label}</Text>
                  <Text className="mt-0.5 text-[11px] text-slate-400">
                    {new Date(entry.at).toLocaleDateString()} · {new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab 2: Then vs Now (Blueprint Part X #29) */}
        {activeTab === 'thenVsNow' && (
          <View className="mt-4 gap-3.5">
            <View className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <Text className="text-xs font-semibold text-emerald-400">
                Positive Difficulty History
              </Text>
              <Text className="mt-1 text-xs text-slate-300 leading-relaxed">
                Notice how challenges you once struggled with have now become second nature!
              </Text>
            </View>

            {thenVsNow.map((item, idx) => (
              <View key={idx} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <Text className="text-sm font-bold text-white">{item.concept}</Text>

                {/* Then */}
                <View className="mt-3 rounded-xl bg-slate-800/60 p-3 border border-slate-700/60">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    Then (Where you began)
                  </Text>
                  <Text className="mt-1 text-xs text-slate-300 leading-relaxed">
                    {item.thenDescription}
                  </Text>
                </View>

                {/* Now */}
                <View className="mt-2.5 rounded-xl bg-emerald-950/40 p-3 border border-emerald-500/30">
                  <View className="flex-row items-center gap-1.5">
                    <CheckCircle2 size={12} color="#34d399" />
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Now (Mastery Achieved)
                    </Text>
                  </View>
                  <Text className="mt-1 text-xs text-emerald-100 leading-relaxed">
                    {item.nowDescription}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Transcript Archive Modal */}
      <ConversationArchiveModal
        visible={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
      />
    </SafeAreaView>
  );
}
