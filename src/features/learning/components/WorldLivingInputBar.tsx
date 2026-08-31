import React from 'react';
import{Pressable,Text,View}from'react-native';
export type WorldLivingInput='type'|'words'|'speak'|'help';
export function WorldLivingInputBar({active,onSelect}:{active:WorldLivingInput;onSelect:(mode:WorldLivingInput)=>void}){const item=(value:WorldLivingInput,label:string,icon:string)=><Pressable onPress={()=>onSelect(value)} className={`flex-1 rounded-xl px-1.5 py-2 ${active===value?'bg-emerald-400':'bg-white/10'}`}><Text className={`text-center text-[10px] font-bold ${active===value?'text-slate-950':'text-white'}`}>{icon} {label}</Text></Pressable>;return <View className="rounded-2xl border border-white/10 bg-slate-950/90 p-1.5"><View className="flex-row gap-1.5">{item('type','Type','⌨️')}{item('words','Words','🧩')}{item('speak','Speak','🎙️')}{item('help','Help','💡')}</View></View>}
export default WorldLivingInputBar;
