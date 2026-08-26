import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocalStore } from '../../../lib/localStore';
import { auth } from '../../../services/auth';
import { EngineTestRunner, TestSuiteReport } from '../../../engines/testRunner';
import {
  Volume2,
  Eye,
  Globe,
  Target,
  Clock,
  RefreshCw,
  LogOut,
  Check,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react-native';

const LANGUAGES = [
  'Japanese (日本語)',
  'Spanish (Español)',
  'French (Français)',
  'Mandarin (中文)',
  'German (Deutsch)',
  'Italian (Italiano)',
];

const INTENTIONS = [
  'Conversation & Culture',
  'Travel Preparation',
  'Academic Study',
  'Casual & Relaxed',
];

const LENGTHS = [3, 5, 10, 15];

export function SettingsScreen() {
  const [targetLanguage, setTargetLanguage] = useState('Japanese (日本語)');
  const [learningIntention, setLearningIntention] = useState('Conversation & Culture');
  const [sessionLength, setSessionLength] = useState(5);
  const [audio, setAudio] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [resetToast, setResetToast] = useState(false);

  // Diagnostics test runner state
  const [testReport, setTestReport] = useState<TestSuiteReport | null>(null);
  const [runningTests, setRunningTests] = useState(false);

  useEffect(() => {
    LocalStore.getPreferences().then((p: {
      targetLanguage: string;
      learningIntention: string;
      sessionLength: number;
      audioEnabled: boolean;
      reducedMotion: boolean;
      companionPresence: 'quiet' | 'natural' | 'active';
    }) => {
      setTargetLanguage(p.targetLanguage);
      setLearningIntention(p.learningIntention);
      setSessionLength(p.sessionLength);
      setAudio(p.audioEnabled);
      setReducedMotion(p.reducedMotion);
    });
  }, []);

  const handleLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
    LocalStore.savePreferences({ targetLanguage: lang });
  };

  const handleIntentionChange = (intent: string) => {
    setLearningIntention(intent);
    LocalStore.savePreferences({ learningIntention: intent });
  };

  const handleLengthChange = (len: number) => {
    setSessionLength(len);
    LocalStore.savePreferences({ sessionLength: len });
  };

  const handleAudioToggle = (val: boolean) => {
    setAudio(val);
    LocalStore.savePreferences({ audioEnabled: val });
  };

  const handleMotionToggle = (val: boolean) => {
    setReducedMotion(val);
    LocalStore.savePreferences({ reducedMotion: val });
  };

  const handleResetWorld = async () => {
    await LocalStore.resetToSeedData();
    setResetToast(true);
    setTimeout(() => setResetToast(false), 2500);
  };

  const handleRunDiagnostics = async () => {
    setRunningTests(true);
    const report = await EngineTestRunner.runAllTests();
    setTestReport(report);
    setRunningTests(false);
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
              Personal World Settings
            </Text>
            <Text className="text-2xl font-bold text-white">Settings</Text>
          </View>
        </View>

        {/* Section 1: Target Language */}
        <View className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Globe size={16} color="#60a5fa" />
            <Text className="text-sm font-bold text-white">Target Language</Text>
          </View>
          <View className="gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = targetLanguage === lang;
              return (
                <Pressable
                  key={lang}
                  onPress={() => handleLanguageChange(lang)}
                  className={`flex-row items-center justify-between rounded-xl border p-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40'
                      : 'border-slate-800 bg-slate-800/40'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isSelected ? 'text-indigo-300' : 'text-slate-300'
                    }`}
                  >
                    {lang}
                  </Text>
                  {isSelected && <Check size={16} color="#818cf8" />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section 2: Learning Intention (Blueprint Part VIII #19) */}
        <View className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Target size={16} color="#34d399" />
            <Text className="text-sm font-bold text-white">Learning Intention</Text>
          </View>
          <View className="gap-2">
            {INTENTIONS.map((intent) => {
              const isSelected = learningIntention === intent;
              return (
                <Pressable
                  key={intent}
                  onPress={() => handleIntentionChange(intent)}
                  className={`flex-row items-center justify-between rounded-xl border p-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/40'
                      : 'border-slate-800 bg-slate-800/40'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isSelected ? 'text-emerald-300' : 'text-slate-300'
                    }`}
                  >
                    {intent}
                  </Text>
                  {isSelected && <Check size={16} color="#34d399" />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section 3: Session Length (Blueprint Part VIII #20) */}
        <View className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Clock size={16} color="#fbbf24" />
            <Text className="text-sm font-bold text-white">Target Daily Session Length</Text>
          </View>
          <View className="flex-row gap-2">
            {LENGTHS.map((len) => {
              const isSelected = sessionLength === len;
              return (
                <Pressable
                  key={len}
                  onPress={() => handleLengthChange(len)}
                  className={`flex-1 items-center justify-center rounded-xl border py-2.5 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-950/40'
                      : 'border-slate-800 bg-slate-800/40'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? 'text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    {len} min
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section 4: Atmosphere & Accessibility */}
        <View className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <View className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center gap-2">
              <Volume2 size={16} color="#818cf8" />
              <Text className="text-xs font-medium text-slate-300">
                Ambient Soundscapes & Audio
              </Text>
            </View>
            <Switch
              value={audio}
              onValueChange={handleAudioToggle}
              trackColor={{ false: '#334155', true: '#4f46e5' }}
            />
          </View>

          <View className="mt-3 flex-row items-center justify-between border-t border-slate-800 pt-3">
            <View className="flex-row items-center gap-2">
              <Eye size={16} color="#a78bfa" />
              <Text className="text-xs font-medium text-slate-300">Reduced Motion Mode</Text>
            </View>
            <Switch
              value={reducedMotion}
              onValueChange={handleMotionToggle}
              trackColor={{ false: '#334155', true: '#4f46e5' }}
            />
          </View>
        </View>

        {/* Section 5: Engine Diagnostics & Self-Verification (Blueprint #188) */}
        <View className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Activity size={16} color="#38bdf8" />
              <Text className="text-sm font-bold text-white">Engine Diagnostics & Health</Text>
            </View>
            {testReport && (
              <View className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 border border-emerald-500/40">
                <Text className="text-[10px] font-bold text-emerald-300">
                  {testReport.passedTests}/{testReport.totalTests} Passed
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-slate-400 mb-3 leading-relaxed">
            Run automated self-tests across all 12 autonomous engines (World, Continuity, Cassidy, Memory, Socratic Tutor, Director, and Economy).
          </Text>

          <Pressable
            onPress={handleRunDiagnostics}
            disabled={runningTests}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 active:bg-sky-500"
          >
            <Activity size={14} color="#ffffff" />
            <Text className="text-xs font-bold text-white">
              {runningTests ? 'Running Self-Diagnostics…' : 'Run Full Engine Verification'}
            </Text>
          </Pressable>

          {testReport && (
            <View className="mt-3 gap-1.5 pt-2 border-t border-slate-800">
              {testReport.results.map((r, i) => (
                <View
                  key={i}
                  className="flex-row items-center justify-between rounded-lg bg-slate-950/60 p-2 border border-slate-800"
                >
                  <View className="flex-row items-center gap-2 flex-1 pr-2">
                    {r.passed ? (
                      <CheckCircle2 size={13} color="#34d399" />
                    ) : (
                      <XCircle size={13} color="#f43f5e" />
                    )}
                    <View className="flex-1">
                      <Text className="text-[11px] font-bold text-white">{r.name}</Text>
                      <Text className="text-[9px] text-slate-400">{r.suite}</Text>
                    </View>
                  </View>
                  <Text className="text-[10px] text-slate-500">{r.durationMs}ms</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Reset World State Demo Data */}
        <Pressable
          onPress={handleResetWorld}
          className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 py-3.5 active:bg-slate-800"
        >
          <RefreshCw size={15} color="#94a3b8" />
          <Text className="text-xs font-semibold text-slate-300">
            {resetToast ? 'World State Reseeded to Default! ✨' : 'Reset World to Demo State'}
          </Text>
        </Pressable>

        {/* Sign Out */}
        <Pressable
          className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl bg-rose-500/20 py-3.5 border border-rose-500/30 active:bg-rose-500/30"
          onPress={() => auth.signOut()}
        >
          <LogOut size={15} color="#f43f5e" />
          <Text className="text-xs font-bold text-rose-300">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
