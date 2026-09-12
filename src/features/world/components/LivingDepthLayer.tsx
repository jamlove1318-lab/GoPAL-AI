import React,{useEffect,useRef}from'react';
import{Animated,Easing,View}from'react-native';
import Svg,{Path}from'react-native-svg';

type Props={time:string;weather:string};

/**
 * Atmospheric effects only. The actual Emerald Valley depth planes now live
 * in LivingWorldVisualLayer; this layer must never paint opaque blobs over
 * the world and hide the horizon, mountains, buildings, or stream.
 */
export function LivingDepthLayer({time,weather}:Props){
 const drift=useRef(new Animated.Value(0)).current;
 useEffect(()=>{const loop=Animated.loop(Animated.sequence([
   Animated.timing(drift,{toValue:1,duration:18000,easing:Easing.inOut(Easing.sin),useNativeDriver:true,isInteraction:false}),
   Animated.timing(drift,{toValue:0,duration:18000,easing:Easing.inOut(Easing.sin),useNativeDriver:true,isInteraction:false}),
 ]));loop.start();return()=>loop.stop();},[drift]);
 const night=time==='night',evening=time==='evening';
 return <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
   <View className={`absolute inset-0 ${night?'bg-indigo-950/10':evening?'bg-orange-950/5':'bg-sky-200/0'}`}/>
   {weather==='mist'&&<Animated.View style={{opacity:.13,transform:[{translateX:drift.interpolate({inputRange:[0,1],outputRange:[-90,90]})}]}} className="absolute left-[-30%] top-[36%] h-20 w-[160%] rounded-full bg-white"/>}
   {weather==='rain'&&<Svg style={{position:'absolute',inset:0}} viewBox="0 0 400 800" preserveAspectRatio="none">
     {Array.from({length:18},(_,i)=><Path key={i} d={`M${(i*29)%400} 300l-18 115`} stroke="#d9f1f1" strokeWidth="1" opacity=".10"/>) }
   </Svg>}
   <Animated.View style={{opacity:.05,transform:[{translateX:drift.interpolate({inputRange:[0,1],outputRange:[-24,24]})}]}} className="absolute left-[-15%] right-[-15%] bottom-[24%] h-16 rounded-full bg-emerald-200"/>
 </View>;
}
