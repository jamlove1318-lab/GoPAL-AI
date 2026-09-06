import React,{useEffect,useMemo,useRef,useState}from'react';
import{Animated,Easing,StyleSheet,View,useWindowDimensions}from'react-native';
import{SafeAreaView}from'react-native-safe-area-context';
import{LivingWorldViewport}from'../components/LivingWorldViewport';
import{LivingEnvironmentLayer,resolveLivingEnvironment}from'../components/LivingEnvironmentLayer';
import{LivingDepthLayer}from'../components/LivingDepthLayer';
import{LivingCassidyPresence}from'../components/LivingCassidyPresence';
import{LivingGameWorld,LIVING_BUILDINGS}from'../components/LivingGameWorld';
import{LivingPlayerLayer}from'../components/LivingPlayerLayer';
import{LivingSimulationActorLayer}from'../components/LivingSimulationActorLayer';
import{LivingWorldRuntime}from'../data/livingWorldRuntime';

interface Props{onStartScenario?:(scenarioKey:string)=>void;}

/**
 * Full-screen living-world surface.
 * No dashboard cards, navigation shell, status panels, or destination cards are mounted here.
 * The world itself is the interface: terrain, buildings, residents, vehicles, Cassidy,
 * atmosphere, simulation and player movement all occupy the same physical space.
 */
export function LivingValleyScreen(_props:Props){
 const{width,height}=useWindowDimensions();
 const runtime=useMemo(()=>new LivingWorldRuntime('emerald-village'),[]);
 const[worldTime,setWorldTime]=useState(()=>new Date());
 const breeze=useRef(new Animated.Value(0)).current;
 const shimmer=useRef(new Animated.Value(0)).current;

 useEffect(()=>()=>runtime.dispose(),[runtime]);

 useEffect(()=>{
  const tick=()=>{
   const now=new Date();
   setWorldTime(now);
   runtime.tick(now.getTime());
  };
  tick();
  const id=setInterval(tick,250);
  return()=>clearInterval(id);
 },[runtime]);

 useEffect(()=>{
  const loop=Animated.loop(Animated.sequence([
   Animated.timing(breeze,{toValue:1,duration:7000,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
   Animated.timing(breeze,{toValue:0,duration:7000,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
  ]));
  loop.start();
  return()=>loop.stop();
 },[breeze]);

 useEffect(()=>{
  const loop=Animated.loop(Animated.sequence([
   Animated.timing(shimmer,{toValue:1,duration:3200,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
   Animated.timing(shimmer,{toValue:0,duration:3200,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
  ]));
  loop.start();
  return()=>loop.stop();
 },[shimmer]);

 const environment=resolveLivingEnvironment(worldTime);
 const leafDrift=breeze.interpolate({inputRange:[0,1],outputRange:[-18,24]});
 const waterGlow=shimmer.interpolate({inputRange:[0,1],outputRange:[0.035,0.11]});

 return <SafeAreaView style={styles.safe}>
  <View style={styles.world}>
   <LivingWorldViewport>
    <LivingGameWorld time={environment.time} buildings={LIVING_BUILDINGS} runtime={runtime}>
     <View style={styles.world}>
      <LivingDepthLayer time={environment.time} weather={environment.weather}/>
      <LivingEnvironmentLayer timeOffsetMinutes={0}/>

      <Animated.View pointerEvents="none" style={[styles.windRibbon,{transform:[{translateX:leafDrift}]}]}/>
      <Animated.View pointerEvents="none" style={[styles.waterLight,{opacity:waterGlow}]}/>

      <LivingSimulationActorLayer runtime={runtime} showVehicles/>
      <LivingPlayerLayer runtime={runtime} buildings={LIVING_BUILDINGS}/>
      <LivingCassidyPresence languageCode="ja" context="exploring" locationLabel="Emerald Valley"/>

      <View pointerEvents="none" style={[styles.vignette,{width,height}]}/>
     </View>
    </LivingGameWorld>
   </LivingWorldViewport>
  </View>
 </SafeAreaView>;
}

const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:'#081521'},
 world:{flex:1,overflow:'hidden'},
 windRibbon:{position:'absolute',left:'-20%',top:'34%',width:'140%',height:2,borderTopWidth:1,borderTopColor:'rgba(220,255,240,0.045)'},
 waterLight:{position:'absolute',left:'18%',right:'12%',top:'57%',height:80,borderRadius:40,backgroundColor:'#9de9d1'},
 vignette:{position:'absolute',left:0,top:0,borderWidth:22,borderColor:'rgba(0,12,20,0.10)'}
});
