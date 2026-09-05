import React,{useEffect,useRef}from'react';
import{Animated,Easing,View}from'react-native';
import{Sparkles}from'lucide-react-native';
import{CassidyCharacter}from'../../../components/CassidyCharacter';
import{Cassidy3DScene}from'../../../characters/Cassidy3DScene';
import{createCassidyCharacterState}from'../../../characters/cassidyCharacterDesign';
import{resolveCassidyVisual}from'../../../characters/cassidyVisualResolver';
import{getCassidyVisualPalette}from'../../../characters/cassidyVisualDesign';
import type{CassidyAction,CassidyMood}from'../../../characters/cassidy';

interface Props{height?:number;action?:CassidyAction;speaking?:boolean;expression?:CassidyMood;worldId?:string;}

function resolveExpression(mood:CassidyMood){
 if(mood==='happy')return'happy' as const;
 if(mood==='thinking')return'thoughtful' as const;
 if(mood==='excited')return'excited' as const;
 return'neutral' as const;
}

function resolveAnimation(action:CassidyAction){
 if(action==='walking')return'walk' as const;
 if(action==='talking')return'talk' as const;
 if(action==='waving')return'gesture' as const;
 return'idle' as const;
}

export function CassidyVisualPresence({height=230,action='idle',speaking=false,expression='warm',worldId='emerald-valley'}:Props){
 const pulse=useRef(new Animated.Value(0)).current;
 const float=useRef(new Animated.Value(0)).current;
 const palette=getCassidyVisualPalette(worldId);
 useEffect(()=>{
  const p=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:1,duration:2200,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.timing(pulse,{toValue:0,duration:2200,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));
  const f=Animated.loop(Animated.sequence([Animated.timing(float,{toValue:1,duration:3000,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.timing(float,{toValue:0,duration:3000,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));
  p.start();f.start();return()=>{p.stop();f.stop()};
 },[pulse,float]);
 const glowScale=pulse.interpolate({inputRange:[0,1],outputRange:[0.94,1.06]});
 const glowOpacity=pulse.interpolate({inputRange:[0,1],outputRange:[0.12,0.24]});
 const floatY=float.interpolate({inputRange:[0,1],outputRange:[2,-3]});
 const visualCommand=resolveCassidyVisual(createCassidyCharacterState({worldId,expression:resolveExpression(expression),animation:resolveAnimation(action)}));
 const useProduction3D=visualCommand.assetTier!=='fallback'&&Boolean(visualCommand.model3dUri);
 return <Animated.View style={{alignItems:'center',transform:[{translateY:floatY}]}}>
  <Animated.View pointerEvents="none" style={{position:'absolute',top:height*0.16,width:height*0.62,height:height*0.62,borderRadius:height,backgroundColor:palette.aura,opacity:glowOpacity,transform:[{scale:glowScale}]}}/>
  <View pointerEvents="none" style={{position:'absolute',top:height*0.08,right:height*0.1,opacity:0.75}}><Sparkles size={15} color={palette.accent}/></View>
  <View pointerEvents="none" style={{position:'absolute',top:height*0.3,left:height*0.06,opacity:0.5}}><Sparkles size={10} color={palette.eyeGlow}/></View>
  {useProduction3D?<Cassidy3DScene command={visualCommand} style={{width:height*0.588,height}}/>:<CassidyCharacter height={height} action={action} speaking={speaking} expression={expression}/>} 
 </Animated.View>;
}
