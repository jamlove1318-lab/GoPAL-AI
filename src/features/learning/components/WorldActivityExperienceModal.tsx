import React,{useMemo,useState}from'react';
import{Modal,Pressable,Text,View}from'react-native';
import{Brain,Flag,Sparkles,Zap,CheckCircle2,RotateCcw}from'lucide-react-native';
import{worldMiniGameEngine}from'../../../engines/world/worldMiniGameEngine';
import{worldMiniGameCatalog}from'../../../engines/world/worldMiniGameCatalog';
import{worldMiniGameSelectionEngine}from'../../../engines/world/worldMiniGameSelectionEngine';

type Kind='quiz'|'quest'|'challenge'|'special';
const META={quiz:{label:'Quiz House',icon:Brain},quest:{label:'Quest',icon:Flag},challenge:{label:'Challenge',icon:Zap},special:{label:'Special Level',icon:Sparkles}} as const;

export function WorldActivityExperienceModal({visible,kind,scenarioId,onClose,onComplete}:{visible:boolean;kind:Kind;scenarioId?:string;onClose:()=>void;onComplete:()=>void}){
 const [step,setStep]=useState(0);const[score,setScore]=useState(0);const[done,setDone]=useState(false);
 const meta=META[kind];
 const scenario=useMemo(()=>scenarioId?worldMiniGameSelectionEngine.select({languageId:'ja',skillIds:[],worldId:'japan',placeId:'',recentGameIds:[]}).game:null,[scenarioId,visible]);
 const game=useMemo(()=>worldMiniGameCatalog.find(item=>item.kind===kind)||worldMiniGameCatalog.find(item=>item.kind==='quiz')||null,[kind]);
 const prompt=game?.rounds?.[step%Math.max(1,game.rounds.length)];
 const choices=prompt?.choices??['Try again','Not sure','Continue'];
 const choose=(index:number)=>{const correct=prompt?.correctIndex??0;if(index===correct)setScore(value=>value+1);if(step+1>=Math.max(1,game?.rounds?.length??3)){setDone(true)}else setStep(value=>value+1)};
 const reset=()=>{setStep(0);setScore(0);setDone(false)};
 React.useEffect(()=>{if(visible){reset()}},[visible,kind,scenarioId]);
 if(!visible)return null;
 return <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}><View className="flex-1 items-center justify-center bg-black/90 px-6"><View className="w-full max-w-xl rounded-[32px] border border-emerald-200/15 bg-slate-950 p-6"><View className="flex-row items-center"><View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10"><meta.icon size={21} color="#a7f3d0"/></View><View className="ml-3 flex-1"><Text className="text-[9px] font-bold uppercase tracking-[1.6px] text-emerald-200">{meta.label}</Text><Text className="mt-1 text-xl font-black text-white">A different way to learn</Text></View></View>{done?<><View className="mt-8 items-center"><CheckCircle2 size={44} color="#a7f3d0"/><Text className="mt-3 text-2xl font-black text-white">Activity complete</Text><Text className="mt-2 text-center text-sm text-slate-400">You scored {score} point{score===1?'':'s'}. The world can react to this activity without turning it into a resident lesson.</Text></View><View className="mt-6 flex-row gap-3"><Pressable onPress={reset} className="flex-1 flex-row items-center justify-center rounded-2xl bg-white/5 px-4 py-3"><RotateCcw size={15} color="#cbd5e1"/><Text className="ml-2 text-xs font-bold text-slate-200">Play again</Text></Pressable><Pressable onPress={onComplete} className="flex-1 rounded-2xl bg-emerald-300/15 px-4 py-3"><Text className="text-center text-xs font-bold text-emerald-100">Return to world</Text></Pressable></View></>:<><View className="mt-7 rounded-2xl bg-white/5 p-5"><Text className="text-base font-bold leading-6 text-white">{prompt?.prompt??'Choose the response that best fits the situation.'}</Text><Text className="mt-2 text-[10px] text-slate-500">Round {step+1} of {Math.max(1,game?.rounds?.length??3)}</Text></View><View className="mt-4 gap-2">{choices.map((choice:string,index:number)=><Pressable key={`${step}-${index}`} onPress={()=>choose(index)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><Text className="text-sm font-semibold text-slate-100">{choice}</Text></Pressable>)}</View><Pressable onPress={onClose} className="mt-4 px-3 py-2"><Text className="text-center text-xs font-bold text-slate-500">Leave activity</Text></Pressable></>}</View></View></Modal>;
}
