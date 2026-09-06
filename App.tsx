import './global.css';
import React,{useEffect}from'react';
import{View}from'react-native';
import{StatusBar}from'expo-status-bar';
import{SafeAreaProvider}from'react-native-safe-area-context';
import{LivingValleyScreen}from'./src/features/world/screens/LivingValleyScreen';
import{startLivingWorldReactor}from'./src/engines';
import{AppErrorBoundary}from'./src/components/AppErrorBoundary';

/**
 * The living world is the application surface.
 * Non-world presentation shells are deliberately not mounted here.
 * World systems remain available through their engines and physical interactions.
 */
export default function App(){
 useEffect(()=>{
  let stop:()=>void=()=>{};
  try{stop=startLivingWorldReactor();}catch(error){console.error('[GoPAL] living world reactor startup failed',error);}
  return()=>stop();
 },[]);
 return <AppErrorBoundary><SafeAreaProvider><View style={{flex:1,backgroundColor:'#081521'}}><StatusBar style="light"/><LivingValleyScreen/></View></SafeAreaProvider></AppErrorBoundary>;
}
