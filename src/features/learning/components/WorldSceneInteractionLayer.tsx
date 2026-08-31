import React,{useMemo,useState}from'react';
import{Pressable,Text,View}from'react-native';
import{Compass,MapPin}from'lucide-react-native';
import{WorldSceneStage}from'./WorldSceneStage';
import{WorldPlaceHotspots,type WorldPlaceHotspot}from'./WorldPlaceHotspots';
import{getWorldPlaceHotspots}from'./worldPlaceHotspotCatalog';
import{destinationExperienceEngine,type LocationType}from'../../../engines/world/destinationExperienceEngine';
const ICONS:Record<LocationType,string>={neighborhood:'🏘️',market:'🏪',cafe:'☕','tea-shop':'🍵',station:'🚉',landmark:'⛩️',garden:'🌳',temple:'🛕',coast:'🌊',workshop:'🧵',festival:'🎐'};
export function WorldSceneInteractionLayer({worldId,placeId,residentId,showResident,onExplore}:{worldId:any;placeId:string;residentId?:string;showResident:boolean;onExplore:()=>void}){
 const moment=destinationExperienceEngine.createMoment(worldId,placeId); const [selected,setSelected]=useState<WorldPlaceHotspot|null>(null); const hotspots=useMemo(()=>getWorldPlaceHotspots(placeId),[placeId]);
 const select=(hotspot:WorldPlaceHotspot)=>{setSelected(hotspot);if(hotspot.kind==='resident')onExplore();};
 return <View className="absolute inset-0"><WorldSceneStage worldId={worldId} placeId={placeId} residentId={residentId} showResident={showResident}/>{!showResident&&<>
  <View className="absolute left-5 right-5 top-[24%] flex-row items-center justify-between"><View className="rounded-full border border-white/10 bg-black/35 px-3 py-2"><Text className="text-[9px] font-bold uppercase tracking-[1.5px] text-emerald-200">Explore the place</Text></View><View className="rounded-full border border-white/10 bg-black/35 px-3 py-2"><Compass size={13} color="#a7f3d0"/></View></View>
  <WorldPlaceHotspots hotspots={hotspots} onSelect={select}/>
  <View className="absolute inset-x-5 top-[38%] flex-row flex-wrap justify-center gap-2">{moment.area.locationTypes.slice(0,4).map(type=><View key={type} className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-2"><Text className="text-[10px] text-slate-200">{ICONS[type]} {type.replace('-',' ')}</Text></View>)}</View>
  {selected&&<View className="absolute inset-x-8 bottom-[24%] rounded-[26px] border border-emerald-300/15 bg-slate-950/90 p-4"><Text className="text-xs font-bold uppercase tracking-[1.2px] text-emerald-200">{selected.kind==='locked'?'Not yet discovered':'You found something'}</Text><Text className="mt-1 text-lg font-bold text-white">{selected.label}</Text><Text className="mt-1 text-[11px] text-slate-400">{selected.kind==='locked'?'Complete more of this location to discover what is here.':selected.kind==='resident'?'Someone nearby is ready when the world reveals the encounter.':'Explore this part of the location and see what the world reveals.'}</Text></View>}
  {!selected&&<View className="absolute inset-x-8 bottom-[22%]"><Pressable accessibilityRole="button" accessibilityLabel="Explore this place" onPress={onExplore} className="items-center rounded-[28px] border border-emerald-300/15 bg-slate-950/70 px-5 py-4"><View className="flex-row items-center"><MapPin size={15} color="#a7f3d0"/><Text className="ml-2 text-sm font-bold text-emerald-100">Explore the surroundings</Text></View><Text className="mt-1 text-[10px] text-slate-400">Look around before anyone approaches.</Text></Pressable></View>}
 </>}</View>;
}
