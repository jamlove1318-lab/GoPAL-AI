import React,{useEffect,useRef,useState}from'react';
import{Animated,Pressable,StyleSheet,Text,View}from'react-native';
import Svg,{Circle,Ellipse,G,Path,Polygon,Rect}from'react-native-svg';
import type{LivingWorldRuntime}from'../data/livingWorldRuntime';
import type{SimulatedActor}from'../data/livingWorldSimulation';
import{worldDepth}from'../geometry/livingWorldGeometry';
import{NPC_ROLE_DESIGNS}from'../../../characters/npcCharacterDesign';
import type{NpcRole}from'../../../characters/npcCharacterDesign';
import{resolveNpcVisual}from'../../../engines/world/npcCharacterRegistry';

export function LivingSimulationActorLayer({runtime,showVehicles=false,worldId='emerald-valley',onActorPress}:{runtime:LivingWorldRuntime;showVehicles?:boolean;worldId?:string;onActorPress?:(actor:SimulatedActor)=>void}){
 const[snapshot,setSnapshot]=useState(()=>runtime.getSimulation().snapshot());
 useEffect(()=>{let active=true;const unsubscribe=runtime.events.subscribe(event=>{if(active&&event.type==='world-state-changed'&&event.payload?.simulation)setSnapshot(event.payload.simulation as typeof snapshot);});return()=>{active=false;unsubscribe();};},[runtime]);
 return <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>{snapshot.actors.filter(actor=>actor.active&&(showVehicles||!actor.role.startsWith('vehicle:'))).map(actor=><SimulationActor key={actor.id} actor={actor} worldId={worldId} onPress={onActorPress}/>)}</View>
}

function SimulationActor({actor,worldId,onPress}:{actor:SimulatedActor;worldId:string;onPress?:(actor:SimulatedActor)=>void}){
 const scale=actor.scale??1,vehicle=actor.role.startsWith('vehicle:');
 const bob=useRef(new Animated.Value(0)).current;
 const drift=useRef(new Animated.Value(0)).current;
 const[walkFrame,setWalkFrame]=useState(0);
 const walking=!vehicle&&/moving|wander|routine|walk|travel/i.test(actor.activity??'');
 useEffect(()=>{if(vehicle)return;const phase=(actor.id.split('').reduce((sum,char)=>sum+char.charCodeAt(0),0)%900);const timer=setTimeout(()=>{Animated.loop(Animated.sequence([Animated.timing(bob,{toValue:1,duration:520+phase%220,useNativeDriver:true,isInteraction:false}),Animated.timing(bob,{toValue:0,duration:520+phase%180,useNativeDriver:true,isInteraction:false})])).start();Animated.loop(Animated.sequence([Animated.timing(drift,{toValue:1,duration:2600+phase%700,useNativeDriver:true,isInteraction:false}),Animated.timing(drift,{toValue:0,duration:2600+phase%500,useNativeDriver:true,isInteraction:false})])).start();},phase%400);return()=>clearTimeout(timer);},[actor.id,bob,drift,vehicle]);
 useEffect(()=>{if(!walking)return;const id=setInterval(()=>setWalkFrame(frame=>frame^1),280);return()=>clearInterval(id)},[walking]);
 const bobY=bob.interpolate({inputRange:[0,1],outputRange:[0,-2.2*scale]});
 const sway=drift.interpolate({inputRange:[0,1],outputRange:['-1.2deg','1.2deg']});
 const content=<Animated.View style={{position:'absolute',left:`${actor.x}%`,top:`${actor.y}%`,width:vehicle?58*scale:52*scale,height:vehicle?36*scale:76*scale,marginLeft:vehicle?-29*scale:-26*scale,marginTop:vehicle?-18*scale:-38*scale,zIndex:worldDepth(actor.y,vehicle?8:12),transform:[{translateY:vehicle?0:bobY},{rotate:vehicle?`${actor.rotation??0}deg`:sway}]}}>{vehicle?<VehicleShape actor={actor}/>:<CharacterShape actor={actor} worldId={worldId} walkFrame={walkFrame} walking={walking}/>} {!vehicle&&actor.name&&<Text style={{position:'absolute',top:72*scale,left:-36*scale,width:124*scale,textAlign:'center',fontSize:9*scale,fontWeight:'800',color:'#fff',backgroundColor:'rgba(2,6,23,.62)',paddingHorizontal:5,paddingVertical:2,borderRadius:8,transform:[{rotate:`${-(actor.rotation??0)}deg`}]}}>{actor.name}</Text>}{actor.activity&&actor.name&&<Text style={{position:'absolute',top:87*scale,left:-42*scale,width:136*scale,textAlign:'center',fontSize:6*scale,color:'#d1fae5',opacity:.9,transform:[{rotate:`${-(actor.rotation??0)}deg`}]}}>{actor.activity}</Text>}</Animated.View>;
 return onPress&&!vehicle?<Pressable onPress={()=>onPress(actor)}>{content}</Pressable>:content
}

function CharacterShape({actor,worldId,walkFrame,walking}:{actor:SimulatedActor;worldId:string;walkFrame:number;walking:boolean}){
 const role=(NPC_ROLE_DESIGNS[actor.role as NpcRole]?actor.role:'resident') as NpcRole;
 const visual=resolveNpcVisual(actor.id,role,worldId);
 const palette=visual.palette;
 const shirt=palette[0]??'#64748b',hair=palette[1]??'#4b5563',shoes=palette[2]??'#303b40';
 const skin='#e7b58d';
 const activity=actor.activity?.toLowerCase()??'';
 const happy=activity.includes('talk')||activity.includes('greet')||activity.includes('social');
 const working=activity.includes('garden')||activity.includes('market')||activity.includes('read')||activity.includes('tea')||activity.includes('archive');
 const step=walking&&walkFrame===1;
 return <Svg width="100%" height="100%" viewBox="0 0 52 76">
   <Ellipse cx="26" cy="72" rx="16" ry="3.8" fill="#08110e" opacity=".38"/>
   <G>
     <Path d={step?'M21 48L14 67Q14 70 18 70L26 53':'M21 48L22 68Q23 71 27 70L28 52'} fill={shoes}/>
     <Path d={step?'M31 48L38 66Q39 69 35 71L27 53':'M31 48L30 68Q29 71 25 70L24 52'} fill={shoes}/>
     <Path d="M17 41Q26 36 35 41L33 54Q26 59 19 54Z" fill={shirt}/>
     <Path d={step?'M18 42Q12 45 11 51L15 54L22 47':'M18 42Q12 40 10 45L14 51L21 47'} fill={shirt}/>
     <Path d={step?'M34 42Q41 39 42 45L39 52L33 48':'M34 42Q40 45 41 50L37 54L31 47'} fill={shirt}/>
     <Circle cx={step?13:14} cy={step?53:49} r="3.2" fill={skin}/>
     <Circle cx={step?39:40} cy={step?52:49} r="3.2" fill={skin}/>
     <Rect x="20" y="28" width="12" height="9" rx="4" fill={skin}/>
     <Circle cx="26" cy="21" r="11" fill={skin}/>
     <Path d="M15 21Q15 7 26 7Q37 7 37 21Q32 14 26 15Q20 14 15 21Z" fill={hair}/>
     <Path d="M17 17Q20 9 26 9Q33 9 35 17" fill="none" stroke={hair} strokeWidth="2.7" strokeLinecap="round"/>
     <Circle cx="22" cy="22" r="1.6" fill="#263238"/><Circle cx="30" cy="22" r="1.6" fill="#263238"/>
     <Circle cx="22.5" cy="21.5" r=".55" fill="#fff"/><Circle cx="30.5" cy="21.5" r=".55" fill="#fff"/>
     {happy?<Path d="M22 27Q26 30 30 27" fill="none" stroke="#7c3f35" strokeWidth="1.2" strokeLinecap="round"/>:<Path d="M23 27Q26 28 29 27" fill="none" stroke="#7c3f35" strokeWidth="1" strokeLinecap="round"/>}
     <Path d="M18 19L22 18M30 18L34 19" stroke="#503a32" strokeWidth="1.4" strokeLinecap="round"/>
     <Rect x="21" y="37" width="10" height="4" rx="2" fill={palette[2]??'#d6b77b'}/>
     {working&&<Circle cx="38" cy="39" r="4" fill="#d5b978" opacity=".95"/>}
     {role==='teacher'&&<Path d="M35 35L44 30L44 39" fill="#d8c69b"/>}
     {role==='guide'&&<Rect x="36" y="37" width="7" height="10" rx="1.5" fill="#c9ad73"/>}
     {role==='merchant'&&<Rect x="37" y="42" width="7" height="8" rx="1" fill="#f0c878"/>}
     {role==='guard'&&<Polygon points="37,35 44,38 41,46 37,43" fill="#d2b36b"/>}
     {role==='scientist'&&<Rect x="35" y="36" width="8" height="10" rx="1" fill="#d9e5e7"/>}
     {role==='resident'&&<Path d="M17 12Q26 4 35 12" fill="none" stroke="#8e694f" strokeWidth="2" opacity=".65"/>}
   </G>
 </Svg>
}

function VehicleShape({actor}:{actor:SimulatedActor}){
 const kind=actor.role.slice('vehicle:'.length),accent=kind==='train'?'#5d747b':kind==='bus'?'#6f8e70':kind==='boat'?'#547b84':kind==='airplane'?'#d1d9dc':kind==='bicycle'?'#657c7d':'#66706d';
 return <Svg width="100%" height="100%" viewBox="0 0 58 36"><Ellipse cx="29" cy="33" rx="24" ry="2.5" fill="#101b16" opacity=".35"/>{kind==='train'?<><Rect x="3" y="8" width="52" height="17" rx="4" fill={accent}/><Rect x="7" y="11" width="9" height="7" rx="1" fill="#b9d9d2"/><Rect x="19" y="11" width="9" height="7" rx="1" fill="#b9d9d2"/><Rect x="31" y="11" width="9" height="7" rx="1" fill="#b9d9d2"/><Rect x="43" y="11" width="7" height="7" rx="1" fill="#b9d9d2"/><Circle cx="11" cy="28" r="3" fill="#293236"/><Circle cx="47" cy="28" r="3" fill="#293236"/><Path d="M2 17H56" stroke="#d2b36b" strokeWidth="1.5"/><Rect x="0" y="20" width="4" height="5" rx="1" fill="#8e5f43"/></>:kind==='boat'?<><Path d="M5 18H53L44 29H14Z" fill={accent}/><Path d="M20 17V7H38V17" fill="#819ba0"/><Path d="M29 5V1" stroke="#d8c895" strokeWidth="2"/></>:kind==='airplane'?<><Path d="M4 17H54L35 11L31 4H23L22 15L8 11Z" fill={accent}/><Path d="M22 18L19 31H29L32 18" fill="#c1cace"/></>:kind==='bicycle'?<><Circle cx="15" cy="26" r="7" fill="none" stroke={accent} strokeWidth="2"/><Circle cx="43" cy="26" r="7" fill="none" stroke={accent} strokeWidth="2"/><Path d="M15 26L25 15L32 26L43 26L31 15H24L19 26" fill="none" stroke={accent} strokeWidth="2"/></>:<><Rect x="5" y="9" width="48" height="17" rx="5" fill={accent}/><Rect x="11" y="11" width="10" height="6" rx="1" fill="#b9d9d2"/><Rect x="24" y="11" width="10" height="6" rx="1" fill="#b9d9d2"/><Rect x="37" y="11" width="9" height="6" rx="1" fill="#b9d9d2"/><Circle cx="14" cy="29" r="4" fill="#293236"/><Circle cx="44" cy="29" r="4" fill="#293236"/></>}</Svg>
}
