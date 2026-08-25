import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, X, Sparkles, User, Clock, CheckCircle2, RotateCcw, Volume2 } from 'lucide-react-native';

interface ConversationArchiveModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ArchivedSession {
  id: string;
  title: string;
  locationName: string;
  npcName: string;
  npcAvatar: string;
  score: number;
  date: string;
  turns: {
    speaker: 'npc' | 'user' | 'cassidy';
    speakerName: string;
    text: string;
    phonetic: string;
    translation: string;
    feedback?: string;
  }[];
}

const ARCHIVED_SESSIONS: ArchivedSession[] = [
  {
    id: 'arch-1',
    title: 'Ordering Morning Matcha at Café Komorebi',
    locationName: 'Café Komorebi',
    npcName: 'Ren',
    npcAvatar: '☕',
    score: 95,
    date: 'Yesterday at 9:15 AM',
    turns: [
      {
        speaker: 'npc',
        speakerName: 'Ren (Barista)',
        text: 'いらっしゃいませ！ご注文はお決まりですか？',
        phonetic: 'Irasshaimase! Gochuumon wa okimari desu ka?',
        translation: 'Welcome! Have you decided on your order?',
      },
      {
        speaker: 'user',
        speakerName: 'You (Learner)',
        text: 'ホット抹茶ラテをこれをください。',
        phonetic: 'Hotto matcha rate o kore o kudasai.',
        translation: 'Hot matcha latte, this one please.',
        feedback: '✨ Cassidy: Natural polite request with "kudasai".',
      },
      {
        speaker: 'npc',
        speakerName: 'Ren (Barista)',
        text: 'かしこまりました！店内でお召し上がりですか？',
        phonetic: 'Kashikomarimashita! Tennai de omeshiagari desu ka?',
        translation: 'Understood! Will you be having that in-store?',
      },
      {
        speaker: 'user',
        speakerName: 'You (Learner)',
        text: 'はい、ここで飲みます。',
        phonetic: 'Hai, koko de nomimasu.',
        translation: 'Yes, I will drink it here.',
        feedback: '✨ Cassidy: Clear affirmative response!',
      },
    ],
  },
  {
    id: 'arch-2',
    title: 'Inquiring About Folklore Scrolls',
    locationName: 'The Whispering Library',
    npcName: 'Emi',
    npcAvatar: '📜',
    score: 90,
    date: '3 days ago at 4:30 PM',
    turns: [
      {
        speaker: 'npc',
        speakerName: 'Emi (Wisdom Keeper)',
        text: 'こんにちは。何かお探しの古文書はありますか？',
        phonetic: 'Konnichiwa. Nanika osagashi no komonjo wa arimasu ka?',
        translation: 'Hello. Is there a historical document you are looking for?',
      },
      {
        speaker: 'user',
        speakerName: 'You (Learner)',
        text: '京都の古い民話の本を読みたいです。',
        phonetic: 'Kyouto no furui minwa no hon o yomitai desu.',
        translation: 'I would like to read books of old Kyoto folklore.',
        feedback: '✨ Cassidy: Great use of the "-tai desu" desire conjugation!',
      },
    ],
  },
];

export function ConversationArchiveModal({ visible, onClose }: ConversationArchiveModalProps) {
  const [selectedSession, setSelectedSession] = useState<ArchivedSession>(ARCHIVED_SESSIONS[0]);
  const [drillMessage, setDrillMessage] = useState<string | null>(null);

  const handlePronounceTurn = (text: string) => {
    setDrillMessage(`🔊 Cassidy: Pronouncing "${text}" with natural pitch contour.`);
    setTimeout(() => setDrillMessage(null), 2500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <SafeAreaView className="h-[90%] rounded-t-3xl bg-slate-950 border-t border-slate-800 p-5">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
            <View className="flex-row items-center gap-2">
              <MessageSquare size={18} color="#34d399" />
              <View>
                <Text className="text-base font-bold text-white">Conversation Transcripts</Text>
                <Text className="text-[10px] text-emerald-400">Dialogue History & Speech Drills</Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-800"
            >
              <X size={16} color="#94a3b8" />
            </Pressable>
          </View>

          {/* Toast */}
          {drillMessage && (
            <View className="mt-2 rounded-xl bg-indigo-950/80 p-2 border border-indigo-500/30 items-center">
              <Text className="text-xs text-indigo-300 font-semibold">{drillMessage}</Text>
            </View>
          )}

          <ScrollView className="flex-1 mt-3" showsVerticalScrollIndicator={false}>
            {/* Session Selector */}
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Past Roleplay Sessions
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {ARCHIVED_SESSIONS.map((sess) => (
                  <Pressable
                    key={sess.id}
                    onPress={() => setSelectedSession(sess)}
                    className={`flex-row items-center gap-2 rounded-2xl border p-3 ${
                      selectedSession.id === sess.id
                        ? 'border-emerald-500 bg-emerald-950/40'
                        : 'border-slate-800 bg-slate-900'
                    }`}
                  >
                    <Text className="text-xl">{sess.npcAvatar}</Text>
                    <View>
                      <Text
                        className={`text-xs font-bold ${
                          selectedSession.id === sess.id ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {sess.npcName} · {sess.locationName}
                      </Text>
                      <Text className="text-[10px] text-slate-400">{sess.date}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Selected Session Transcript */}
            <View className="rounded-2xl border border-slate-800 bg-slate-900 p-4 mb-4">
              <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <View>
                  <Text className="text-xs font-bold text-white">{selectedSession.title}</Text>
                  <Text className="text-[10px] text-slate-400">{selectedSession.locationName}</Text>
                </View>
                <View className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 border border-emerald-500/40">
                  <Text className="text-[10px] font-bold text-emerald-300">
                    Score: {selectedSession.score}%
                  </Text>
                </View>
              </View>

              {/* Turn list */}
              <View className="gap-3">
                {selectedSession.turns.map((turn, tIdx) => {
                  const isUser = turn.speaker === 'user';
                  return (
                    <View
                      key={tIdx}
                      className={`rounded-xl p-3 border ${
                        isUser
                          ? 'border-indigo-500/40 bg-indigo-950/20 ml-3'
                          : 'border-slate-800 bg-slate-950/60 mr-3'
                      }`}
                    >
                      <View className="flex-row items-center justify-between mb-1">
                        <Text
                          className={`text-[10px] font-bold ${
                            isUser ? 'text-indigo-300' : 'text-emerald-400'
                          }`}
                        >
                          {turn.speakerName}
                        </Text>
                        <Pressable
                          onPress={() => handlePronounceTurn(turn.text)}
                          className="flex-row items-center gap-1 rounded-lg bg-slate-800/80 px-2 py-0.5"
                        >
                          <Volume2 size={11} color="#94a3b8" />
                          <Text className="text-[9px] text-slate-300">Listen</Text>
                        </Pressable>
                      </View>

                      <Text className="text-xs font-bold text-white mb-0.5">{turn.text}</Text>
                      <Text className="text-[11px] text-slate-400">{turn.phonetic}</Text>
                      <Text className="text-[10px] text-slate-300 italic mt-1">
                        "{turn.translation}"
                      </Text>

                      {turn.feedback && (
                        <View className="mt-2 rounded-lg bg-emerald-950/40 p-1.5 border border-emerald-500/20">
                          <Text className="text-[10px] text-emerald-300">{turn.feedback}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
