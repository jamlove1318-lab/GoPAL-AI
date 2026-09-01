import React,{useMemo,useState}from'react';
import{Pressable,Text,View}from'react-native';
import{Eye,KeyRound,Search,Sparkles}from'lucide-react-native';
import{completeInvestigation,createInvestigationState,inspectClue,isClueAvailable,type InvestigationClue}from'../../../engines/world/worldInvestigationEngine';

export function WorldInvestigationBoard({clues,requiredClues,onComplete}:{clues:InvestigationClue[];requiredClues:string[];onComplete:()=>void}){
 const[state,setState]=useState(createInvestigationState());
 const available=useMemo(()=>clues.filter(clue=>isClueAvailable(state,clue)),[clues,state]);
 const inspect=(clue:InvestigationClue)=>{const next=inspectClue(state,clue);const completed=completeInvestigation(next,requiredClues);setState(completed);if(completed.completed)onComplete()};
 return <View className="mt-5"><View className="mb-3 flex-row items-center"><Search size={16} color="#a7f3d0"/><Text className="ml-2 text-[10px] font-bold uppercase tracking-[1.5px] text-emerald-200">Investigate the scene</Text></View><View className="gap-2">{clues.map(clue=>{const found=state.collected.includes(clue.id);const unlocked=available.some(item=>item.id===clue.id);return <Pressable key={clue.id} disabled={found||!unlocked} onPress={()=>inspect(clue)} className={`rounded-2xl border p-4 ${found?'border-emerald-300/20 bg-emerald-400/10':unlocked?'border-white/10 bg-white/5':'border-white/5 bg-white/[0.02]'}`}><View className="flex-row items-center"><View className="h-9 w-9 items-center justify-center rounded-xl bg-white/5">{found?<Sparkles size={15} color="#a7f3d0"/>:unlocked?<Eye size={15} color="#cbd5e1"/>:<KeyRound size={15} color="#64748b"/>}</View><View className="ml-3 flex-1"><Text className="text-sm font-bold text-white">{clue.label}</Text><Text className="mt-1 text-xs leading-5 text-slate-400">{found?clue.detail:unlocked?'Inspect this clue to reveal what it means.':'Something else must be discovered first.'}</Text></View></View></Pressable>})}</View><Text className="mt-3 text-[10px] text-slate-500">Clues discovered: {state.collected.length}/{requiredClues.length}</Text></View>
}
