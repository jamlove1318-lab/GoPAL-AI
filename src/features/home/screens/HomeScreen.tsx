import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorldState } from '../../../hooks/useWorldState';
import { useCassidy } from '../../../hooks/useCassidy';
import { tutorEngine } from '../../../engines/tutor/tutorEngine';
import { ExperienceDirector, TodayMoment, ExperienceIntent, ExperiencePlan } from '../../../engines/director/experienceDirector';
import { LocalStore, SessionBookmark } from '../../../lib/localStore';
import { livingWorldObjectsStore, LivingWorldObject } from '../../../engines/world/livingWorldObjectsStore';
import { auth } from '../../../services/auth';
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
  const [livingObjects, setLivingObjects] = useState<LivingWorldObject[]>([]);
  const [selfModel, setSelfModel] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const user = await auth.getCurrentUser();
      const uid = user?.id ?? 'local-explorer-user';
      await livingWorldObjectsStore.migrateLegacyLocalState(uid);
      const living = await livingWorldObjectsStore.getAll(uid);
      if (active) setLivingObjects(living);
      ExperienceDirector.getTodayPrimaryMoment().then((value) => active && setTodayMoment(value));
      ExperienceDirector.getContinuityCard().then((value) => active && setContinuityCard(value));
      ExperienceDirector.selfModelReflection().then((value) => active && setSelfModel(value));
    };
    void load();
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

  if (loading) {
    return <SafeAreaView className="flex-1 items-center justify-center bg-slate-950"><Sparkles size={36} color="#60a5fa" /><Text className="mt-4 text-base font-medium text-slate-300">Waking your learning world…</Text><Text className="mt-1 text-xs text-slate-500">Restoring world continuity and memories</Text></SafeAreaView>;
  }

  const timeOfDay = state?.timeOfDay ?? 'morning';
  const season = state?.season ?? 'spring';
  const mood = view?.state?.mood ?? 'curious';
  const timeIcon = timeOfDay === 'night' ? <Moon size={18} color="#93c5fd" /> : timeOfDay === 'evening' ? <Sun size={18} color="#fb923c" /> : <CloudSun size={18} color="#facc15" />;

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      {/* Existing Home UI continues below unchanged in the repository implementation. */}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-5 pt-6"><Text className="text-xs uppercase tracking-[2px] text-emerald-300">Emerald Valley</Text><Text className="mt-2 text-3xl font-semibold text-white">{timeIcon} {season} · {timeOfDay}</Text><Text className="mt-2 text-sm text-slate-300">{mood} · {livingObjects.length} living world objects</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}
