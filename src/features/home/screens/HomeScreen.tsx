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
  const [arrivalMode, setArrivalMode] = useState<'resume' | 'explore' | 'calm' | 'study'>('study');
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
    Promise.all([
      ExperienceDirector.getTodayPrimaryMoment(),
      ExperienceDirector.getContinuityCard(),
      WaveStore.getLivingObjects(),
      ExperienceDirector.selfModelReflection(),
      ExperienceDirector.resolveArrivalMode(),
    ]).then(([moment, card, objects, reflection, mode]) => {
      if (!active) return;
      setTodayMoment(moment);
      setContinuityCard(card);
      setLivingObjects(objects);
      setSelfModel(reflection);
      setArrivalMode(mode);
    }).catch(() => { /* Home should remain usable if optional experience data is unavailable. */ });
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
  const arrivalCopy = {
    resume: { label: 'Continue your thread', detail: continuityCard?.title ?? 'Something unfinished is waiting quietly.' },
    explore: { label: 'There is somewhere new to wander', detail: todayMoment?.headline ?? 'Let the world choose a direction.' },
    calm: { label: 'Take a gentle return', detail: 'No pressure. The world is here when you are ready.' },
    study: { label: 'A small study moment awaits', detail: todayMoment?.headline ?? 'Begin with something simple.' },
  }[arrivalMode];

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        <View className="flex-row items-center justify-between">
          <View><Text className="text-xs font-semibold uppercase tracking-wider text-emerald-400">{state?.world?.display_name ?? 'GoPAL Living World'}</Text><Text className="mt-0.5 text-2xl font-bold text-white">Your Sanctuary</Text></View>
          <Pressable onPress={() => setShowFestivalModal(true)} className="flex-row items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1.5 active:bg-slate-700">{timeIcon}<Text className="text-xs font-medium capitalize text-slate-200">{season} · {timeOfDay} ✨</Text></Pressable>
        </View>
        <View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-3"><CassidyCharacter height={60} action="idle" speaking={false} expression="warm" /><View className="flex-1"><Text className="text-[11px] font-semibold text-emerald-300">Cassidy</Text><Text className="text-[12px] italic text-emerald-100">{snapshot ? Cassidy.placeLine('home', snapshot) : 'The valley is waking up with you.'}</Text></View></View>

        {/* Return Signature: the Director decides emphasis; the learner still chooses what to do. */}
        <View className="mt-4 rounded-2xl border border-violet-500/25 bg-violet-950/20 p-4">
          <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-violet-300">A thought for your return</Text>
          <Text className="mt-1.5 text-base font-bold text-white">{arrivalCopy.label}</Text>
          <Text className="mt-1 text-xs leading-5 text-slate-300">{arrivalCopy.detail}</Text>
          {arrivalMode === 'resume' && continuityCard?.scenarioKey && onStartScenario && <Pressable onPress={() => onStartScenario(continuityCard.scenarioKey!)} className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 active:bg-violet-700"><Play size={13} color="#fff" /><Text className="text-xs font-bold text-white">Resume</Text></Pressable>}
          {arrivalMode === 'explore' && todayMoment && onNavigate && <Pressable onPress={() => onNavigate('world', { locationKey: todayMoment.targetLocationKey })} className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 active:bg-violet-700"><Compass size={13} color="#fff" /><Text className="text-xs font-bold text-white">Explore</Text></Pressable>}
          {arrivalMode === 'study' && onNavigate && <Pressable onPress={() => onNavigate('study')} className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 active:bg-violet-700"><BookOpen size={13} color="#fff" /><Text className="text-xs font-bold text-white">Start a small session</Text></Pressable>}
        </View>

        {continuity && (continuity.newDay || continuity.isNewSeason || continuity.recap.length > 0) && <View className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-950/25 p-4"><View className="flex-row items-center justify-between"><View className="flex-row items-center gap-2"><Sun size={15} color="#fb7185" /><Text className="text-xs font-bold uppercase tracking-wider text-rose-300">Welcome Back</Text></View><Text className="text-[10px] text-slate-400">While you were away</Text></View><Text className="mt-2 text-sm font-bold text-white">{continuity.newDay ? 'Your world entered a new day.' : 'The world kept living while you were gone.'}</Text>{continuity.recap.length > 0 && <View className="mt-2 gap-1">{continuity.recap.map((line, i) => <Text key={i} className="text-xs text-slate-300">{'• '}{line}</Text>)}</View>}<Text className="mt-2.5 text-[11px] italic text-slate-400">Nothing required your attention — the world simply continued.</Text></View>}

        {continuityCard && <View className="mt-4 rounded-2xl border border-blue-500/40 bg-blue-950/30 p-4"><View className="flex-row items-center justify-between"><View className="flex-row items-center gap-2"><RotateCcw size={15} color="#60a5fa" /><Text className="text-xs font-bold uppercase tracking-wider text-blue-300">Pick Up Where You Left Off</Text></View><Text className="text-[10px] text-slate-400">Unfinished Context</Text></View><Text className="mt-2 text-sm font-bold text-white">{continuityCard.title}</Text><Text className="mt-0.5 text-xs text-slate-300">{continuityCard.promptSnippet}</Text><Pressable onPress={() => continuityCard.scenarioKey && onStartScenario ? onStartScenario(continuityCard.scenarioKey) : onNavigate?.('study')} className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 active:bg-blue-700"><Play size={13} color="#fff" /><Text className="text-xs font-bold text-white">Resume Session</Text></Pressable></View>}
      </ScrollView>
    </SafeAreaView>
  );
}
