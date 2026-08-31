import React,{useEffect,useRef}from'react';
import{Animated,Text,View}from'react-native';
import{Sparkles}from'lucide-react-native';

export function WorldHotspotRevealPulse({label,visible}:{label:string;visible:boolean}){
 const opacity=useRef(new Animated.Value(0)).current;const scale=useRef(new Animated.Value(.65)).current;const glow=useRef(new Animated.Value(.2)).current;
 useEffect(()=>{if(!visible)return;opacity.setValue(0);scale.setValue(.65);glow.setValue(.2);Animated.parallel([Animated.timing(opacity,{toValue:1,duration:260,useNativeDriver:true}),Animated.spring(scale,{toValue:1,useNativeDriver:true,damping:13,stiffness:150}),Animated.sequence([Animated.timing(glow,{toValue:1,duration:420,useNativeDriver:true}),Animated.timing(glow,{toValue:.2,duration:700,useNativeDriver:true})])]).start();},[visible]);
 if(!visible)return null;
 return <Animated.View pointerEvents="none" className="absolute inset-0 z-[75] items-center justify-center" style={{opacity}}><Animated.View style={{transform:[{scale}]}} className="items-center"><Animated.View style={{opacity:glow}} className="absolute h-32 w-32 rounded-full border border-emerald-200/30 bg-emerald-300/10"/><View className="h-12 w-12 items-center justify-center rounded-full border border-emerald-200/40 bg-slate-950/85"><Sparkles size={19} color="#a7f3d0"/></View><Text className="mt-3 rounded-full bg-slate-950/75 px-4 py-2 text-xs font-bold text-emerald-100">{label} revealed</Text></Animated.View></Animated.View>;
}
