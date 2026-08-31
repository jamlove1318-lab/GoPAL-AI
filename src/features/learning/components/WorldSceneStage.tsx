import React,{useEffect,useMemo,useRef,useState}from'react';
import{Animated,Text,View}from'react-native';
import{CloudRain,Sun,Wind}from'lucide-react-native';
import{worldSceneVisualRuntime,type WorldSceneVisualRuntimeState}from'../../../engines/world/worldSceneVisualRuntime';
import{resolveLanguageWorld}from'../../../engines/world/languageWorldEngine';
import{getDestinationResidents}from'../../../engines/world/destinationResidentEngine';
import{residentPresentationController}from'../../../engines/world/residentPresentationController';
import{ResidentCharacterView}from'./ResidentCharacterView';

export function WorldSceneStage({worldId,placeId,residentId,showResident}:{worldId:any;placeId:string;residentId?:string;showResident:boolean}){
 const initial=useMemo(()=>worldSceneVisualRuntime.create(worldId,placeId,residentId),[worldId,placeId,residentId]);
 const[state,setState]=useState<WorldSceneVisualRuntimeState>(initial);const reveal=useRef(new Animated.Value(0)).current;const breathe=useRef(new Animated.Value(0)).current;
 useEffect(()=>{setState(initial);reveal.setValue(showResident?1:0);},[initial,showResident,reveal]);
 useEffect(()=>{if(!showResident){reveal.setValue(0);return;}Animated.spring(reveal,{toValue:1,useNativeDriver:true,damping:16,stiffness:120}).start();},[showResident,reveal]);
 useEffect(()=>{const loop=Animated.loop(Animated.sequence([Animated.timing(breathe,{toValue:1,duration:1700,useNativeDriver:true}),Animated.timing(breathe,{toValue:0,duration:1700,useNativeDriver:true})]));loop.start();return()=>loop.stop();},[breathe]);
 useEffect(()=>{if(showResident)setState(current=>worldSceneVisualRuntime.revealResident(current));},[showResident]);
 const world=resolveLanguageWorld(worldId);const residents=getDestinationResidents(worldId,placeId);const resident=residentId?residents.find(item=>item.id===residentId):residents[0];
 const reaction=state.visual.resident;const presentation=resident?residentPresentationController.create(resident.id,resident.name,{activity:reaction?.motion==='working'?'working':'idle',motion:reaction?.motion??'idle',energy:100,attention:'learner',nextActivityAt:new Date()} as any,reaction as any):null;
 const weather=state.simulation.weather.condition;const WeatherIcon=weather==='rain'?CloudRain:weather==='wind'?Wind:Sun;const scale=reveal.interpolate({inputRange:[0,1],outputRange:[.72,1]});
 return <View className="absolute inset-0 overflow-hidden bg-slate-950"><View className="absolute inset-0 bg-emerald-950/30"/><View className="absolute -left-16 -top-12 h-64 w-64 rounded-full bg-emerald-500/10"/><View className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-cyan-500/10"/>
  <View className="absolute inset-x-0 top-0 flex-row items-center justify-between px-5 pb-3 pt-14"><View className="rounded-full border border-white/10 bg-black/35 px-3 py-2"><Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-emerald-200">{world.worldName} · {placeId}</Text></View><View className="flex-row items-center rounded-full border border-white/10 bg-black/35 px-3 py-2"><WeatherIcon size={14} color="#a7f3d0"/><Text className="ml-1 text-[10px] capitalize text-slate-200">{weather}</Text></View></View>
  <View className="flex-1 items-center justify-center px-6"><Animated.View style={{opacity:showResident?1:.92,transform:[{translateY:breathe.interpolate({inputRange:[0,1],outputRange:[0,-5]})}]}} className="w-full items-center"><View className="mb-8 h-52 w-72 rounded-[48px] border border-white/10 bg-black/15"/><Text className="text-xs font-semibold uppercase tracking-[2px] text-slate-500">{showResident?'Face-to-face':'Arrival'}</Text>{!showResident?<><Text className="mt-3 text-center text-xl font-black text-white">Taking in the surroundings…</Text><Text className="mt-2 text-center text-sm text-slate-400">The place comes first. Listen to the world around you.</Text></>:<Animated.View style={{opacity,transform:[{scale}]}} className="mt-4 items-center">{presentation&&<ResidentCharacterView state={presentation}/>}</Animated.View>}</Animated.View></View>
  <View className="px-5 pb-8"><Text className="text-center text-[11px] leading-5 text-slate-500">Weather, ambience, and the world continue while the scene changes.</Text></View>
 </View>;
}
