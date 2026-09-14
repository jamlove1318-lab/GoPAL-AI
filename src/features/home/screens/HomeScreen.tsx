import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorldState } from '../../../hooks/useWorldState';
import { useCassidy } from '../../../hooks/useCassidy';
import { tutorEngine } from '../../../engines/tutor/tutorEngine';
import { ExperienceDirector, TodayMoment, ExperienceIntent, ExperiencePlan, SessionPlanStep } from '../../../engines/director/experienceDirector';
import { LocalStore, SessionBookmark } from '../../../lib/localStore';
import { auth } from '../../../services/auth';
import { livingWorldObjectsStore } from '../../../engines/world/livingWorldObjectsStore';
import { Cassidy } from '../../../characters/cassidy';
import { CassidyCharacter } from '../../../components/CassidyCharacter';
import type { CassidySnapshot } from '../../../characters/cassidyContext';
import { CreativeStudioModal } from '../../learning/components/CreativeStudioModal';
import { KnowledgeGraphModal } from '../../learning/components/KnowledgeGraphModal';
import { TimeCapsuleModal } from '../../journey/components/TimeCapsuleModal';
import { QuestShopModal } from '../../journey/components/QuestShopModal';
import { SeasonalFestivalModal } from '../../world/components/SeasonalFestivalModal';
import { DiscoveriesModal } from '../../discoveries/screens/DiscoveriesModal';
import { Compass, Sparkles, BookOpen, Coffee, Sun, Moon, CloudSun, Heart, Music, Send, Play, RotateCcw, Search, Palette, Hourglass, HelpCircle, ShoppingBag, Calendar } from 'lucide-react-native';

interface HomeScreenProps { snapshot?: CassidySnapshot | null; onNavigate?: (tab: string, extra?: Record<string, unknown>) => void; onStartScenario?: (scenarioKey: string) => void; }

export function HomeScreen({ snapshot, onNavigate, onStartScenario }: HomeScreenProps) {
  const { state, loading, continuity } = useWorldState();
  const { view } = useCassidy();
  const [todayMoment, setTodayMoment] = useState<TodayMoment | null>(null);
  const [continuityCard, setContinuityCard] = useState<SessionBookmark | null>(null);
  const [activePlan, setActivePlan] = useState<ExperiencePlan | null>(null);
  const [djPrompt, setDjPrompt] = useState('');
  const [djResult, setDjResult] = useState<string | null>(null);
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [showTimeCapsuleModal, setShowTimeCapsuleModal] = useState(false);
  const [showQuestShopModal, setShowQuestShopModal] = useState(false);
  const [showFestivalModal, setShowFestivalModal] = useState(false);
  const [showDiscoveriesModal, setShowDiscoveriesModal] = useState(false);
  const [livingObjects, setLivingObjects] = useState<any[]>([]);
  const [selfModel, setSelfModel] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    ExperienceDirector.getTodayPrimaryMoment().then(setTodayMoment);
    ExperienceDirector.getContinuityCard().then(setContinuityCard);
    ExperienceDirector.selfModelReflection().then(setSelfModel);
    void (async () => {
      try {
        const user = await auth.getCurrentUser();
        const userId = user?.id ?? 'local-explorer-user';
        await livingWorldObjectsStore.migrateLegacyLocalState(userId);
        const next = await livingWorldObjectsStore.getAll(userId);
        if (active) setLivingObjects(next);
      } catch { /* ambient UI must never block the world */ }
    })();
    return () => { active = false; };
  }, []);

  const handleIntentSelect = async (intent: ExperienceIntent) => {
    const plan = await ExperienceDirector.composeSession(intent, 5);
    setActivePlan(plan);
    await ExperienceDirector.recordReturn(intent === 'relax' ? 'calm' : intent === 'adventure' ? 'explore' : 'study');
  };

  const handleDjSubmit = () => {
    if (!djPrompt.trim()) return;
    const res = tutorEngine.interpretExperienceRequest(djPrompt);
    setDjResult(`✨ Recommended: ${res.recommendation}`);
    setDjPrompt('');
  };

  if (loading) return <SafeAreaView className="flex-1 items-center justify-center bg-slate-950"><Sparkles size={36} color="#60a5fa" /><Text className="mt-4 text-base font-medium text-slate-300">Waking your learning world…</Text><Text className="mt-1 text-xs text-slate-500">Restoring world continuity and memories</Text></SafeAreaView>;

  const timeOfDay = state?.timeOfDay ?? 'morning';
  const season = state?.season ?? 'spring';
  const mood = view?.state?.mood ?? 'curious';
  const timeIcon = timeOfDay === 'night' ? <Moon size={18} color="#93c5fd" /> : timeOfDay === 'evening' ? <Sun size={18} color="#fb923c" /> : <CloudSun size={18} color="#facc15" />;

  return <SafeAreaView className="flex-1 bg-transparent"><ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}><View className="flex-row items-center justify-between"><View><Text className="text-xs font-semibold uppercase tracking-wider text-emerald-400">{state?.world?.display_name ?? 'GoPAL Living World'}</Text><Text className="mt-0.5 text-2xl font-bold text-white">Your Sanctuary</Text></View><Pressable onPress={() => setShowFestivalModal(true)} className="flex-row items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1.5 border border-slate-700 active:bg-slate-700">{timeIcon}<Text className="text-xs font-medium capitalize text-slate-200">{season} · {timeOfDay} ✨</Text></Pressable></View><View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-3"><CassidyCharacter height={60} action="idle" speaking={false} expression="warm" /><View className="flex-1"><Text className="text-[11px] font-semibold text-emerald-300">Cassidy</Text><Text className="text-[12px] italic text-emerald-100">{snapshot ? Cassidy.placeLine('home', snapshot) : 'The valley is waking up with you.'}</Text></View></View>{continuity && (continuity.newDay || continuity.isNewSeason || continuity.recap.length > 0) && <View className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-950/25 p-4"><Text className="text-sm font-bold text-white">{continuity.newDay ? 'Your world entered a new day.' : 'The world kept living while you were gone.'}</Text>{continuity.recap.map((line, i) => <Text key={i} className="mt-1 text-xs text-slate-300">• {line}</Text>)}<Text className="mt-2.5 text-[11px] italic text-slate-400">Nothing required your attention — the world simply continued.</Text></View>}{continuityCard && <View className="mt-4 rounded-2xl border border-blue-500/40 bg-blue-950/30 p-4"><Text className="text-xs font-bold uppercase tracking-wider text-blue-300">Pick Up Where You Left Off</Text><Text className="mt-2 text-sm font-bold text-white">{continuityCard.title}</Text><Text className="mt-0.5 text-xs text-slate-300">{continuityCard.promptSnippet}</Text><Pressable onPress={() => continuityCard.scenarioKey && onStartScenario ? onStartScenario(continuityCard.scenarioKey) : onNavigate?.('study')} className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5"><Play size={13} color="#fff" /><Text className="text-xs font-bold text-white">Resume Session</Text></Pressable></View>}{todayMoment && <View className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4"><Text className="text-xs font-bold uppercase tracking-wider text-emerald-400">Today's Curated Moment</Text><Text className="mt-2 text-base font-bold text-white">{todayMoment.headline}</Text><Text className="mt-1 text-xs text-slate-300">{todayMoment.subtext}</Text><Pressable onPress={() => todayMoment.scenarioKey && onStartScenario ? onStartScenario(todayMoment.scenarioKey) : onNavigate?.('map', { targetLocation: todayMoment.targetLocationKey })} className="mt-3.5 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5"><Play size={14} color="#064e3b" /><Text className="text-xs font-bold text-emerald-950">{todayMoment.primaryActionLabel}</Text></Pressable></View>}<View className="mt-4 flex-row flex-wrap gap-2.5"><Pressable onPress={() => setShowKnowledgeModal(true)} className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 py-3"><Text className="text-center text-xs font-semibold text-slate-200">Constellation</Text></Pressable><Pressable onPress={() => setShowCreativeModal(true)} className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 py-3"><Text className="text-center text-xs font-semibold text-slate-200">Creative Studio</Text></Pressable></View><View className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"><Text className="text-xs font-bold uppercase tracking-wider text-emerald-300">Living world</Text><Text className="mt-1 text-xs text-slate-300">{livingObjects.length} living objects are present.</Text></View></ScrollView><CreativeStudioModal visible={showCreativeModal} onClose={() => setShowCreativeModal(false)} /><KnowledgeGraphModal visible={showKnowledgeModal} onClose={() => setShowKnowledgeModal(false)} /><TimeCapsuleModal visible={showTimeCapsuleModal} onClose={() => setShowTimeCapsuleModal(false)} /><QuestShopModal visible={showQuestShopModal} onClose={() => setShowQuestShopModal(false)} /><SeasonalFestivalModal visible={showFestivalModal} onClose={() => setShowFestivalModal(false)} /><DiscoveriesModal visible={showDiscoveriesModal} onClose={() => setShowDiscoveriesModal(false)} /></SafeAreaView>;
}