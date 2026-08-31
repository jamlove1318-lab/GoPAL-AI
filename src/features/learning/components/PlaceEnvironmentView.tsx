import React from 'react';
import {Text,View} from 'react-native';
import {resolvePlaceEnvironment} from '../../../engines/world/placeEnvironmentPresentationEngine';

export function PlaceEnvironmentView({placeId}:{placeId:string}){
 const environment=resolvePlaceEnvironment(placeId);
 const kind=environment.kind;
 const architecture=kind==='cafe'?'▰  ▰  ▰':kind==='station'?'▰ ║ ║ ▰':kind==='street'?'⌂   ⌂   ⌂':kind==='shop'?'▣  ▣  ▣':kind==='classroom'?'▥  ▥  ▥':kind==='park'?'♧   ♧   ♧':kind==='market'?'▤  ▤  ▤':kind==='home'?'⌂  ⌂':'·   ·   ·';
 const ground=kind==='station'?'════════════════':kind==='street'?'━━━━━━━━━━━━━━━━':kind==='park'?'⌁  ⌁  ⌁  ⌁':'··············';
 return <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
  <View className="absolute inset-0 bg-slate-950"/>
  <View className="absolute inset-x-0 top-0 h-[48%] bg-sky-950/60"/>
  <View className="absolute inset-x-0 top-[31%] h-[22%] items-center justify-center bg-slate-800/45">
   <Text className="text-5xl font-black tracking-[8px] text-white/10">{architecture}</Text>
  </View>
  <View className="absolute inset-x-0 bottom-0 h-[48%] bg-slate-950/90"/>
  <View className="absolute inset-x-0 bottom-[28%] items-center"><Text className="text-xl font-black tracking-[6px] text-white/10">{ground}</Text></View>
  <View className="absolute inset-x-0 top-[28%] flex-row justify-around px-4">
   {environment.ambientActors.slice(0,3).map((actor,index)=><View key={`${actor}-${index}`} className="items-center opacity-45"><View className="h-8 w-8 rounded-full bg-white/15"/><View className="mt-1 h-14 w-10 rounded-t-2xl bg-white/10"/><Text className="mt-1 text-[8px] text-white/50">{actor}</Text></View>)}
  </View>
  <View className="absolute bottom-[17%] left-5 rounded-2xl border border-white/10 bg-black/25 px-3 py-2"><Text className="text-[9px] font-bold uppercase tracking-[1.5px] text-white/55">{environment.title}</Text><Text className="mt-1 text-[8px] text-white/35">{environment.layers.join(' · ')}</Text></View>
 </View>;
}
export default PlaceEnvironmentView;
