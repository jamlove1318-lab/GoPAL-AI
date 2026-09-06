import React,{useEffect,useRef,useState}from'react';
import{Animated,Easing,StyleSheet,View}from'react-native';
import type { LivingWorldRuntime } from '../data/livingWorldRuntime';

export function LivingWorldCinematicLayer({runtime}:{runtime:LivingWorldRuntime}){
 const[scenario,setScenario]=useState(runtime.getActiveScenario());
 const progress=useRef(new Animated.Value(0)).current;
 const fade=useRef(new Animated.Value(1)).current;
 useEffect(()=>runtime.events.subscribe(()=>setScenario(runtime.getActiveScenario())),[runtime]);
 useEffect(()=>{
  if(!scenario)return;
  progress.setValue(0);fade.setValue(1);
  const animation=Animated.timing(progress,{toValue:1,duration:scenario.durationMs,easing:Easing.inOut(Easing.cubic),useNativeDriver:true});
  animation.start(({finished})=>{
   if(finished){
    Animated.timing(fade,{toValue:0,duration:450,easing:Easing.out(Easing.quad),useNativeDriver:true}).start(({finished:fadeFinished})=>{
     if(fadeFinished)runtime.advanceScenario();
    });
   }
  });
  return()=>animation.stop();
 },[scenario,runtime,progress,fade]);
 if(!scenario)return null;
 const sweepX=progress.interpolate({inputRange:[0,.5,1],outputRange:[-220,40,220]});
 const reveal=progress.interpolate({inputRange:[0,.18,.45,.82,1],outputRange:[.92,.48,.18,.10,0]});
 const bars=progress.interpolate({inputRange:[0,.2,.75,1],outputRange:[1,.7,.28,0]});
 return <Animated.View pointerEvents="none" style={[styles.root,{opacity:fade}]}>
   <Animated.View style={[styles.atmosphere,{opacity:reveal,transform:[{translateX:sweepX}]}]}/>
   <Animated.View style={[styles.topBar,{transform:[{scaleY:bars}]}]}/>
   <Animated.View style={[styles.bottomBar,{transform:[{scaleY:bars}]}]}/>
   <View style={styles.edgeGlow}/>
 </Animated.View>;
}

const styles=StyleSheet.create({root:{...StyleSheet.absoluteFillObject,zIndex:50},atmosphere:{position:'absolute',left:'-40%',top:'-10%',width:'70%',height:'120%',borderRadius:999,backgroundColor:'rgba(225,255,244,0.13)'},topBar:{position:'absolute',left:0,right:0,top:0,height:34,backgroundColor:'rgba(2,9,16,0.72)'},bottomBar:{position:'absolute',left:0,right:0,bottom:0,height:34,backgroundColor:'rgba(2,9,16,0.72)'},edgeGlow:{...StyleSheet.absoluteFillObject,borderWidth:18,borderColor:'rgba(1,12,20,0.16)'}});
