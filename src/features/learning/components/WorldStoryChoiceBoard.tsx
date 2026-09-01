import React,{useMemo,useState}from'react';
import{Pressable,Text,View}from'react-native';
import{GitBranch,Heart,Sparkles}from'lucide-react-native';
import{chooseStoryOption,createStoryState,type StoryNode}from'../../../engines/world/worldStoryChoiceEngine';

export function WorldStoryChoiceBoard({nodes,startNodeId,onComplete}:{nodes:StoryNode[];startNodeId:string;onComplete:()=>void}){
 const[state,setState]=useState(()=>createStoryState(startNodeId));
 const node=useMemo(()=>nodes.find(item=>item.id===state.nodeId),[nodes,state.nodeId]);
 if(!node)return null;
 const choose=(choice:StoryNode['choices'][number])=>{const next=chooseStoryOption(state,node,choice);setState(next);if(next.completed)onComplete()};
 return <View className="mt-5"><View className="flex-row items-center"><View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10"><GitBranch size={17} color="#ddd6fe"/></View><View className="ml-3 flex-1"><Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-violet-200">Living story</Text><Text className="mt-1 text-lg font-black text-white">{node.title}</Text></View><Heart size={15} color="#94a3b8"/></View><View className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4"><Text className="text-sm leading-6 text-slate-200">{node.text}</Text></View><View className="mt-3 gap-2">{node.choices.map(choice=><Pressable key={choice.id} onPress={()=>choose(choice)} className="rounded-2xl border border-white/10 bg-white/5 p-4"><Text className="text-sm font-bold text-white">{choice.label}</Text>{choice.effects&&<Text className="mt-1 text-[10px] text-slate-500">Your choice will shape what happens next.</Text>}</Pressable>)}</View><View className="mt-3 flex-row items-center"><Sparkles size={12} color="#a7f3d0"/><Text className="ml-2 text-[10px] text-slate-500">Choices remembered: {state.history.length}</Text></View></View>
}
