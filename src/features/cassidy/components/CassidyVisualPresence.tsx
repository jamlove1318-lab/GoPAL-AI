import React,{useEffect,useRef}from'react';
import{Animated,Easing,View}from'react-native';
import{Sparkles}from'lucide-react-native';
import{CassidyCharacter}from'../../../components/CassidyCharacter';
import{Cassidy3DScene}from'../../../characters/Cassidy3DScene';
import{createCassidyCharacterState}from'../../../characters/cassidyCharacterDesign';
import{resolveCassidyVisual}from'../../../characters/cassidyVisualResolver';
import{getCassidyVisualPalette}from'../../../characters/cassidyVisualDesign';
import type{CassidyAction,CassidyMood}from'../../../characters/cassidy';

type CassidyFocus='left'|'right'|'center';
interface Props{height?:number;action?:CassidyAction;speaking?:boolean;expression?:CassidyMood;worldId?:string;focus?:CassidyFocus;}

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

export function CassidyVisualPresence({height=230,action='idle',speaking=false,expression='warm',worldId='emerald-valley',focus='center'}:Props){
 const pulse=useRef(new Animated.Value(0)).current;
 const float=useRef(new Animated.Value(0)).current;
 const arrival=useRef(new Animated.Value(0)).current;
 const attention=useRef(new Animated.Value(0)).current;
 const speakingMotion=useRef(new Animated.Value(0)).current;
 const palette=getCassidyVisualPalette(worldId);

 useEffect(()=>{
  const p=Animated.loop(Animated.sequence([
   Animated.timing(pulse,{toValue:1,duration:2600,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
   Animated.timing(pulse,{toValue:0,duration:2600,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
  ]));
  const f=Animated.loop(Animated.sequence([
   Animated.timing(float,{toValue:1,duration:3400,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
   Animated.timing(float,{toValue:0,duration:3400,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
  ]));
  p.start();f.start();
  Animated.spring(arrival,{toValue:1,damping:15,stiffness:120,mass:.8,useNativeDriver:true}).start();
  return()=>{p.stop();f.stop();arrival.stopAnimation();attention.stopAnimation();speakingMotion.stopAnimation()};
 },[arrival,attention,float,pulse,speakingMotion]);

 useEffect(()=>{
  const target=focus==='left'?-1:focus==='right'?1:0;
  Animated.spring(attention,{toValue:target,damping:18,stiffness:95,mass:.8,useNativeDriver:true}).start();
 },[attention,focus]);

 useEffect(()=>{
  const target=speaking?1:0;
  Animated.spring(speakingMotion,{toValue:target,damping:17,stiffness:110,mass:.7,useNativeDriver:true}).start();
 },[speaking,speakingMotion]);

 const glowScale=pulse.interpolate({inputRange:[0,1],outputRange:[.94,1.07]});
 const glowOpacity=pulse.interpolate({inputRange:[0,1],outputRange:[.10,.20]});
 const floatY=float.interpolate({inputRange:[0,1],outputRange:[2,-3]});
 const arrivalY=arrival.interpolate({inputRange:[0,1],outputRange:[18,0]});
 const arrivalScale=arrival.interpolate({inputRange:[0,1],outputRange:[.96,1]});
 const focusX=attention.interpolate({inputRange:[-1,0,1],outputRange:[-3,0,3]});
 const focusRot=attention.interpolate({inputRange:[-1,0,1],outputRange:['-1.2deg','0deg','1.2deg']});
 const talkY=speakingMotion.interpolate({inputRange:[0,1],outputRange:[0,-1.2]});
 const visualCommand=resolveCassidyVisual(createCassidyCharacterState({worldId,expression:resolveExpression(expression),animation:resolveAnimation(action)}));
 const useProduction3D=visualCommand.assetTier!=='fallback'&&Boolean(visualCommand.model3dUri);
 return <Animated.View style={{alignItems:'center',opacity:arrival,transform:[{translateX:focusX},{translateY:Animated.add(floatY,Animated.add(arrivalY,talkY))},{rotate:focusRot},{scale:arrivalScale}]}}>
  <Animated.View pointerEvents="none" style={{position:'absolute',top:height*.16,width:height*.62,height:height*.62,borderRadius:height,backgroundColor:palette.aura,opacity:glowOpacity,transform:[{scale:glowScale}]}}/>
  <View pointerEvents="none" style={{position:'absolute',top:height*.08,right:height*.1,opacity:.68}}><Sparkles size={14} color={palette.accent}/></View>
  <View pointerEvents="none" style={{position:'absolute',top:height*.3,left:height*.06,opacity:.38}}><Sparkles size={9} color={palette.eyeGlow}/></View>
  {useProduction3D?<Cassidy3DScene command={visualCommand} style={{width:height*.588,height}}/>:<CassidyCharacter height={height} action={action} speaking={speaking} expression={expression}/>} 
 </Animated.View>;
}
