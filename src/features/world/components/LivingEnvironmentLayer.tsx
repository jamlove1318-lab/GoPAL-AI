import React,{useEffect,useMemo,useRef}from'react';
import{Animated,Easing,Text,View}from'react-native';
import{environmentEngine}from'../../../engines/world/environmentEngine';
import type{Season,TimeOfDay}from'../../../lib/types';

export type LivingWeather='clear'|'mist'|'rain'|'wind';
export type LivingEnvironment={time:TimeOfDay;season:Season;weather:LivingWeather;label:string};

function toLivingWeather(weather:string):LivingWeather{
 if(weather==='light-rain'||weather==='rain')return'rain';
 if(weather==='breeze'||weather==='windy')return'wind';
 if(weather==='mist')return'mist';
 return'clear';
}

/** The visual environment is a projection of the canonical environment engine. */
export function resolveLivingEnvironment(now:Date=new Date()):LivingEnvironment{
 const canonical=environmentEngine.resolve(now);
 const weather=toLivingWeather(canonical.weather);
 const label=weather==='rain'?'Soft rain over the world':weather==='mist'?'Mist sleeping between the hills':weather==='wind'?'Wind moving through the trees':canonical.timeOfDay==='night'?'The world after dark':canonical.timeOfDay==='morning'?'The world is waking up':canonical.timeOfDay==='evening'?'Lantern light is beginning to gather':'The world is wide awake';
 return{time:canonical.timeOfDay,season:canonical.season,weather,label};
}

export function LivingEnvironmentLayer({onEnvironment,timeOffsetMinutes=0}:{onEnvironment?:(environment:LivingEnvironment)=>void;timeOffsetMinutes?:number}){
 const environment=useMemo(()=>resolveLivingEnvironment(new Date(Date.now()+timeOffsetMinutes*60000)),[timeOffsetMinutes]);
 const drift=useRef(new Animated.Value(0)).current;
 useEffect(()=>{onEnvironment?.(environment);},[environment,onEnvironment]);
 useEffect(()=>{const loop=Animated.loop(Animated.sequence([Animated.timing(drift,{toValue:1,duration:8000,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.timing(drift,{toValue:0,duration:8000,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));loop.start();return()=>loop.stop();},[drift]);
 const sky=environment.time==='night'?'bg-indigo-950/45':environment.time==='evening'?'bg-orange-950/20':environment.time==='morning'?'bg-sky-300/10':'bg-transparent';
 return <View pointerEvents="none" className="absolute inset-0 z-10"><View className={`absolute inset-0 ${sky}`}/>{environment.weather==='mist'&&<Animated.View style={{transform:[{translateX:drift.interpolate({inputRange:[0,1],outputRange:[-80,90]})}]}} className="absolute left-[-20%] top-[30%] h-28 w-[140%] rounded-full bg-white/10"/>}{environment.weather==='rain'&&<Rain drift={drift}/>} {environment.weather==='wind'&&<Animated.View style={{transform:[{translateX:drift.interpolate({inputRange:[0,1],outputRange:[-30,55]})}]}} className="absolute left-0 top-[46%] h-12 w-[85%] rounded-full border-t border-white/10"/>}{environment.time==='night'&&<Stars/>}{environment.time==='evening'&&<View className="absolute bottom-[42%] left-[44%] h-3 w-3 rounded-full bg-amber-200/70"/>}</View>;
}
function Rain({drift}:{drift:Animated.Value}){return <View className="absolute inset-0 overflow-hidden">{Array.from({length:18},(_,index)=><Animated.View key={index} style={{left:`${index*17%100}%`,top:-20,height:90+index%4*18,opacity:.16+index%3*.06,transform:[{translateY:drift.interpolate({inputRange:[0,1],outputRange:[0,170+index*3]})},{rotate:'-14deg'}]}} className="absolute w-px bg-sky-200"/>)}</View>}
function Stars(){return <View className="absolute inset-0">{Array.from({length:16},(_,index)=><Text key={index} style={{position:'absolute',left:`${(index*29+7)%96}%`,top:`${(index*17+4)%48}%`,opacity:.25+index%3*.16}} className="text-[8px] text-white">✦</Text>)}</View>}
