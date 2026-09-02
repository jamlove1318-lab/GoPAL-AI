import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { Compass, Sparkles } from 'lucide-react-native';
import { LivingWorldViewport } from '../components/LivingWorldViewport';
import { LivingGameWorld } from '../components/LivingGameWorld';
import { LivingPlayerLayer } from '../components/LivingPlayerLayer';
import { LivingSimulationActorLayer } from '../components/LivingSimulationActorLayer';
import { LivingDepthLayer } from '../components/LivingDepthLayer';
import { LivingEnvironmentLayer, resolveLivingEnvironment } from '../components/LivingEnvironmentLayer';
import { LivingWorldRuntime } from '../data/livingWorldRuntime';
import { getGoPalWorld, isGoPalWorldId, type GoPalWorldId } from '../data/livingWorldManifest';

export function LivingWorldScreen({ locationId='emerald-village', onTravel }: { locationId?: GoPalWorldId | string; onTravel?: (locationId: GoPalWorldId) => void }) {
  const safeLocationId: GoPalWorldId = isGoPalWorldId(locationId) ? locationId : 'emerald-village';
  const runtime = useMemo(() => new LivingWorldRuntime(safeLocationId), [safeLocationId]);
  const [revision, setRevision] = useState(0);
  const [environment, setEnvironment] = useState(() => resolveLivingEnvironment());
  const world = getGoPalWorld(safeLocationId);
  useEffect(() => { runtime.start(); return () => runtime.dispose(); }, [runtime]);
  useEffect(() => { const unsubscribe=runtime.events.subscribe(() => setRevision(value => value + 1)); return () => { unsubscribe(); }; }, [runtime]);
  useEffect(() => { const timer=setInterval(()=>runtime.tick(),100); return()=>clearInterval(timer); }, [runtime]);
  useEffect(() => { setEnvironment(resolveLivingEnvironment()); }, [safeLocationId, revision]);
  const location=runtime.getLocation();
  const actions=runtime.getAvailableActions();
  return <SafeAreaView className="flex-1 bg-slate-950"><View className="flex-1 overflow-hidden">
    <LivingWorldViewport><LivingGameWorld locationId={safeLocationId} time={environment.time} runtime={runtime}>
      <LivingDepthLayer time={environment.time} weather={environment.weather}/><LivingEnvironmentLayer timeOffsetMinutes={0}/><LivingSimulationActorLayer runtime={runtime} showVehicles/>
      <LivingPlayerLayer runtime={runtime}/>
    </LivingGameWorld></LivingWorldViewport>
    <View pointerEvents="none" className="absolute left-5 right-5 top-4 z-30"><View className="flex-row items-center"><Compass size={14} color="#6ee7b7"/><Text className="ml-2 text-[10px] font-bold uppercase tracking-[2px] text-emerald-300">{world.displayName} · {environment.time}</Text></View><Text className="mt-2 text-3xl font-black text-white">{location.name}</Text><Text className="mt-1 text-sm text-slate-300">A living world built from the same reusable world systems.</Text></View>
    <View className="absolute bottom-5 left-5 right-5 z-40 rounded-[26px] border border-white/10 bg-slate-950/80 p-4"><View className="flex-row items-center justify-between"><View className="flex-1"><Text className="text-[10px] font-bold uppercase tracking-[1.8px] text-slate-500">{environment.season} · {environment.weather}</Text><Text className="mt-1 text-sm font-semibold text-white">{actions.length ? `Nearby: ${actions.slice(0,2).join(' · ')}` : environment.label}</Text></View><View className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10"><Sparkles size={17} color="#6ee7b7"/></View></View><View className="mt-3 flex-row flex-wrap">{(['emerald-village','learning-campus','coastal-town','mountain-village','fantasy-kingdom','scifi-outpost','game-arena'] as GoPalWorldId[]).filter(id=>id!==safeLocationId).slice(0,3).map(id=><Pressable key={id} onPress={()=>onTravel?.(id)} className="mr-2 mt-1 rounded-full border border-white/10 bg-white/5 px-3 py-2"><Text className="text-[10px] font-semibold text-slate-200">{getGoPalWorld(id).displayName}</Text></Pressable>)}</View></View>
  </View></SafeAreaView>;
}
