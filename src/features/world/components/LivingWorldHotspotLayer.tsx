import React,{useEffect,useMemo,useState}from'react';
import{Pressable,Text,View}from'react-native';
import{Compass,LockKeyhole,MapPin,Sparkles,Users}from'lucide-react-native';
import{getWorldPlaceHotspots,type WorldPlaceHotspot}from'../../learning/components/worldPlaceHotspots';
import{worldHotspotProgressionEngine}from'../../../engines/world/worldHotspotProgressionEngine';
const ICONS={landmark:MapPin,resident:Users,discovery:Sparkles,path:Compass,locked:LockKeyhole} as const;
export function LivingWorldHotspotLayer({placeId,onSelect}:{placeId?:string;onSelect?:(hotspot:WorldPlaceHotspot)=>void}){
 const[progress,setProgress]=useState({completed:[],revealed:[]} as {completed:string[];revealed:string[]});const[active,setActive]=useState<string|null>(null);const hotspots=useMemo(()=>getWorldPlaceHotspots(placeId??'default'),[placeId]);
 useEffect(()=>{worldHotspotProgressionEngine.get().then(setProgress).catch(()=>undefined);},[placeId]);
 const choose=async(h:WorldPlaceHotspot)=>{if(h.kind==='locked')return;setActive(h.id);const result=await worldHotspotProgressionEngine.resolve(h);setProgress(result.progress);onSelect?.(h);};
 return <View pointerEvents="box-none" className="absolute inset-0 z-[28]">{hotspots.map(h=>{const Icon=ICONS[h.kind];const done=progress.completed.includes(h.id);const discovered=progress.revealed.includes(h.id);const enabled=h.kind!=='locked';return <Pressable key={h.id} disabled={!enabled} onPress={()=>choose(h)} accessibilityRole="button" accessibilityLabel={`${h.label}${enabled?'':' locked'}`} style={{position:'absolute',left:`${h.x}%`,top:`${h.y}%`,marginLeft:-24,marginTop:-24}}><View className={`h-10 w-10 items-center justify-center rounded-full border ${done?'border-emerald-200/40 bg-emerald-400/20':discovered?'border-emerald-200/25 bg-slate-950/55':'border-white/10 bg-slate-950/20'}`}><Icon size={16} color={enabled?'#a7f3d0':'#64748b'}/></View>{(discovered||done)&&<View pointerEvents="none" className="mt-1 self-center rounded-full bg-black/25 px-2 py-0.5"><Text className="text-[8px] font-bold text-white/75">{done?'✓ ':''}{h.label}</Text></View>}</Pressable>})}</View>;
}
