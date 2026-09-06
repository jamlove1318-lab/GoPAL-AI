import React,{useEffect,useMemo,useRef,useState}from'react';
import{Animated,Easing,StyleSheet,View,useWindowDimensions}from'react-native';
import{SafeAreaView}from'react-native-safe-area-context';
import{LivingWorldViewport}from'../components/LivingWorldViewport';
import{LivingEnvironmentLayer,resolveLivingEnvironment}from'../components/LivingEnvironmentLayer';
import{LivingDepthLayer}from'../components/LivingDepthLayer';
import{LivingAmbientLifeLayer}from'../components/LivingAmbientLifeLayer';
import{LivingCassidyPresence}from'../components/LivingCassidyPresence';
import{LivingGameWorld}from'../components/LivingGameWorld';
import{LivingPlayerLayer}from'../components/LivingPlayerLayer';
import{LivingSimulationActorLayer}from'../components/LivingSimulationActorLayer';
import{LivingWorldEntranceLayer}from'../components/LivingWorldEntranceLayer';
import{LivingWorldRuntime}from'../data/livingWorldRuntime';
import{getUniverseLocation}from'../data/livingUniverse';

interface Props{locationId?:string;onStartScenario?:(scenarioKey:string)=>void;}

/** Generic living-world surface. Canonical world data drives the physical scene. */
export function LivingValleyScreen({locationId='emerald-village'}:Props){
 const{width,height}=useWindowDimensions();
 const runtime=useMemo(()=>new LivingWorldRuntime(locationId),[locationId]);
 const[worldTime,setWorldTime]=useState(()=>new Date());
 const[revision,setRevision]=useState(0);
 const breeze=useRef(new Animated.Value(0)).current;
 const shimmer=useRef(new Animated.Value(0)).current;
 useEffect(()=>()=>runtime.dispose(),[runtime]);
 useEffect(()=>{const unsubscribe=runtime.events.subscribe(()=>setRevision(value=>value+1));const tick=()=>{const now=new Date();setWorldTime(now);runtime.tick(now.getTime());};tick();const id=setInterval(tick,250);return()=>{clearInterval(id);unsubscribe();};},[runtime]);
 useEffect(()=>{const loop=Animated.loop(Animated.sequence([Animated.timing(breeze,{toValue:1,duration:7000,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.timing(breeze,{toValue:0,duration:7000,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));loop.start();return()=>loop.stop();},[breeze]);
 useEffect(()=>{const loop=Animated.loop(Animated.sequence([Animated.timing(shimmer,{toValue:1,duration:3200,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.timing(shimmer,{toValue:0,duration:3200,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));loop.start();return()=>loop.stop();},[shimmer]);
 const environment=resolveLivingEnvironment(worldTime);
 const location=runtime.getLocation();
 const universeLocation=getUniverseLocation(location.id);
 const languageWorld=runtime.getLanguageWorld();
 const worldId=languageWorld?.id??universeLocation.worldId??location.metadata?.languageWorldId??'emerald-valley';
 const languageCode=languageWorld?.locale?.split('-')[0]??location.language?.slice(0,2)??'en';
 const leafDrift=breeze.interpolate({inputRange:[0,1],outputRange:[-18,24]});
 const waterGlow=shimmer.interpolate({inputRange:[0,1],outputRange:[0.035,0.11]});
 void revision;
 return <SafeAreaView style={styles.safe}><View style={styles.world}><LivingWorldViewport><LivingGameWorld time={environment.time} locationId={location.id} runtime={runtime}><View style={styles.world}><LivingDepthLayer time={environment.time} weather={environment.weather}/><LivingEnvironmentLayer timeOffsetMinutes={0}/><LivingAmbientLifeLayer time={environment.time} season={environment.season} weather={environment.weather}/><Animated.View pointerEvents="none" style={[styles.windRibbon,{transform:[{translateX:leafDrift}]}]}/><Animated.View pointerEvents="none" style={[styles.waterLight,{opacity:waterGlow}]}/><LivingSimulationActorLayer runtime={runtime} showVehicles worldId={worldId}/><LivingWorldEntranceLayer runtime={runtime}/><LivingPlayerLayer runtime={runtime}/><LivingCassidyPresence languageCode={languageCode} context="exploring" locationLabel={location.name}/><View pointerEvents="none" style={[styles.vignette,{width,height}]}/></View></LivingGameWorld></LivingWorldViewport></View></View></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#081521'},world:{flex:1,overflow:'hidden'},windRibbon:{position:'absolute',left:'-20%',top:'34%',width:'140%',height:2,borderTopWidth:1,borderTopColor:'rgba(220,255,240,0.045)'},waterLight:{position:'absolute',left:'18%',right:'12%',top:'57%',height:80,borderRadius:40,backgroundColor:'#9de9d1'},vignette:{position:'absolute',left:0,top:0,borderWidth:22,borderColor:'rgba(0,12,20,0.10)'}});