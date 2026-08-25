import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useStudyRoom } from '../../../../hooks/useStudyRoom';

import { Sprout, Radio, BookOpen, Plus, Volume2, VolumeX, CheckCircle } from 'lucide-react-native';

export function StudyObjects() {
  const { studyState, waterPlant, switchRadioStation, toggleRadioPlay, addNote } = useStudyRoom();
  const [activeTab, setActiveTab] = useState<'plant' | 'radio' | 'notebook'>('plant');
  const [newTerm, setNewTerm] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [wateredToast, setWateredToast] = useState(false);

  const handleWater = async () => {
    await waterPlant();
    setWateredToast(true);
    setTimeout(() => setWateredToast(false), 2000);
  };

  const handleAddNote = async () => {
    if (!newTerm.trim() || !newNote.trim()) return;
    await addNote(newTerm.trim(), newNote.trim());
    setNewTerm('');
    setNewNote('');
    setShowNoteForm(false);
  };

  const STATIONS = [
    { key: 'lofi', label: 'Study Lo-Fi Beat', mood: 'Calm & Focused' },
    { key: 'nature', label: 'Kyoto Rain & Bamboo', mood: 'Peaceful Nature' },
    { key: 'cafe', label: 'Café Komorebi Ambience', mood: 'Gentle Coffee Shop' },
    { key: 'zen', label: 'Zen Temple Windchimes', mood: 'Deep Meditation' },
  ];

  return (
    <View className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      {/* Object Selector Tabs */}
      <View className="flex-row rounded-xl bg-slate-800/80 p-1">
        <Pressable
          onPress={() => setActiveTab('plant')}
          className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 ${
            activeTab === 'plant' ? 'bg-emerald-600' : 'bg-transparent'
          }`}
        >
          <Sprout size={15} color={activeTab === 'plant' ? '#ffffff' : '#94a3b8'} />
          <Text className={`text-xs font-semibold ${activeTab === 'plant' ? 'text-white' : 'text-slate-400'}`}>
            Bonsai Plant
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('radio')}
          className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 ${
            activeTab === 'radio' ? 'bg-indigo-600' : 'bg-transparent'
          }`}
        >
          <Radio size={15} color={activeTab === 'radio' ? '#ffffff' : '#94a3b8'} />
          <Text className={`text-xs font-semibold ${activeTab === 'radio' ? 'text-white' : 'text-slate-400'}`}>
            World Radio
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('notebook')}
          className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 ${
            activeTab === 'notebook' ? 'bg-amber-600' : 'bg-transparent'
          }`}
        >
          <BookOpen size={15} color={activeTab === 'notebook' ? '#ffffff' : '#94a3b8'} />
          <Text className={`text-xs font-semibold ${activeTab === 'notebook' ? 'text-white' : 'text-slate-400'}`}>
            Notebook
          </Text>
        </Pressable>
      </View>

      {/* Tab 1: Bonsai Plant (Blueprint Part XIII Plant System) */}
      {activeTab === 'plant' && (
        <View className="mt-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-bold text-white">Study Room Bonsai</Text>
              <Text className="text-xs text-slate-400">
                Growth Stage: {studyState.plantStage}/5 · Waterings: {studyState.plantWaterCount}
              </Text>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <Text className="text-xl">
                {studyState.plantStage >= 5 ? '🌳' : studyState.plantStage >= 3 ? '🪴' : '🌱'}
              </Text>
            </View>
          </View>

          {/* Plant Growth Progress Bar */}
          <View className="mt-3 h-2 w-full rounded-full bg-slate-800">
            <View
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${(studyState.plantStage / 5) * 100}%` }}
            />
          </View>

          <Text className="mt-2 text-xs text-slate-400">
            {studyState.plantStage >= 5
              ? 'Your bonsai is fully flourished with lush emerald leaves!'
              : 'Water the plant daily and complete sessions to help it grow into a flourishing bonsai.'}
          </Text>

          <Pressable
            onPress={handleWater}
            className="mt-3 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 active:bg-emerald-500"
          >
            <Sprout size={16} color="#ffffff" />
            <Text className="text-xs font-bold text-white">
              {wateredToast ? 'Tended with Love! ✨' : 'Water Bonsai Plant'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Tab 2: World Radio (Blueprint Part XIX Audio Engine) */}
      {activeTab === 'radio' && (
        <View className="mt-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-bold text-white">Atmospheric World Radio</Text>
              <Text className="text-xs text-slate-400">Curated background soundscapes for focus</Text>
            </View>
            <Pressable
              onPress={toggleRadioPlay}
              className={`rounded-lg p-2 ${studyState.isRadioPlaying ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              {studyState.isRadioPlaying ? (
                <Volume2 size={16} color="#ffffff" />
              ) : (
                <VolumeX size={16} color="#94a3b8" />
              )}
            </Pressable>
          </View>

          <View className="mt-3 gap-2">
            {STATIONS.map((st) => {
              const isSelected = studyState.activeRadioStation === st.key;
              return (
                <Pressable
                  key={st.key}
                  onPress={() => switchRadioStation(st.key)}
                  className={`flex-row items-center justify-between rounded-xl border p-2.5 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40'
                      : 'border-slate-800 bg-slate-800/40'
                  }`}
                >
                  <View>
                    <Text className={`text-xs font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>
                      {st.label}
                    </Text>
                    <Text className="text-[10px] text-slate-400">{st.mood}</Text>
                  </View>
                  {isSelected && studyState.isRadioPlaying && (
                    <Text className="text-[10px] font-semibold text-emerald-400">● LIVE</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Tab 3: Study Notebook (Blueprint Part X & XIII Personal Notes) */}
      {activeTab === 'notebook' && (
        <View className="mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-white">Study Notebook & Insights</Text>
            <Pressable
              onPress={() => setShowNoteForm(!showNoteForm)}
              className="flex-row items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1"
            >
              <Plus size={12} color="#ffffff" />
              <Text className="text-xs font-semibold text-white">Add Note</Text>
            </Pressable>
          </View>

          {showNoteForm && (
            <View className="mt-3 rounded-xl bg-slate-800/80 p-3 border border-slate-700">
              <TextInput
                value={newTerm}
                onChangeText={setNewTerm}
                placeholder="Term or Concept (e.g. Komorebi)"
                placeholderTextColor="#64748b"
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white"
              />
              <TextInput
                value={newNote}
                onChangeText={setNote => setNewNote(setNote)}
                placeholder="Personal insight or memory note..."
                placeholderTextColor="#64748b"
                className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white"
                multiline
              />
              <Pressable
                onPress={handleAddNote}
                className="mt-2 rounded-lg bg-amber-600 py-1.5"
              >
                <Text className="text-center text-xs font-semibold text-white">Save to Notebook</Text>
              </Pressable>
            </View>
          )}

          <View className="mt-3 gap-2">
            {studyState.notes.length === 0 ? (
              <Text className="text-xs text-slate-400">No notes yet. Tap Add Note to write personal reflections!</Text>
            ) : (
              studyState.notes.map((n: { id: string; term: string; note: string; createdAt: string }) => (
                <View key={n.id} className="rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                  <Text className="text-xs font-bold text-amber-300">{n.term}</Text>
                  <Text className="mt-1 text-xs text-slate-300 leading-relaxed">{n.note}</Text>
                  <Text className="mt-1 text-[10px] text-slate-500">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))

            )}
          </View>
        </View>
      )}
    </View>
  );
}

