import './global.css';
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './src/features/home/screens/HomeScreen';
import { StudyScreen } from './src/features/study/screens/StudyScreen';
import { WorldMapScreen } from './src/features/world/screens/WorldMapScreen';
import { JourneyBookScreen } from './src/features/journey/screens/JourneyBookScreen';
import { MemoryMuseumScreen } from './src/features/journey/screens/MemoryMuseumScreen';
import { CharacterScreen } from './src/features/characters/screens/CharacterScreen';
import { SettingsScreen } from './src/features/settings/screens/SettingsScreen';
import { LearningScenarioModal } from './src/features/learning/screens/LearningScenarioModal';
import { LivingCompanion } from './src/components/LivingCompanion';
import { AmbientBackground } from './src/components/AmbientBackground';

import {
  Home,
  BookOpen,
  MapPin,
  Sparkles,
  Image as ImageIcon,
  Users,
  Settings as SettingsIcon,
} from 'lucide-react-native';

type TabKey = 'home' | 'study' | 'world' | 'journey' | 'museum' | 'characters' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [scenarioState, setScenarioState] = useState<{ visible: boolean; scenarioKey: string }>({
    visible: false,
    scenarioKey: 'scen-cafe-order',
  });

  const handleStartScenario = (scenarioKey: string) => {
    setScenarioState({
      visible: true,
      scenarioKey,
    });
  };

  const handleCloseScenario = () => {
    setScenarioState((prev) => ({ ...prev, visible: false }));
  };

  const handleNavigate = (tab: string, extra?: Record<string, unknown>) => {
    const target = tab === 'map' ? 'world' : tab;
    if (
      target === 'home' ||
      target === 'study' ||
      target === 'world' ||
      target === 'journey' ||
      target === 'museum' ||
      target === 'characters' ||
      target === 'settings'
    ) {
      setActiveTab(target as TabKey);
    }
  };


  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} onStartScenario={handleStartScenario} />;
      case 'study':
        return <StudyScreen />;
      case 'world':
        return <WorldMapScreen onStartScenario={handleStartScenario} />;
      case 'journey':
        return <JourneyBookScreen />;
      case 'museum':
        return <MemoryMuseumScreen />;
      case 'characters':
        return <CharacterScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen onNavigate={handleNavigate} onStartScenario={handleStartScenario} />;
    }
  };

  const TABS = [
    { key: 'home', label: 'Home', Icon: Home },
    { key: 'study', label: 'Study', Icon: BookOpen },
    { key: 'world', label: 'World', Icon: MapPin },
    { key: 'journey', label: 'Journey', Icon: Sparkles },
    { key: 'museum', label: 'Museum', Icon: ImageIcon },
    { key: 'characters', label: 'Friends', Icon: Users },
    { key: 'settings', label: 'Settings', Icon: SettingsIcon },
  ];

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-slate-950">
        <StatusBar style="light" />

        {/* Living atmosphere behind everything */}
        <AmbientBackground />

        {/* Active Screen View */}
        <View className="flex-1">{renderActiveScreen()}</View>

        {/* Bottom Tab Bar Navigation — floating, soft, alive */}
        <View className="mx-3 mb-2 flex-row items-center justify-around rounded-3xl border border-slate-800/60 bg-slate-900/80 px-1.5 py-2">
          {TABS.map(({ key, label, Icon }) => {
            const isSelected = activeTab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setActiveTab(key as TabKey)}
                className="items-center justify-center px-1.5 py-1"
              >
                <View
                  className={`items-center justify-center rounded-full px-3 py-1.5 ${
                    isSelected ? 'bg-emerald-500/15' : ''
                  }`}
                >
                  <Icon
                    size={19}
                    color={isSelected ? '#34d399' : '#64748b'}
                    strokeWidth={isSelected ? 2.4 : 1.8}
                  />
                  <Text
                    className={`mt-1 text-[10px] font-medium ${
                      isSelected ? 'text-emerald-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Living companion — Cassidy is always with you */}
        <LivingCompanion onTap={() => setActiveTab('home')} />

        {/* Interactive Dialogue Scenario Modal */}
        <LearningScenarioModal
          visible={scenarioState.visible}
          scenarioKey={scenarioState.scenarioKey}
          onClose={handleCloseScenario}
        />
      </View>
    </SafeAreaProvider>
  );
}

