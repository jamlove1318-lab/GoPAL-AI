import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { ResidentPresentationState } from '../../../engines/world/residentPresentationEngine';

export type ResidentCharacterViewProps={state:ResidentPresentationState};

export function ResidentCharacterView({state}:ResidentCharacterViewProps){
 const pulse=useRef(new Animated.Value(1)).current;
 useEffect(()=>{const loop=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:1.025,duration:900,useNativeDriver:true}),Animated.timing(pulse,{toValue:1,duration:900,useNativeDriver:true})]));loop.start();return()=>loop.stop();},[pulse]);
 return <View style={styles.anchor} pointerEvents="none"><Animated.View style={[styles.character,{transform:[{scale:pulse}]}]}><View style={[styles.head,state.expression==='happy'&&styles.happy,state.expression==='thinking'&&styles.thinking]}><Text style={styles.face}>{state.expression==='happy'?'◡ᴗ◡':state.expression==='thinking'?'•ᴗ•':state.expression==='curious'?'◔ᴗ◔':'•ᴗ•'}</Text></View><View style={styles.body}><Text style={styles.motion}>{state.motion==='working'?'◌':state.motion==='gesturing'?'⌁':state.motion==='thinking'?'…':state.motion==='goodbye'?'⌒':'·'}</Text></View><View style={styles.label}><Text style={styles.name}>{state.name}</Text><Text style={styles.activity}>{state.activity} · {state.motion}</Text></View></Animated.View></View>;
}

const styles=StyleSheet.create({anchor:{position:'absolute',left:0,right:0,top:'24%',alignItems:'center'},character:{alignItems:'center'},head:{width:92,height:92,borderRadius:46,borderWidth:3,borderColor:'rgba(255,255,255,0.8)',backgroundColor:'rgba(20,25,35,0.92)',alignItems:'center',justifyContent:'center'},happy:{transform:[{rotate:'-2deg'}]},thinking:{transform:[{rotate:'1deg'}]},face:{fontSize:28,color:'white'},body:{marginTop:-4,width:120,height:145,borderRadius:48,borderWidth:3,borderColor:'rgba(255,255,255,0.65)',backgroundColor:'rgba(30,38,52,0.94)',alignItems:'center',justifyContent:'center'},motion:{fontSize:44,color:'white'},label:{marginTop:10,paddingHorizontal:14,paddingVertical:7,borderRadius:14,backgroundColor:'rgba(0,0,0,0.55)',alignItems:'center'},name:{fontSize:16,fontWeight:'700',color:'white'},activity:{marginTop:2,fontSize:11,color:'rgba(255,255,255,0.78)'}});

export default ResidentCharacterView;
