import './global.css';
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StudyScreen } from './src/features/study/screens/StudyScreen';
import { WorldMapScreen } from './src/features/world/screens/WorldMapScreen';
import { JourneyBookScreen } from './src/features/journey/screens/JourneyBookScreen';
import { MemoryMuseumScreen } from './src/features/journey/screens/MemoryMuseumScreen';
import { CharacterScreen } from './src/features/characters/screens/CharacterScreen';
import { SettingsScreen } from './src/features/settings/screens/SettingsScreen';
import { CassidyHomeScreen } from './src/features/cassidy/screens/CassidyHomeScreen';
import { LearningScenarioModal } from './src/features/learning/screens/LearningScenarioModal';
import { LivingCompanion } from './src/components/LivingCompanion';
import { AmbientBackground } from './src/components/AmbientBackground';
import { LivingWorldScene } from './src/features/world/components/LivingWorldScene';
import { useLivingWorld } from './src/hooks/useLivingWorld';
import { worldIntensity } from './src/characters/cassidyContext';

import { ArrowLeft, BookOpen, Compass, Heart, Image as ImageIcon, Settings as SettingsIcon, Sparkles, Users } from 'lucide-react-native';

type TabKey = 'sanctuary' | 'cassidy' | 'study' | 'world' | 'journey' | 'museum' | 'characters' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('sanctuary');
  const [scenarioState, setScenarioState] = useState({ visible: false, scenarioKey: 'scen-cafe-order' });
  const { snapshot, loading: worldLoading, error: worldError, refresh: refreshWorld } = useLivingWorld();

  const handleStartScenario = (scenarioKey: string) => setScenarioState({ visible: true, scenarioKey });
  const handleCloseScenario = () => {
    setScenarioState((prev) => ({ ...prev, visible: false }));
    void refreshWorld();
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'sanctuary':
        return snapshot ? <LivingWorldScene snapshot={snapshot} onNavigate={(destination) => setActiveTab(destination)} onStartScenario={handleStartScenario} /> : null;
      case 'cassidy': return <CassidyHomeScreen />;
      case 'study': return <StudyScreen />;
      case 'world': return <WorldMapScreen onStartScenario={handleStartScenario} />;
      case 'journey': return <JourneyBookScreen />;
      case 'museum': return <MemoryMuseumScreen />;
      case 'characters': return <CharacterScreen />;
      case 'settings': return <SettingsScreen />;
      default: return null;
    }
  };

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-slate-950">
        <StatusBar style="light" />
        <AmbientBackground intensity={worldIntensity(snapshot?.cassidy ?? null)} />

        {worldLoading ? (
          <View className="flex-1 items-center justify-center px-8">
            <Sparkles size={38} color="#34d399" />
            <Text className="mt-4 text-lg font-semibold text-white">Your world is waking…</Text>
            <Text className="mt-2 text-center text-sm text-slate-400">Restoring your place, atmosphere, memories and Cassidy.</Text>
          </View>
        ) : worldError ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-lg font-semibold text-white">Your world is taking a moment.</Text>
            <Text className="mt-2 text-center text-sm text-slate-400">We kept the experience safe while it restores.</Text>
            <Pressable onPress={() => void refreshWorld()} className="mt-5 rounded-full bg-emerald-500 px-5 py-2.5"><Text className="font-bold text-emerald-950">Wake it again</Text></Pressable>
          </View>
        ) : (
          <View className="flex-1">
            {activeTab !== 'sanctuary' && (
              <Pressable onPress={() => setActiveTab('sanctuary')} className="absolute left-5 top-5 z-20 flex-row items-center rounded-full border border-white/10 bg-slate-950/55 px-3 py-2">
                <ArrowLeft size={16} color="#cbd5e1" /><Text className="ml-1.5 text-xs text-slate-300">Back to world</Text>
              </Pressable>
            )}
            {renderActiveScreen()}
          </View>
        )}

        {!worldLoading && !worldError && activeTab === 'sanctuary' && snapshot && (
          <View className="absolute bottom-4 left-5 right-5 flex-row items-center justify-between rounded-full border border-white/10 bg-slate-950/65 px-3 py-2">
            <Pressable onPress={() => setActiveTab('study')} className="items-center px-3 py-1.5"><BookOpen size={17} color="#94a3b8" /><Text className="mt-1 text-[9px] text-slate-400">Learn</Text></Pressable>
            <Pressable onPress={() => setActiveTab('world')} className="items-center px-3 py-1.5"><Compass size={18} color="#94a3b8" /><Text className="mt-1 text-[9px] text-slate-400">Wander</Text></Pressable>
            <Pressable onPress={() => setActiveTab('cassidy')} className="-mt-6 h-14 w-14 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/15"><Heart size={21} color="#a7f3d0" /><Text className="mt-0.5 text-[8px] font-semibold text-emerald-200">Cassidy</Text></Pressable>
            <Pressable onPress={() => setActiveTab('journey')} className="items-center px-3 py-1.5"><Sparkles size={17} color="#94a3b8" /><Text className="mt-1 text-[9px] text-slate-400">Journey</Text></Pressable>
            <Pressable onPress={() => setActiveTab('characters')} className="items-center px-3 py-1.5"><Users size={17} color="#94a3b8" /><Text className="mt-1 text-[9px] text-slate-400">People</Text></Pressable>
          </View>
        )}

        {!worldLoading && !worldError && activeTab !== 'sanctuary' && (
          <View className="absolute bottom-4 right-5 flex-row gap-2">
            <Pressable onPress={() => setActiveTab('museum')} className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/70"><ImageIcon size={17} color="#94a3b8" /></Pressable>
            <Pressable onPress={() => setActiveTab('settings')} className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/70"><SettingsIcon size={17} color="#94a3b8" /></Pressable>
          </View>
        )}

        {activeTab !== 'cassidy' && snapshot && <LivingCompanion activeTab={activeTab} snapshot={snapshot.cassidy} onTap={() => setActiveTab('cassidy')} />}
        <LearningScenarioModal visible={scenarioState.visible} scenarioKey={scenarioState.scenarioKey} onClose={handleCloseScenario} />
      </View>
    </SafeAreaProvider>
  );
}
