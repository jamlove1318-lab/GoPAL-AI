import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CREATION_TEMPLATES, CreationStudio } from '../../../engines/creation/creationStudio';
import type { CustomCreation } from '../../../lib/localStore';
import { Sparkles, X, Palette, Check, Bookmark, Heart } from 'lucide-react-native';

interface CreativeStudioModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: (creation: CustomCreation) => void;
}

const THEMES = [
  { key: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-950/60', border: 'border-emerald-500/50', accent: 'bg-emerald-500' },
  { key: 'indigo', label: 'Indigo Night', bg: 'bg-indigo-950/60', border: 'border-indigo-500/50', accent: 'bg-indigo-500' },
  { key: 'amber', label: 'Warm Lantern', bg: 'bg-amber-950/60', border: 'border-amber-500/50', accent: 'bg-amber-500' },
  { key: 'purple', label: 'Zen Violet', bg: 'bg-purple-950/60', border: 'border-purple-500/50', accent: 'bg-purple-500' },
];

export function CreativeStudioModal({ visible, onClose, onSaved }: CreativeStudioModalProps) {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('emerald');
  const [tagInput, setTagInput] = useState('Matcha, Café, Japanese');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentTemplate = CREATION_TEMPLATES[selectedTemplateIndex];

  const handleSelectTemplate = (idx: number) => {
    setSelectedTemplateIndex(idx);
    const tmpl = CREATION_TEMPLATES[idx];
    setTitle(tmpl.placeholderTitle);
    setContent(tmpl.placeholderContent);
    setSelectedTheme(tmpl.defaultTheme);
  };

  const handleSave = async () => {
    const finalTitle = title.trim() || currentTemplate.placeholderTitle;
    const finalContent = content.trim() || currentTemplate.placeholderContent;
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);

    const created = await CreationStudio.createArtifact({
      type: currentTemplate.type,
      title: finalTitle,
      subtitle: `Created with Cassidy in ${currentTemplate.name}`,
      content: finalContent,
      visualTheme: selectedTheme,
      tags,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onSaved) onSaved(created);
      onClose();
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <SafeAreaView className="h-[92%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <Sparkles size={18} color="#34d399" />
              <Text className="text-lg font-bold text-white">Creative Learning Studio</Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-800"
            >
              <X size={16} color="#94a3b8" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 mt-3" showsVerticalScrollIndicator={false}>
            {/* Step 1: Choose Template */}
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              1. Choose Creation Type (Blueprint Wave 4A)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2.5">
                {CREATION_TEMPLATES.map((tmpl, idx) => {
                  const isSelected = selectedTemplateIndex === idx;
                  return (
                    <Pressable
                      key={tmpl.type}
                      onPress={() => handleSelectTemplate(idx)}
                      className={`w-36 rounded-2xl border p-3 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/40'
                          : 'border-slate-800 bg-slate-900'
                      }`}
                    >
                      <Text className="text-2xl mb-1">{tmpl.icon}</Text>
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-emerald-300' : 'text-white'
                        }`}
                      >
                        {tmpl.name}
                      </Text>
                      <Text className="mt-1 text-[10px] text-slate-400 line-clamp-2" numberOfLines={2}>
                        {tmpl.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Step 2: Theme Selector */}
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              2. Visual Atmosphere Theme
            </Text>
            <View className="flex-row gap-2 mb-4">
              {THEMES.map((th) => {
                const isSelected = selectedTheme === th.key;
                return (
                  <Pressable
                    key={th.key}
                    onPress={() => setSelectedTheme(th.key)}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-2.5 ${
                      isSelected ? 'border-emerald-400 bg-slate-800' : 'border-slate-800 bg-slate-900'
                    }`}
                  >
                    <View className={`h-3 w-3 rounded-full ${th.accent}`} />
                    <Text className="text-[10px] font-medium text-slate-300">{th.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Step 3: Content Editing */}
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              3. Title & Personal Note
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={currentTemplate.placeholderTitle}
              placeholderTextColor="#64748b"
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white mb-2.5 font-semibold"
            />

            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder={currentTemplate.placeholderContent}
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="h-28 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-white mb-3 leading-relaxed"
            />

            <Text className="text-[11px] font-semibold text-slate-400 mb-1.5">
              Tags (comma separated)
            </Text>
            <TextInput
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Matcha, Café, Japanese"
              placeholderTextColor="#64748b"
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white mb-5"
            />

            {/* Cassidy Note of Encouragement */}
            <View className="flex-row items-center gap-2 rounded-xl bg-indigo-950/40 p-3 border border-indigo-500/30 mb-5">
              <Text className="text-xl">🦊</Text>
              <Text className="flex-1 text-[11px] text-indigo-300 leading-snug">
                Cassidy: "I love this! Once saved, your creation will be exhibited in the Memory Museum forever."
              </Text>
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 mb-6 active:bg-emerald-600"
            >
              {savedSuccess ? (
                <>
                  <Check size={18} color="#064e3b" />
                  <Text className="font-bold text-emerald-950">Exhibited in Memory Museum! ✨</Text>
                </>
              ) : (
                <>
                  <Bookmark size={18} color="#064e3b" />
                  <Text className="font-bold text-emerald-950">Save & Exhibit Creation</Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
