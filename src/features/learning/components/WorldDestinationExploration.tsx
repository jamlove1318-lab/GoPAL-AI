import React,{useEffect,useMemo,useState}from'react';
import{Pressable,Text,View}from'react-native';
import{Compass,LockKeyhole,MapPin,Sparkles,Users}from'lucide-react-native';
import{WorldSceneStage}from'./WorldSceneStage';
import{getWorldPlaceHotspots,type WorldPlaceHotspot}from'./worldPlaceHotspotCatalog';
import{worldHotspotRevealEngine}from'../../../engines/world/worldHotspotRevealEngine';
import{worldHotspotProgressionEngine}from'../../../engines/world/worldHotspotProgressionEngine';
import{WorldObjectDiscoveryOverlay}from'../../world/components/WorldObjectDiscoveryOverlay';

const ICONS={landmark:MapPin,resident:Users,discovery:Sparkles,path:Compass,locked:LockKeyhole} as const;
export function WorldDestinationExploration({worldId,placeId,onStartScenario,onClose}:{worldId:any;placeId:string;onStartScenario?:(scenarioKey:string)=>void;onClose?:()=>void}){
 const[visible,setVisible]=useState<WorldPlaceHotspot[]>([]);const[selected,setSelected]=useState<WorldPlaceHotspot|null>(null);const[busy,setBusy]=useState(false);
 const refresh=async()=>{const state=await worldHotspotRevealEngine.getVisible(placeId);setVisible(state.visible);};
 useEffect(()=>{refresh().catch(()=>undefined);},[placeId]);
 const all=useMemo(()=>getWorldPlaceHotspots(placeId),[placeId]);
 const choose=async(h:WorldPlaceHotspot)=>{if(busy||h.kind==='locked')return;setBusy(true);try{await worldHotspotProgressionEngine.resolve(h);setSelected(h);}finally{setBusy(false);}};
 const enter=async()=>{if(!selected)return;const scenario=all.find(h=>h.id===selected.id)?.enabled?undefined:undefined;await worldHotspotProgressionEngine.complete(selected.id);await refresh();setSelected(null);if(scenario)onStartScenario?.(scenario);};
 return <View className="absolute inset-0 bg-black"><WorldSceneStage worldId={worldId} placeId={placeId}/><View pointerEvents="none" className="absolute left-5 right-5 top-[8%] z-20"><Text className="text-[9px] font-bold uppercase tracking-[2.5px] text-emerald-300">Explore</Text><Text className="mt-1 text-2xl font-black text-white">Look around before you begin.</Text><Text className="mt-1 max-w-[320px] text-xs leading-5 text-slate-400">Only some parts of this place have opened. What you discover changes what appears next.</Text></View><View className="absolute inset-0 z-30" pointerEvents="box-none">{visible.map(h=>{const Icon=ICONS[h.kind];const enabled=h.enabled!==false&&h.kind!=='locked';return <Pressable key={h.id} disabled={!enabled} onPress={()=>choose(h)} accessibilityRole="button" accessibilityLabel={`${h.label}${enabled?'':' locked'}`} style={{position:'absolute',left:`${h.x}%`,top:`${h.y}%`,marginLeft:-23,marginTop:-23}}><View className={`h-11 w-11 items-center justify-center rounded-full border ${enabled?'border-emerald-200/35 bg-slate-950/70':'border-white/10 bg-black/50'}`}><Icon size={17} color={enabled?'#a7f3d0':'#64748b'}/></View><Text className={`mt-1 rounded-full bg-black/45 px-2 py-1 text-[9px] font-bold ${enabled?'text-white':'text-slate-500'}`}>{h.label}</Text></Pressable>})}</View>{selected&&<WorldObjectDiscoveryOverlay hotspot={selected} onContinue={()=>setSelected(null)} onEnter={enter}/>}<Pressable onPress={onClose} className="absolute bottom-7 left-5 z-50 rounded-full bg-black/65 px-4 py-2.5"><Text className="text-xs font-semibold text-slate-200">Leave this place</Text></Pressable></View>;
}
