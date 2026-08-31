import React,{useMemo,useState}from'react';
import{Pressable,Text,View}from'react-native';
import{Compass,LockKeyhole,MapPin,Sparkles,Users}from'lucide-react-native';
import{getWorldPlaceHotspots,type WorldPlaceHotspot}from'../../learning/components/worldPlaceHotspotCatalog';
import{worldHotspotProgressionEngine}from'../../../engines/world/worldHotspotProgressionEngine';

const ICONS={landmark:MapPin,resident:Users,discovery:Sparkles,path:Compass,locked:LockKeyhole} as const;
export function LivingWorldHotspotLayer({placeId,onSelect}:{placeId?:string;onSelect?:(hotspot:WorldPlaceHotspot)=>void}){
 const[progress,setProgress]=useState<{completed:string[];revealed:string[]}>({completed:[],revealed:[]});
 const[active,setActive]=useState<string|null>(null);
 const hotspots=useMemo(()=>getWorldPlaceHotspots(placeId??'default'),[placeId]);
 React.useEffect(()=>{worldHotspotProgressionEngine.get().then(setProgress).catch(()=>undefined);},[]);
 const choose=async(h:WorldPlaceHotspot)=>{if(h.kind==='locked')return;setActive(h.id);const result=await worldHotspotProgressionEngine.resolve(h);setProgress(result.progress);onSelect?.(h);};
 return <View pointerEvents="box-none" className="absolute inset-0 z-[28]">{hotspots.map(h=>{const Icon=ICONS[h.kind];const done=progress.completed.includes(h.id);const discovered=progress.revealed.includes(h.id);const enabled=h.kind!=='locked';return <Pressable key={h.id} disabled={!enabled} onPress={()=>choose(h)} accessibilityRole="button" accessibilityLabel={`${h.label}${enabled?'':' locked'}`} style={{position:'absolute',left:`${h.x}%`,top:`${h.y}%`,marginLeft:-24,marginTop:-24}}><View className={`h-12 w-12 items-center justify-center rounded-full border ${done?'border-emerald-200/50 bg-emerald-400/25':discovered?'border-emerald-200/30 bg-slate-950/75':'border-white/15 bg-slate-950/60'}`}><Icon size={18} color={enabled?'#a7f3d0':'#64748b'}/></View><View className="mt-1 self-center rounded-full bg-black/55 px-2 py-1"><Text className={`text-[9px] font-bold ${enabled?'text-white':'text-slate-500'}`}>{done?'✓ ':''}{h.label}</Text></View>{active===h.id&&!done&&<View className="absolute -bottom-5 left-3 h-2 w-2 rounded-full bg-emerald-300"/>}</Pressable>})}</View>;
}
