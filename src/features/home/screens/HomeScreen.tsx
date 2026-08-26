import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorldState } from '../../../hooks/useWorldState';
import { useCassidy } from '../../../hooks/useCassidy';
import { tutorEngine } from '../../../engines/tutor/tutorEngine';
import {
  ExperienceDirector,
  TodayMoment,
  ExperienceIntent,
  ExperiencePlan,
  SessionPlanStep,
} from '../../../engines/director/experienceDirector';
import { LocalStore, SessionBookmark } from '../../../lib/localStore';
import { WaveStore } from '../../../lib/waveStore';
import { CreativeStudioModal } from '../../learning/components/CreativeStudioModal';
import { KnowledgeGraphModal } from '../../learning/components/KnowledgeGraphModal';
import { TimeCapsuleModal } from '../../journey/components/TimeCapsuleModal';
import { QuestShopModal } from '../../journey/components/QuestShopModal';
import { SeasonalFestivalModal } from '../../world/components/SeasonalFestivalModal';
import { DiscoveriesModal } from '../../discoveries/screens/DiscoveriesModal';
import {
  Compass,
  Sparkles,
  BookOpen,
  Coffee,
  Sun,
  Moon,
  CloudSun,
  Heart,
  Music,
  Send,
  Play,
  RotateCcw,
  Search,
  Palette,
  Hourglass,
  HelpCircle,
  ShoppingBag,
  Calendar,
} from 'lucide-react-native';

interface HomeScreenProps {
  onNavigate?: (tab: string, extra?: Record<string, unknown>) => void;
  onStartScenario?: (scenarioKey: string) => void;
}

export function HomeScreen({ onNavigate, onStartScenario }: HomeScreenProps) {
  const { state, loading, continuity } = useWorldState();
  const { view } = useCassidy();

  const [todayMoment, setTodayMoment] = useState<TodayMoment | null>(null);
  const [continuityCard, setContinuityCard] = useState<SessionBookmark | null>(null);
  const [activePlan, setActivePlan] = useState<ExperiencePlan | null>(null);

  const [djPrompt, setDjPrompt] = useState('');
  const [djResult, setDjResult] = useState<string | null>(null);

  // Modals state
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [showTimeCapsuleModal, setShowTimeCapsuleModal] = useState(false);
  const [showQuestShopModal, setShowQuestShopModal] = useState(false);
  const [showFestivalModal, setShowFestivalModal] = useState(false);
  const [showDiscoveriesModal, setShowDiscoveriesModal] = useState(false);
  const [livingObjects, setLivingObjects] = useState<any[]>([]);
  const [selfModel, setSelfModel] = useState<string | null>(null);

  useEffect(() => {
    ExperienceDirector.getTodayPrimaryMoment().then(setTodayMoment);
    ExperienceDirector.getContinuityCard().then(setContinuityCard);
    WaveStore.getLivingObjects().then(setLivingObjects);
    ExperienceDirector.selfModelReflection().then(setSelfModel);
  }, []);

  const handleIntentSelect = async (intent: ExperienceIntent) => {
    const plan = await ExperienceDirector.composeSession(intent, 5);
    setActivePlan(plan);
    // Wave 4V: Return Signature — record the chosen arrival emphasis (bounded, reversible).
    await ExperienceDirector.recordReturn(
      intent === 'relax' ? 'calm' : intent === 'adventure' ? 'explore' : 'study'
    );
  };

  const handleDjSubmit = () => {
    if (!djPrompt.trim()) return;
    const res = tutorEngine.interpretExperienceRequest(djPrompt);
    setDjResult(`✨ Recommended: ${res.recommendation}`);
    setDjPrompt('');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-950">
        <Sparkles size={36} color="#60a5fa" />
        <Text className="mt-4 text-base font-medium text-slate-300">Waking your learning world…</Text>
        <Text className="mt-1 text-xs text-slate-500">Restoring world continuity and memories</Text>
      </SafeAreaView>
    );
  }

  const timeOfDay = state?.timeOfDay ?? 'morning';
  const season = state?.season ?? 'spring';
  const mood = view?.state?.mood ?? 'curious';

  const timeIcon =
    timeOfDay === 'night' ? (
      <Moon size={18} color="#93c5fd" />
    ) : timeOfDay === 'evening' ? (
      <Sun size={18} color="#fb923c" />
    ) : (
      <CloudSun size={18} color="#facc15" />
    );

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView
        className="flex-1 px-5 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Header / World Status */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {state?.world?.display_name ?? 'GoPAL Living World'}
            </Text>
            <Text className="mt-0.5 text-2xl font-bold text-white">Your Sanctuary</Text>
          </View>
          <Pressable
            onPress={() => setShowFestivalModal(true)}
            className="flex-row items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1.5 border border-slate-700 active:bg-slate-700"
          >
            {timeIcon}
            <Text className="text-xs font-medium capitalize text-slate-200">
              {season} · {timeOfDay} ✨
            </Text>
          </Pressable>
        </View>

        {/* World Continuity Recaps — "While you were away" (Blueprint #5, #6) */}
        {continuity && (continuity.newDay || continuity.isNewSeason || continuity.recap.length > 0) && (
          <View className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-950/25 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Sun size={15} color="#fb7185" />
                <Text className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Welcome Back
                </Text>
              </View>
              <Text className="text-[10px] text-slate-400">While you were away</Text>
            </View>

            <Text className="mt-2 text-sm font-bold text-white">
              {continuity.newDay
                ? 'Your world entered a new day.'
                : 'The world kept living while you were gone.'}
            </Text>

            {continuity.recap.length > 0 && (
              <View className="mt-2 gap-1">
                {continuity.recap.map((line, i) => (
                  <Text key={i} className="text-xs text-slate-300">
                    {'• '}
                    {line}
                  </Text>
                ))}
              </View>
            )}

            <Text className="mt-2.5 text-[11px] italic text-slate-400">
              Nothing required your attention — the world simply continued.
            </Text>
          </View>
        )}

        {/* Continuity Card (Wave 4F, 4K - Pick up where you left off) */}
        {continuityCard && (
          <View className="mt-4 rounded-2xl border border-blue-500/40 bg-blue-950/30 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <RotateCcw size={15} color="#60a5fa" />
                <Text className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Pick Up Where You Left Off
                </Text>
              </View>
              <Text className="text-[10px] text-slate-400">Unfinished Context</Text>
            </View>
            <Text className="mt-2 text-sm font-bold text-white">{continuityCard.title}</Text>
            <Text className="mt-0.5 text-xs text-slate-300">{continuityCard.promptSnippet}</Text>

            <Pressable
              onPress={() => {
                if (continuityCard.scenarioKey && onStartScenario) {
                  onStartScenario(continuityCard.scenarioKey);
                } else if (onNavigate) {
                  onNavigate('study');
                }
              }}
              className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 active:bg-blue-700"
            >
              <Play size={13} color="#ffffff" />
              <Text className="text-xs font-bold text-white">Resume Session</Text>
            </Pressable>
          </View>
        )}

        {/* Today's Primary Curated Moment (Blueprint #52, #117) */}
        {todayMoment && (
          <View className="mt-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 to-slate-900 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Sparkles size={14} color="#34d399" />
                <Text className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Today's Curated Moment
                </Text>
              </View>
              <Text className="text-[10px] text-emerald-300/80 font-medium">
                {todayMoment.greeting}
              </Text>
            </View>

            <Text className="mt-2 text-base font-bold text-white">{todayMoment.headline}</Text>
            <Text className="mt-1 text-xs text-slate-300 leading-relaxed">
              {todayMoment.subtext}
            </Text>

            <Pressable
              onPress={() => {
                if (todayMoment.scenarioKey && onStartScenario) {
                  onStartScenario(todayMoment.scenarioKey);
                } else if (onNavigate) {
                  onNavigate('map', { targetLocation: todayMoment.targetLocationKey });
                }
              }}
              className="mt-3.5 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 active:bg-emerald-600"
            >
              <Play size={14} color="#064e3b" />
              <Text className="text-xs font-bold text-emerald-950">
                {todayMoment.primaryActionLabel}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Quick Access Subsystem Modals */}
        <View className="mt-4 flex-row flex-wrap gap-2.5">
          <Pressable
            onPress={() => setShowKnowledgeModal(true)}
            className="flex-1 min-w-[45%] flex-row items-center justify-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900 py-3 active:bg-slate-800"
          >
            <Search size={14} color="#60a5fa" />
            <Text className="text-xs font-semibold text-slate-200">Constellation</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowCreativeModal(true)}
            className="flex-1 min-w-[45%] flex-row items-center justify-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900 py-3 active:bg-slate-800"
          >
            <Palette size={14} color="#34d399" />
            <Text className="text-xs font-semibold text-slate-200">Creative Studio</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowTimeCapsuleModal(true)}
            className="flex-1 min-w-[45%] flex-row items-center justify-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900 py-3 active:bg-slate-800"
          >
            <Hourglass size={14} color="#a78bfa" />
            <Text className="text-xs font-semibold text-slate-200">Time Capsule</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowQuestShopModal(true)}
            className="flex-1 min-w-[45%] flex-row items-center justify-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900 py-3 active:bg-slate-800"
          >
            <ShoppingBag size={14} color="#fbbf24" />
            <Text className="text-xs font-semibold text-slate-200">Quests & Shop</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => setShowDiscoveriesModal(true)}
          className="mt-2.5 flex-row items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 py-3 active:bg-emerald-900/40"
        >
          <Sparkles size={14} color="#34d399" />
          <Text className="text-xs font-semibold text-emerald-300">World Discoveries & Personal Archive</Text>
        </Pressable>

        {/* World Concierge (Wave 5L): Cassidy offers choices; never commands. */}
        {todayMoment && (
          <View className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Cassidy, your concierge
            </Text>
            <Text className="mt-1.5 text-sm text-white">Want something familiar, or something new?</Text>
            <View className="mt-2.5 flex-row flex-wrap gap-2">
              {[
                { label: 'Something familiar', intent: 'conversation' as ExperienceIntent },
                { label: 'Surprise me', intent: 'surprise_me' as ExperienceIntent },
                { label: 'I have 5 minutes', intent: 'focus' as ExperienceIntent },
                { label: 'More time today', intent: 'adventure' as ExperienceIntent },
              ].map((o) => (
                <Pressable
                  key={o.label}
                  onPress={() => handleIntentSelect(o.intent)}
                  className="rounded-full bg-slate-800 px-3 py-1.5 active:bg-slate-700"
                >
                  <Text className="text-xs text-slate-200">{o.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Wave 3: Recursive Self-Model — Cassidy reflects on how she's been helping. */}
        {selfModel && (
          <View className="mt-5 rounded-2xl border border-sky-500/30 bg-sky-950/15 p-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Cassidy, reflecting
            </Text>
            <Text className="mt-1.5 text-xs italic text-slate-200">“{selfModel}”</Text>
          </View>
        )}

        {/* Wave 3: Living Object Contract — objects hold state and remember the learner. */}
        {livingObjects.length > 0 && (
          <View className="mt-5 rounded-2xl border border-fuchsia-500/30 bg-fuchsia-950/15 p-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">
              Living in Your World
            </Text>
            <Text className="mt-1 text-[11px] text-slate-400">
              These objects grow and remember across sessions.
            </Text>
            <View className="mt-3 gap-3">
              {livingObjects.map((o) => (
                <View key={o.id} className="rounded-xl bg-slate-900/70 border border-slate-800 p-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-bold text-white">{o.name}</Text>
                    <Text className="text-[10px] text-fuchsia-300">growth {o.growth}%</Text>
                  </View>
                  <View className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <View className="h-1.5 rounded-full bg-fuchsia-500" style={{ width: `${o.growth}%` }} />
                  </View>
                  {o.memory.length > 0 && (
                    <Text className="mt-2 text-[10px] italic text-slate-500">
                      “{o.memory[o.memory.length - 1]}”
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Intent Sizing Bar (Blueprint #95, #104, #141) */}
        <Text className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
          What do you feel like doing? (Blueprint #95)
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2.5 mb-2">
          <View className="flex-row gap-2">
            {[
              { intent: 'conversation' as ExperienceIntent, label: '💬 Conversation', color: 'border-emerald-500' },
              { intent: 'adventure' as ExperienceIntent, label: '🏮 Adventure', color: 'border-amber-500' },
              { intent: 'focus' as ExperienceIntent, label: '📖 Focus Study', color: 'border-indigo-500' },
              { intent: 'relax' as ExperienceIntent, label: '☕ Relax & Listen', color: 'border-blue-500' },
              { intent: 'creative' as ExperienceIntent, label: '🎨 Creative', color: 'border-purple-500' },
              { intent: 'surprise_me' as ExperienceIntent, label: '🎲 Surprise Me!', color: 'border-rose-500' },
            ].map((item) => (
              <Pressable
                key={item.intent}
                onPress={() => handleIntentSelect(item.intent)}
                className={`rounded-2xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 active:bg-slate-800`}
              >
                <Text className="text-xs font-semibold text-white">{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Active Generated Plan Card with "Why am I seeing this?" */}
        {activePlan && (
          <View className="mt-3 rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Experience Plan · {activePlan.durationMinutes} min
              </Text>
              <Text className="text-[10px] text-slate-400">{activePlan.targetLocationName}</Text>
            </View>

            <Text className="mt-1.5 text-base font-bold text-white">{activePlan.title}</Text>
            <Text className="mt-0.5 text-xs text-slate-300">{activePlan.subtitle}</Text>

            {/* Explainability (Blueprint #92, #AC) */}
            <View className="mt-2.5 rounded-xl bg-indigo-900/40 p-2.5 border border-indigo-500/20">
              <View className="flex-row items-center gap-1 mb-0.5">
                <HelpCircle size={11} color="#c7d2fe" />
                <Text className="text-[10px] font-bold text-indigo-300">Why am I seeing this?</Text>
              </View>
              <Text className="text-[11px] text-slate-300 italic">{activePlan.reason}</Text>
            </View>

            <View className="mt-3 gap-1.5">
              {activePlan.steps.map((st: SessionPlanStep, i: number) => (
                <Text key={i} className="text-xs text-slate-300">
                  {i + 1}. {st.label}
                </Text>
              ))}
            </View>

            <Pressable
              onPress={() => {
                if (activePlan.scenarioKey && onStartScenario) {
                  onStartScenario(activePlan.scenarioKey);
                } else if (onNavigate) {
                  onNavigate('study');
                }
              }}
              className="mt-3.5 flex-row items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5"
            >
              <Play size={13} color="#ffffff" />
              <Text className="text-xs font-bold text-white">Start Guided Plan</Text>
            </Pressable>
          </View>
        )}

        {/* Cassidy Companion Status */}
        <View className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/30 border border-indigo-500/40">
                <Text className="text-2xl">🦊</Text>
              </View>
              <View>
                <Text className="text-base font-bold text-white">Cassidy</Text>
                <Text className="text-xs text-indigo-300 capitalize">
                  Feeling {mood} · Energy {view?.state?.energy ?? 88}%
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1">
              <Heart size={14} color="#f43f5e" />
              <Text className="text-xs font-medium text-slate-300">
                Trust {view?.relationship?.trust ?? 85}%
              </Text>
            </View>
          </View>

          <View className="mt-3 rounded-xl bg-slate-800/60 p-3">
            <Text className="text-xs italic leading-relaxed text-slate-300">
              “{view?.state?.current_activity ?? 'Arranging new cultural postcards on the desk. Ready when you are!'}”
            </Text>
          </View>

          <Pressable
            className="mt-3 flex-row items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 active:bg-indigo-700"
            onPress={() => onNavigate?.('study')}
          >
            <Text className="text-xs font-semibold text-white">Enter Study Sanctuary with Cassidy</Text>
          </Pressable>
        </View>

        {/* Natural Language World DJ (Blueprint #156) */}
        <View className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <View className="flex-row items-center gap-2">
            <Music size={16} color="#a78bfa" />
            <Text className="text-sm font-bold text-white">World Experience DJ</Text>
          </View>
          <Text className="mt-1 text-xs text-slate-400">
            Tell GoPAL what you need in plain words (e.g., “5 minutes calm practice before bed”)
          </Text>

          <View className="mt-3 flex-row items-center rounded-xl bg-slate-800 px-3 py-1.5">
            <TextInput
              value={djPrompt}
              onChangeText={setDjPrompt}
              placeholder="I have 5 minutes and want something calm…"
              placeholderTextColor="#64748b"
              className="flex-1 text-xs text-white"
            />
            <Pressable
              onPress={handleDjSubmit}
              className="h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 active:bg-indigo-700"
            >
              <Send size={14} color="#ffffff" />
            </Pressable>
          </View>

          {djResult && (
            <View className="mt-3 rounded-lg bg-indigo-950/50 p-3 border border-indigo-500/30">
              <Text className="text-xs text-indigo-200">{djResult}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Embedded Modals */}
      <CreativeStudioModal
        visible={showCreativeModal}
        onClose={() => setShowCreativeModal(false)}
      />
      <KnowledgeGraphModal
        visible={showKnowledgeModal}
        onClose={() => setShowKnowledgeModal(false)}
        onSelectLocation={(locKey: string) => onNavigate?.('map', { targetLocation: locKey })}
      />
      <TimeCapsuleModal
        visible={showTimeCapsuleModal}
        onClose={() => setShowTimeCapsuleModal(false)}
      />
      <QuestShopModal
        visible={showQuestShopModal}
        onClose={() => setShowQuestShopModal(false)}
      />
      <SeasonalFestivalModal
        visible={showFestivalModal}
        onClose={() => setShowFestivalModal(false)}
      />
      <DiscoveriesModal
        visible={showDiscoveriesModal}
        onClose={() => setShowDiscoveriesModal(false)}
      />
    </SafeAreaView>
  );
}
