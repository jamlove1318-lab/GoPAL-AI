import React from 'react';
import {Pressable,Text,View} from 'react-native';

export type WorldPlaceHotspotKind='landmark'|'resident'|'discovery'|'path'|'locked'|'quest'|'challenge'|'quiz'|'special';

export interface WorldPlaceHotspot {
  id:string;
  placeId?:string;
  label:string;
  kind:WorldPlaceHotspotKind;
  x:number;
  y:number;
  description?:string;
  locked?:boolean;
  enabled?:boolean;
  optional?:boolean;
  icon?:string;
  miniGameId?:string;
  scenarioIds?:string[];
  nextHotspotId?:string;
  metadata?:Record<string,unknown>;
}

export type WorldPlaceHotspotCatalog=Record<string,WorldPlaceHotspot[]>;

export function WorldPlaceHotspots({hotspots,onSelect}:{hotspots:WorldPlaceHotspot[];onSelect:(hotspot:WorldPlaceHotspot)=>void}){
  return <View className="absolute inset-0" pointerEvents="box-none">
    {hotspots.map(hotspot=><Pressable key={hotspot.id} accessibilityRole="button" accessibilityLabel={hotspot.label} disabled={hotspot.enabled!==true||hotspot.kind==='locked'} onPress={()=>onSelect(hotspot)} className="absolute items-center" style={{left:`${hotspot.x}%`,top:`${hotspot.y}%`,transform:[{translateX:-28},{translateY:-18}],opacity:hotspot.enabled===false?0.45:1}}>
      <View className="rounded-full border border-white/15 bg-slate-950/80 px-2.5 py-1.5 shadow-lg"><Text className="text-[9px] font-bold text-white">{hotspot.icon??(hotspot.kind==='resident'?'●':hotspot.kind==='locked'?'🔒':'◆')} {hotspot.label}</Text></View>
    </Pressable>)}
  </View>;
}
