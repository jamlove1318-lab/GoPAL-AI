import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { useCassidy } from '../../../hooks/useCassidy';
import { MessageSquare, Send, Sparkles, Heart, ChevronDown, ChevronUp } from 'lucide-react-native';

export function CassidyRoom() {
  const { view, messages, sendMessage } = useCassidy();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const mood = view?.state?.mood ?? 'curious';

  return (
    <View className="mt-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-md">
      {/* Header Info */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/30 border border-indigo-500/40">
            <Text className="text-2xl">🦊</Text>
          </View>
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-white">Cassidy</Text>
              <View className="rounded-full bg-emerald-500/20 px-2 py-0.5 border border-emerald-500/30">
                <Text className="text-[10px] font-semibold text-emerald-400 capitalize">{mood}</Text>
              </View>
            </View>
            <Text className="text-xs text-slate-400">
              {view?.state?.current_activity ?? 'Resting quietly by the study window'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1">
          <Heart size={13} color="#f43f5e" />
          <Text className="text-xs font-semibold text-slate-300">
            {view?.relationship?.trust ?? 85}%
          </Text>
        </View>
      </View>

      {/* Expand / Collapse Dialogue Drawer */}
      <Pressable
        onPress={() => setIsChatOpen(!isChatOpen)}
        className="mt-3 flex-row items-center justify-between rounded-xl bg-slate-800/80 px-3.5 py-2.5 active:bg-slate-800"
      >
        <View className="flex-row items-center gap-2">
          <MessageSquare size={15} color="#818cf8" />
          <Text className="text-xs font-semibold text-indigo-300">
            {isChatOpen ? 'Close Conversation' : 'Chat with Cassidy'}
          </Text>
        </View>
        {isChatOpen ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
      </Pressable>

      {/* Chat Messages and Input */}
      {isChatOpen && (
        <View className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <ScrollView className="max-h-48" showsVerticalScrollIndicator={false}>
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <View
                  key={m.id}
                  className={`my-1 max-w-[85%] rounded-2xl p-3 ${
                    isUser
                      ? 'self-end bg-indigo-600'
                      : 'self-start bg-slate-800 border border-slate-700'
                  }`}
                >
                  <Text className="text-xs leading-relaxed text-white">{m.text}</Text>
                  <Text className="mt-1 text-[9px] text-slate-300 self-end">{m.timestamp}</Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Quick prompts */}
          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {['Tell me a cultural idiom', 'What should we practice?', 'How do you feel?'].map((p) => (
              <Pressable
                key={p}
                onPress={() => handleQuickPrompt(p)}
                className="rounded-lg bg-slate-800 px-2.5 py-1 border border-slate-700"
              >
                <Text className="text-[10px] text-slate-300">{p}</Text>
              </Pressable>
            ))}
          </View>

          {/* Message Input */}
          <View className="mt-2.5 flex-row items-center gap-2">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask or tell Cassidy anything..."
              placeholderTextColor="#64748b"
              className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs text-white border border-slate-700"
              onSubmitEditing={handleSend}
            />
            <Pressable
              onPress={handleSend}
              className="rounded-xl bg-indigo-600 p-2.5 active:bg-indigo-500"
            >
              <Send size={15} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

