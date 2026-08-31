import React from 'react';
import {Pressable,Text,View} from 'react-native';

export type WorldInputMode='free'|'blocks'|'speak'|'help';

export function WorldLivingInputBar({mode,onModeChange}:{mode:WorldInputMode;onModeChange:(mode:WorldInputMode)=>void}){
 const item=(value:WorldInputMode,label:string,icon:string)=><Pressable onPress={()=>onModeChange(value)} className={`flex-1 rounded-2xl px-2 py-3 ${mode===value?'bg-emerald-400':'bg-white/10'}`}><Text className={`text-center text-xs font-bold ${mode===value?'text-slate-950':'text-white'}`}>{icon} {label}</Text></Pressable>;
 return <View className="rounded-[24px] border border-white/10 bg-slate-950/90 p-2"><View className="flex-row gap-2">{item('free','Type','⌨️')}{item('blocks','Words','🧩')}{item('speak','Speak','🎙️')}{item('help','Help','💡')}</View></View>;
}
export default WorldLivingInputBar;
