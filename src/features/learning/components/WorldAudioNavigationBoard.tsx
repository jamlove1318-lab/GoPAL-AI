import React,{useState}from'react';
import{Pressable,Text,View}from'react-native';
import{Headphones,MapPin,Navigation,Volume2}from'lucide-react-native';
import{createAudioNavigationState,followWaypoint,type AudioWaypoint}from'../../../engines/world/worldAudioNavigationEngine';

export function WorldAudioNavigationBoard({waypoints,onComplete}:{waypoints:AudioWaypoint[];onComplete:()=>void}){
 const start=waypoints[0];const[state,setState]=useState(()=>createAudioNavigationState(start?.id??''));
 const currentIndex=waypoints.findIndex(item=>item.id===state.currentId);const expected=waypoints[currentIndex+1];
 if(!start)return null;
 const choose=(id:string)=>{const next=followWaypoint(state,expected?.id??id,id,expected?.nextId);setState(next);if(next.completed)onComplete()};
 return <View className="mt-5"><View className="flex-row items-center"><View className="h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10"><Headphones size={17} color="#a7f3d0"/></View><View className="ml-3 flex-1"><Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-emerald-200">Listen & navigate</Text><Text className="mt-1 text-xs text-slate-400">Follow the spoken clue to the next landmark.</Text></View><Volume2 size={16} color="#94a3b8"/></View><View className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4"><Text className="text-[10px] font-bold uppercase tracking-[1.2px] text-slate-500">Current landmark</Text><Text className="mt-1 text-lg font-black text-white">{waypoints[currentIndex]?.label??start.label}</Text><Text className="mt-2 text-sm leading-5 text-slate-300">{expected?.hint??'You have reached the final landmark.'}</Text></View><View className="mt-3 gap-2">{waypoints.filter(item=>item.id!==state.currentId).map(item=><Pressable key={item.id} onPress={()=>choose(item.id)} className="flex-row items-center rounded-2xl border border-white/10 bg-white/5 p-4"><MapPin size={16} color="#a7f3d0"/><Text className="ml-3 flex-1 text-sm font-bold text-slate-100">{item.label}</Text><Navigation size={14} color="#64748b"/></Pressable>)}</View>{state.mistakes>0&&<Text className="mt-3 text-center text-[10px] text-amber-200">The clue doesn't lead there. Listen again and try another landmark.</Text>}<Text className="mt-3 text-[10px] text-slate-500">Landmarks reached: {state.visited.length}/{waypoints.length}</Text></View>
}
