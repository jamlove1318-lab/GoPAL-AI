import React,{useEffect,useMemo,useState}from'react';
import{Pressable,Text,View}from'react-native';
import{Compass,LockKeyhole,MapPin,Sparkles,Users}from'lucide-react-native';
import{getWorldPlaceHotspots,type WorldPlaceHotspot}from'../../learning/components/worldPlaceHotspotCatalog';
import{worldHotspotProgressionEngine}from'../../../engines/world/worldHotspotProgressionEngine';
import{worldHotspotRevealEngine}from'../../../engines/world/worldHotspotRevealEngine';
const ICONS={landmark:MapPin,resident:Users,discovery:Sparkles,path:Compass,locked:LockKeyhole} as const;
const progressKey=(placeId:string,hotspotId:string)=>`${placeId}:${hotspotId}`;
const isCompleted=(items:string[],placeId:string,hotspotId:string)=>items.includes(progressKey(placeId,hotspotId))||items.includes(hotspotId);
export function LivingWorldHotspotLayer({placeId,onSelect}:{placeId?:string;onSelect?:(hotspot:WorldPlaceHotspot)=>void}){
 const resolvedPlaceId=placeId??'default';const[progress,setProgress]=useState({completed:[],revealed:[]} as {completed:string[];revealed:string[]});const[visibleIds,setVisibleIds]=useState<string[]>([]);const[active,setActive]=useState<string|null>(null);const hotspots=useMemo(()=>getWorldPlaceHotspots(resolvedPlaceId),[resolvedPlaceId]);
 const refresh=async()=>{const[state,progressState]=await Promise.all([worldHotspotRevealEngine.getVisible(resolvedPlaceId),worldHotspotProgressionEngine.get()]);setProgress(progressState);setVisibleIds(state.visible.map(h=>h.id));};
 useEffect(()=>{refresh().catch(()=>undefined);},[resolvedPlaceId]);
 const choose=(h:WorldPlaceHotspot)=>{if(h.kind==='locked'||!visibleIds.includes(h.id)||active)return;setActive(h.id);try{onSelect?.(h);}finally{setActive(null);}};
 return <View pointerEvents="box-none" className="absolute inset-0 z-[28]">{hotspots.map(h=>{const Icon=ICONS[h.kind];const done=isCompleted(progress.completed,resolvedPlaceId,h.id);const discovered=visibleIds.includes(h.id);const enabled=h.kind!=='locked'&&discovered;return <Pressable key={h.id} disabled={!enabled} onPress={()=>choose(h)} accessibilityRole="button" accessibilityLabel={`${h.label}${enabled?'':' locked'}`} style={{position:'absolute',left:`${h.x}%`,top:`${h.y}%`,marginLeft:-24,marginTop:-24}}><View className={`h-10 w-10 items-center justify-center rounded-full border ${done?'border-emerald-200/40 bg-emerald-400/20':enabled?'border-emerald-200/25 bg-slate-950/55':'border-white/10 bg-slate-950/20'}`}><Icon size={16} color={enabled?'#a7f3d0':'#64748b'}/></View>{(enabled||done)&&<View pointerEvents="none" className="mt-1 self-center rounded-full bg-black/25 px-2 py-0.5"><Text className="text-[8px] font-bold text-white/75">{done?'✓ ':''}{h.label}</Text></View>}</Pressable>})}</View>;
}