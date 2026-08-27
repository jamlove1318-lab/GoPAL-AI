import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal } from 'react-native';
import { useLearningSession } from '../../../hooks/useLearningSession';
import { KnowledgeEngine } from '../../../engines/knowledge/knowledgeEngine';
import { JourneyEngine } from '../../../engines/journey/journeyEngine';
import { TutorEngine } from '../../../engines/tutor/tutorEngine';
import { LocalStore } from '../../../lib/localStore';
import { WaveStore } from '../../../lib/waveStore';
import { eventBus } from '../../../engines/events/eventBus';
import { CassidyCharacter } from '../../../components/CassidyCharacter';
import { X, Send, CheckCircle, HelpCircle, Award, ChevronRight } from 'lucide-react-native';

interface LearningScenarioModalProps { visible: boolean; scenarioKey: string; onClose: () => void; }

export function LearningScenarioModal({ visible, scenarioKey, onClose }: LearningScenarioModalProps) {
  const { activeScenario, currentStep, currentStepIndex, totalSteps, evaluation, sessionCompleted, startScenario, submitResponse, nextStep, endSession } = useLearningSession();
  const [inputVal, setInputVal] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [thinkTogetherLevel, setThinkTogetherLevel] = React.useState<(typeof TutorEngine.HINT_LEVELS)[number] | null>(null);
  const [thinkTogetherText, setThinkTogetherText] = React.useState('');
  const recordedRef = React.useRef(false);

  React.useEffect(() => {
    if (visible && scenarioKey) {
      startScenario(scenarioKey);
      setInputVal(''); setShowHint(false); setThinkTogetherLevel(null); setThinkTogetherText(''); recordedRef.current = false;
    }
  }, [visible, scenarioKey, startScenario]);

  React.useEffect(() => {
    if (sessionCompleted && activeScenario && !recordedRef.current) {
      recordedRef.current = true;
      (async () => {
        const nodes = await LocalStore.getKnowledgeNodes();
        const context = `scenario:${activeScenario.id}`;
        for (const step of activeScenario.steps) {
          for (const c of step.expectedConcepts) {
            const node = nodes.find((n) => n.key === c);
            const label = node ? `${node.term} (${node.reading})` : c;
            await KnowledgeEngine.recordLearningEcho(c, label, context);
          }
        }
        await new JourneyEngine().earnSouvenir(`Conversation: ${activeScenario.title}`, 'memory', `Held a full dialogue with ${activeScenario.characterName} at ${activeScenario.locationName}.`);
        await WaveStore.recordDecision(`Completed "${activeScenario.title}" and chose to follow it through.`);
        eventBus.emit('learning:sessionCompleted', { sessionId: activeScenario.id, accuracy: evaluation?.accuracy ?? 0, activityType: 'real-world-dialogue' }, 'learning');
      })();
    }
  }, [sessionCompleted, activeScenario, evaluation]);

  const handleClose = () => { endSession(); onClose(); };
  const handleSend = async (textToSend?: string) => { const text = textToSend || inputVal; if (!text.trim()) return; await submitResponse(text); setInputVal(''); };
  if (!visible || !activeScenario || !currentStep) return null;

  return <Modal visible={visible} animationType="slide" transparent={false}>
    <View className="flex-1 bg-slate-950 px-5 pt-12 pb-6">
      <View className="flex-row items-center justify-between border-b border-slate-800 pb-4"><View className="flex-1 pr-3"><Text className="text-xs font-semibold uppercase tracking-wider text-emerald-400">{activeScenario.locationName}</Text><Text className="text-lg font-bold text-white">{activeScenario.title}</Text></View><Pressable onPress={handleClose} className="rounded-full bg-slate-800 p-2 active:bg-slate-700"><X size={18} color="#94a3b8" /></Pressable></View>
      <View className="mt-4 flex-row items-center justify-between"><Text className="text-xs font-medium text-slate-400">Dialogue Turn {currentStepIndex + 1} of {totalSteps}</Text><View className="flex-row gap-1">{Array.from({ length: totalSteps }).map((_, i) => <View key={i} className={`h-2 w-6 rounded-full ${i < currentStepIndex ? 'bg-emerald-500' : i === currentStepIndex ? 'bg-indigo-500' : 'bg-slate-800'}`} />)}</View></View>
      <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
        {!sessionCompleted ? <View>
          <View className="rounded-2xl border border-indigo-500/30 bg-slate-900 p-5 shadow-lg"><View className="flex-row items-center gap-3"><View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/30 border border-indigo-500/40"><Text className="text-2xl">{activeScenario.characterName === 'Ren' ? '☕' : activeScenario.characterName === 'Emi' ? '📚' : '🏮'}</Text></View><View><Text className="text-base font-bold text-white">{activeScenario.characterName}</Text><Text className="text-xs text-indigo-300">{activeScenario.characterRole}</Text></View></View><View className="mt-4 rounded-xl bg-slate-800/80 p-4 border border-slate-700"><Text className="text-lg font-bold text-white leading-relaxed">{currentStep.npcPrompt}</Text>{currentStep.npcPhonetic && <Text className="mt-1 text-xs text-indigo-300">{currentStep.npcPhonetic}</Text>}{showTranslation && currentStep.npcTranslation && <Text className="mt-2 text-xs italic text-slate-400 border-t border-slate-700/60 pt-2">“{currentStep.npcTranslation}”</Text>}</View><Pressable onPress={() => setShowTranslation(!showTranslation)} className="mt-2 self-end"><Text className="text-[11px] text-slate-400">{showTranslation ? 'Hide English translation' : 'Show English translation'}</Text></Pressable></View>
          {evaluation && <View className={`mt-4 rounded-2xl border p-4 ${evaluation.isCorrect ? 'border-emerald-500/40 bg-emerald-950/30' : 'border-amber-500/40 bg-amber-950/30'}`}><View className="flex-row items-center gap-2"><CheckCircle size={16} color={evaluation.isCorrect ? '#34d399' : '#fbbf24'} /><Text className={`text-sm font-bold ${evaluation.isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>{evaluation.feedback}</Text></View>{evaluation.cassidyHint && <View className="mt-2 flex-row items-start gap-2 rounded-xl bg-slate-900/60 p-2.5"><Text className="text-base">🦊</Text><Text className="flex-1 text-xs text-slate-300 italic leading-relaxed">{evaluation.cassidyHint}</Text></View>}{evaluation.culturalInsight && <Text className="mt-2 text-[11px] text-slate-400 leading-relaxed">💡 {evaluation.culturalInsight}</Text>}{currentStepIndex + 1 < totalSteps && <Pressable onPress={nextStep} className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 active:bg-emerald-500"><Text className="text-xs font-bold text-white">Next Turn</Text><ChevronRight size={16} color="#ffffff" /></Pressable>}</View>}
          <View className="mt-4"><View className="flex-row items-center justify-between"><Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">Suggested Responses</Text><Pressable onPress={() => setShowHint(!showHint)} className="flex-row items-center gap-1"><HelpCircle size={13} color="#a78bfa" /><Text className="text-xs text-indigo-300">{showHint ? 'Hide Hint' : 'Need a Hint?'}</Text></Pressable></View>{showHint && <View className="mt-2 rounded-xl bg-indigo-950/60 p-3 border border-indigo-500/30"><Text className="text-xs text-indigo-200">{currentStep.hint}</Text></View>}<View className="mt-2.5 gap-2">{currentStep.sampleResponses.map((sample, idx) => <Pressable key={idx} onPress={() => handleSend(sample.text)} className="rounded-xl border border-slate-800 bg-slate-900 p-3 active:bg-slate-800"><Text className="text-xs font-bold text-white">{sample.text}</Text><Text className="mt-0.5 text-[11px] text-slate-400">{sample.translation}</Text></Pressable>)}</View></View>
          <View className="mt-4"><Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">Or type your own response</Text><View className="mt-2 flex-row items-center gap-2"><TextInput value={inputVal} onChangeText={setInputVal} placeholder="Type in Japanese or English..." placeholderTextColor="#64748b" className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-xs text-white border border-slate-800" onSubmitEditing={() => handleSend()} /><Pressable onPress={() => handleSend()} className="rounded-xl bg-indigo-600 p-3 active:bg-indigo-500"><Send size={16} color="#ffffff" /></Pressable></View></View>
          <View className="mt-4 rounded-2xl border border-violet-500/30 bg-violet-950/20 p-3"><Text className="text-[11px] font-bold uppercase tracking-wider text-violet-300">Think Together (Cassidy, not an answer machine)</Text><View className="mt-2 flex-row flex-wrap gap-1.5">{TutorEngine.HINT_LEVELS.map((lvl) => <Pressable key={lvl} onPress={() => { setThinkTogetherLevel(lvl); setThinkTogetherText(TutorEngine.hintForLevel(currentStep, lvl)); }} className={`rounded-full px-2.5 py-1 ${thinkTogetherLevel === lvl ? 'bg-violet-600' : 'bg-slate-800'}`}><Text className="text-[10px] font-bold text-white">{lvl}</Text></Pressable>)}</View>{thinkTogetherText ? <View className="mt-2 rounded-xl bg-slate-900/60 p-2.5"><Text className="text-xs italic text-violet-100">{thinkTogetherText}</Text></View> : null}</View>
        </View> : <View className="items-center py-10"><View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20"><Award size={36} color="#34d399" /></View><Text className="mt-4 text-2xl font-bold text-white">Journey moment complete</Text><Text className="mt-2 text-center text-sm leading-relaxed text-slate-400">You didn't just finish a lesson. The valley has something new to remember.</Text><CassidyCharacter height={150} action="waving" speaking expression="excited" /><Pressable onPress={handleClose} className="mt-5 rounded-xl bg-emerald-600 px-6 py-3"><Text className="text-sm font-bold text-white">Return to the world</Text></Pressable></View>}
      </ScrollView>
    </View>
  </Modal>;
}
