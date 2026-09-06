import React,{useEffect,useMemo,useRef}from'react';
import{Animated,Easing,StyleSheet,View}from'react-native';
import Svg,{Circle,Path}from'react-native-svg';

type Props={time:'morning'|'afternoon'|'evening'|'night';season:string;weather:string};

/** Purely environmental motion. Nothing here is a card, HUD, label, or navigation surface. */
export function LivingAmbientLifeLayer({time,season,weather}:Props){
 const drift=useRef(new Animated.Value(0)).current;
 const pulse=useRef(new Animated.Value(0)).current;
 const birds=useRef(new Animated.Value(0)).current;
 useEffect(()=>{
  const make=(value:Animated.Value,duration:number)=>Animated.loop(Animated.sequence([
   Animated.timing(value,{toValue:1,duration,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
   Animated.timing(value,{toValue:0,duration,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
  ]));
  const a=make(drift,9000),b=make(pulse,2200),c=make(birds,15000);
  a.start();b.start();c.start();
  return()=>{a.stop();b.stop();c.stop();};
 },[birds,drift,pulse]);
 const night=time==='night';
 const evening=time==='evening';
 const showBirds=!night&&weather!=='rain';
 const showFireflies=night||evening;
 const showLeaves=weather==='wind'||season==='autumn';
 const fireflies=useMemo(()=>Array.from({length:10},(_,i)=>({x:(i*37+11)%94,y:(i*23+17)%62})),[]);
 const leaves=useMemo(()=>Array.from({length:7},(_,i)=>({x:(i*31+7)%100,y:24+(i*11)%48})),[]);
 return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
  {showBirds&&<Animated.View style={[styles.birds,{transform:[{translateX:birds.interpolate({inputRange:[0,1],outputRange:[-120,420]})},{translateY:birds.interpolate({inputRange:[0,1],outputRange:[0,-18]})}]}]}>
   <Svg width={96} height={42} viewBox="0 0 96 42"><Path d="M8 22Q16 14 24 22Q32 14 40 22M48 14Q56 6 64 14Q72 6 80 14" fill="none" stroke="rgba(30,48,52,.42)" strokeWidth="2" strokeLinecap="round"/></Svg>
  </Animated.View>}
  {showFireflies&&fireflies.map((dot,i)=><Animated.View key={`f${i}`} style={[styles.firefly,{left:`${dot.x}%`,top:`${dot.y}%`,opacity:pulse.interpolate({inputRange:[0,.5,1],outputRange:[.15,.75,.15]}),transform:[{translateX:drift.interpolate({inputRange:[0,1],outputRange:[-8+i,8-i]})},{translateY:drift.interpolate({inputRange:[0,1],outputRange:[5,-5]})}]}]}/>)}
  {showLeaves&&leaves.map((leaf,i)=><Animated.View key={`l${i}`} style={[styles.leaf,{left:`${leaf.x}%`,top:`${leaf.y}%`,transform:[{translateX:drift.interpolate({inputRange:[0,1],outputRange:[-18+i*2,22-i]})},{translateY:drift.interpolate({inputRange:[0,1],outputRange:[-8,34+i*3]})},{rotate:drift.interpolate({inputRange:[0,1],outputRange:['-25deg','35deg']})}]}]}><Svg width={10} height={10} viewBox="0 0 10 10"><Path d="M5 1Q10 4 5 9Q0 6 5 1Z" fill="rgba(190,151,92,.55)"/></Svg></Animated.View>)}
  <Animated.View style={[styles.pollen,{opacity:pulse.interpolate({inputRange:[0,1],outputRange:[.05,.16]}),transform:[{translateX:drift.interpolate({inputRange:[0,1],outputRange:[-35,35]})}]}]}/>
 </View>;
}

const styles=StyleSheet.create({
 birds:{position:'absolute',left:'0%',top:'16%',width:96,height:42},
 firefly:{position:'absolute',width:4,height:4,borderRadius:2,backgroundColor:'#d8f7a4'},
 leaf:{position:'absolute',width:10,height:10},
 pollen:{position:'absolute',left:'25%',top:'47%',width:'50%',height:24,borderRadius:20,backgroundColor:'#d6f2c2'}
});
