import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { livingEncounterEngine, LivingEncounterResult } from '../../../engines/world/livingEncounterEngine';

export function LivingEncounterPanel({ encounter, onClose, onStartScenario }: { encounter: LivingEncounterResult; onClose: () => void; onStartScenario?: (scenario: string) => void }) {
  const [result, setResult] = useState<{ title: string; detail: string; scenario?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const choose = async (choice: LivingEncounterResult['choices'][number]) => {
    setBusy(true);
    try { setResult(await livingEncounterEngine.choose(encounter, choice)); } finally { setBusy(false); }
  };
  if (result) return <View className="rounded-[30px] border border-indigo-300/20 bg-slate-950/95 p-5"><Pressable onPress={onClose} className="absolute right-4 top-4"><X size={18} color="#94a3b8" /></Pressable><Text className="text-3xl">✦</Text><Text className="mt-2 text-xl font-black text-white">{result.title}</Text><Text className="mt-2 pr-6 text-sm leading-5 text-slate-300">{result.detail}</Text><Text className="mt-4 text-xs text-indigo-200">The world will remember this moment.</Text><View className="mt-5 flex-row"><Pressable onPress={onClose} className="rounded-full bg-white/10 px-4 py-2"><Text className="text-xs font-semibold text-white">Return to the valley</Text></Pressable>{result.scenario && <Pressable onPress={() => onStartScenario?.(result.scenario!)} className="ml-2 rounded-full bg-emerald-400/15 px-4 py-2"><Text className="text-xs font-semibold text-emerald-200">Follow the moment</Text></Pressable>}</View></View>;
  return <View className="rounded-[30px] border border-indigo-300/20 bg-slate-950/95 p-5"><Pressable onPress={onClose} className="absolute right-4 top-4"><X size={18} color="#94a3b8" /></Pressable><Text className="text-3xl">✦</Text><Text className="mt-2 text-xl font-black text-white">{encounter.title}</Text><Text className="mt-2 pr-6 text-sm leading-5 text-slate-300">{encounter.detail}</Text><View className="mt-5 gap-2">{encounter.choices.map((choice) => <Pressable key={choice.id} disabled={busy} onPress={() => choose(choice)} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 active:bg-emerald-400/10"><Text className="text-sm font-bold text-white">{choice.label}</Text><Text className="mt-1 text-xs leading-4 text-slate-400">{choice.detail}</Text></Pressable>)}</View></View>;
}
