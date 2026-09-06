import React,{useEffect,useRef,useState}from'react';
import{Animated,Pressable,StyleSheet,View}from'react-native';
import Svg,{Circle,Ellipse,Path,Rect}from'react-native-svg';
import type{LivingWorldRuntime}from'../data/livingWorldRuntime';
import type{SimulatedActor}from'../data/livingWorldSimulation';
import{worldDepth}from'../geometry/livingWorldGeometry';
import{NPC_ROLE_DESIGNS}from'../../../characters/npcCharacterDesign';
import type{NpcRole}from'../../../characters/npcCharacterDesign';
import{resolveNpcVisual}from'../../../engines/world/npcCharacterRegistry';

/** Ambient residents and vehicles are world entities, not UI labels. */
export function LivingSimulationActorLayer({runtime,showVehicles=false,worldId='emerald-valley',onActorPress}:{runtime:LivingWorldRuntime;showVehicles?:boolean;worldId?:string;onActorPress?:(actor:SimulatedActor)=>void}){
 const[snapshot,setSnapshot]=useState(()=>runtime.getSimulation().snapshot());
 const[revision,setRevision]=useState(0);
 useEffect(()=>{
  let active=true;
  const unsubscribe=runtime.events.subscribe(event=>{
   if(!active)return;
   if(event.type==='world-state-changed'){if(event.payload?.simulation)setSnapshot(event.payload.simulation as typeof snapshot);setRevision(value=>value+1);}
  });
  return()=>{active=false;unsubscribe();};
 },[runtime]);
 const travel=runtime.getActiveScenario()?.kind==='travel'?runtime.getActiveScenario():null;
 return <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>{snapshot.actors.filter(actor=>actor.active&&(showVehicles||!actor.role.startsWith('vehicle:'))).map(actor=><SimulationActor key={actor.id} actor={actor} worldId={worldId} onPress={onActorPress}/>)}{travel?<TravelTransport key={`${travel.id}:${revision}`} runtime={runtime} mode={String(travel.metadata?.mode??'train')} scope={String(travel.metadata?.scope??'local')}/>:null}</View>;
}

function SimulationActor({actor,worldId,onPress}:{actor:SimulatedActor;worldId:string;onPress?:(actor:SimulatedActor)=>void}){
 const scale=actor.scale??1;
 const vehicle=actor.role.startsWith('vehicle:');
 const content=<View style={{position:'absolute',left:`${actor.x}%`,top:`${actor.y}%`,width:vehicle?58*scale:48*scale,height:vehicle?36*scale:72*scale,marginLeft:vehicle?-29*scale:-24*scale,marginTop:vehicle?-18*scale:-36*scale,zIndex:worldDepth(actor.y,vehicle?8:12),transform:[{rotate:`${actor.rotation??0}deg`}]}}>{vehicle?<VehicleShape actor={actor}/>:<CharacterShape actor={actor} worldId={worldId}/>}</View>;
 return onPress&&!vehicle?<Pressable onPress={()=>onPress(actor)}>{content}</Pressable>:content;
}

function TravelTransport({runtime,mode,scope}:{runtime:LivingWorldRuntime;mode:string;scope:string}){
 const progress=useRef(new Animated.Value(0)).current;
 const scenario=runtime.getActiveScenario();
 useEffect(()=>{
  progress.setValue(0);
  Animated.timing(progress,{toValue:1,duration:Math.max(1200,scenario?.durationMs??2400),useNativeDriver:true}).start();
  return()=>progress.stopAnimation();
 },[progress,scenario?.id,scenario?.durationMs]);
 const isAir=mode==='plane';
 const isMagic=mode==='magic';
 const startX=isAir?8:scope==='cross-world'?12:18;
 const endX=isAir?92:scope==='cross-world'?88:82;
 const startY=isAir?30:mode==='train'?48:55;
 const endY=isAir?18:mode==='train'?38:45;
 const x=progress.interpolate({inputRange:[0,1],outputRange:[startX,endX]});
 const y=progress.interpolate({inputRange:[0,1],outputRange:[startY,endY]});
 const opacity=progress.interpolate({inputRange:[0,.08,.88,1],outputRange:[0,1,1,0]});
 const scale=progress.interpolate({inputRange:[0,.5,1],outputRange:[isMagic?.65:1,isMagic?1.15:1,isMagic?.8:1]});
 const rotate=progress.interpolate({inputRange:[0,1],outputRange:[isAir?'-8deg':'0deg',isAir?'6deg':'0deg']});
 return <Animated.View pointerEvents="none" style={[styles.travelTransport,{left:x,top:y,opacity,transform:[{translateX:-34},{translateY:-24},{scale},{rotate}],zIndex:worldDepth(startY,80)}]}>{isMagic?<MagicTransport/>:<Svg width={68} height={48} viewBox="0 0 68 48">{isAir?<Airplane/>:mode==='train'?<Train/>:mode==='bus'?<Bus/>:<Car/>}</Svg>}</Animated.View>;
}
function Train(){return <><Rect x="4" y="10" width="60" height="21" rx="5" fill="#58747a"/><Rect x="9" y="14" width="10" height="8" fill="#c6e0db"/><Rect x="23" y="14" width="10" height="8" fill="#c6e0db"/><Rect x="37" y="14" width="10" height="8" fill="#c6e0db"/><Rect x="51" y="14" width="8" height="8" fill="#c6e0db"/><Circle cx="15" cy="35" r="4" fill="#263237"/><Circle cx="53" cy="35" r="4" fill="#263237"/><Path d="M3 39H65" stroke="#9fb9b7" strokeWidth="2"/></>}
function Bus(){return <><Rect x="5" y="11" width="58" height="22" rx="6" fill="#6b8b70"/><Rect x="11" y="14" width="12" height="8" rx="1" fill="#c6e0db"/><Rect x="27" y="14" width="12" height="8" rx="1" fill="#c6e0db"/><Rect x="43" y="14" width="12" height="8" rx="1" fill="#c6e0db"/><Circle cx="17" cy="37" r="4" fill="#263237"/><Circle cx="51" cy="37" r="4" fill="#263237"/></>}
function Car(){return <><Path d="M8 28L14 17Q16 13 22 13H45Q50 13 54 20L60 28Z" fill="#66706d"/><Rect x="5" y="24" width="58" height="10" rx="4" fill="#66706d"/><Path d="M20 17H30L27 23H16ZM33 17H44L50 23H31Z" fill="#bdd4d1"/><Circle cx="17" cy="35" r="4" fill="#263237"/><Circle cx="51" cy="35" r="4" fill="#263237"/></>}
function Airplane(){return <><Path d="M4 22H64L43 16L38 5H29L27 19L9 14Z" fill="#d3dcdf"/><Path d="M27 23L22 42H35L40 23" fill="#bfcbd0"/><Path d="M4 22L20 25" stroke="#91a8ad" strokeWidth="2"/></>}
function MagicTransport(){return <Svg width="74" height="62" viewBox="0 0 74 62"><Circle cx="37" cy="31" r="17" fill="#7ce7c4" opacity=".16"/><Circle cx="37" cy="31" r="11" fill="none" stroke="#a7f3d0" strokeWidth="2" opacity=".7"/><Path d="M37 7L41 25L57 31L41 37L37 55L33 37L17 31L33 25Z" fill="#8ce8c8" opacity=".72"/><Circle cx="37" cy="31" r="4" fill="#e2fff5"/></Svg>}

function CharacterShape({actor,worldId}:{actor:SimulatedActor;worldId:string}){
 const role=(NPC_ROLE_DESIGNS[actor.role as NpcRole]?actor.role:'resident') as NpcRole;
 const visual=resolveNpcVisual(actor.id,role,worldId);
 const palette=visual.palette;
 const shirt=palette[0]??'#64748b',hair=palette[1]??'#4b5563',shoes=palette[2]??'#303b40',skin='#e7b58d';
 const happy=actor.activity?.toLowerCase().includes('talk')||actor.activity?.toLowerCase().includes('greet');
 return <Svg width="100%" height="100%" viewBox="0 0 48 72"><Ellipse cx="24" cy="68" rx="15" ry="3.5" fill="#101b16" opacity={.35}/><Path d="M13 45L10 64Q12 68 16 66L20 48M35 45L38 64Q36 68 32 66L28 48" fill={shoes}/><Path d="M18 41L14 53Q15 57 19 57L24 47L29 57Q33 57 34 53L30 41Z" fill={shirt}/><Path d="M15 32Q10 35 10 43L15 48L19 44L18 36M33 32Q38 35 38 43L33 48L29 44L30 36" fill={shirt}/><Circle cx="12" cy="45" r="3.2" fill={skin}/><Circle cx="36" cy="45" r="3.2" fill={skin}/><Rect x="17" y="18" width="14" height="8" rx="4" fill={skin}/><Circle cx="24" cy="15" r="10" fill={skin}/><Path d="M14 15Q14 3 24 3Q34 3 34 15Q30 9 24 10Q18 9 14 15Z" fill={hair}/><Path d="M16 11Q18 5 24 5Q30 5 32 11" fill="none" stroke={hair} strokeWidth="2.5" strokeLinecap="round"/><Circle cx="20" cy="16" r="1.6" fill="#263238"/><Circle cx="28" cy="16" r="1.6" fill="#263238"/><Circle cx="20.5" cy="15.5" r=".55" fill="#fff"/><Circle cx="28.5" cy="15.5" r=".55" fill="#fff"/>{happy?<Path d="M20 20Q24 23 28 20" fill="none" stroke="#7c3f35" strokeWidth="1.2" strokeLinecap="round"/>:<Path d="M21 21Q24 22 27 21" fill="none" stroke="#7c3f35" strokeWidth="1" strokeLinecap="round"/>}<Path d="M16 13L21 12M27 12L32 13" stroke="#503a32" strokeWidth="1.4" strokeLinecap="round"/><Rect x="20" y="27" width="8" height="3" rx="1.5" fill={palette[2]??'#d6b77b'}/><Path d="M18 48L13 65M30 48L35 65" stroke={shoes} strokeWidth="5" strokeLinecap="round"/><Path d="M13 65Q9 66 9 68H18M35 65Q39 66 39 68H30" fill={shoes}/>{role==='teacher'&&<Path d="M33 29L40 25L40 34" fill="#d8c69b"/>}{role==='guide'&&<Rect x="32" y="31" width="7" height="9" rx="1.5" fill="#c9ad73"/>}{role==='merchant'&&<Rect x="34" y="38" width="6" height="7" rx="1" fill="#f0c878"/>}{role==='guard'&&<Path d="M34 29L39 31L37 38L34 36Z" fill="#d2b36b"/>}{role==='scientist'&&<Rect x="31" y="31" width="7" height="9" rx="1" fill="#d9e5e7"/>}</Svg>;
}
function VehicleShape({actor}:{actor:SimulatedActor}){
 const kind=actor.role.slice('vehicle:'.length),accent=kind==='train'?'#5d747b':kind==='bus'?'#6f8e70':kind==='boat'?'#547b84':kind==='airplane'?'#d1d9dc':kind==='bicycle'?'#657c7d':'#66706d';
 return <Svg width="100%" height="100%" viewBox="0 0 58 36"><Ellipse cx="29" cy="33" rx="24" ry="2.5" fill="#101b16" opacity=".35"/>{kind==='train'?<><Rect x="3" y="8" width="52" height="17" rx="4" fill={accent}/><Rect x="7" y="11" width="9" height="7" fill="#b9d9d2"/><Rect x="19" y="11" width="9" height="7" fill="#b9d9d2"/><Rect x="31" y="11" width="9" height="7" fill="#b9d9d2"/><Rect x="43" y="11" width="7" height="7" fill="#b9d9d2"/><Circle cx="11" cy="28" r="3" fill="#293236"/><Circle cx="47" cy="28" r="3" fill="#293236"/></>:kind==='boat'?<><Path d="M5 18H53L44 29H14Z" fill={accent}/><Path d="M20 17V7H38V17" fill="#819ba0"/><Path d="M29 5V1" stroke="#d8c895" strokeWidth="2"/></>:kind==='airplane'?<><Path d="M4 17H54L35 11L31 4H23L22 15L8 11Z" fill={accent}/><Path d="M22 18L19 31H29L32 18" fill="#c1cace"/></>:kind==='bicycle'?<><Circle cx="15" cy="26" r="7" fill="none" stroke={accent} strokeWidth="2"/><Circle cx="43" cy="26" r="7" fill="none" stroke={accent} strokeWidth="2"/><Path d="M15 26L25 15L32 26L43 26L31 15H24L19 26" fill="none" stroke={accent} strokeWidth="2"/></>:<><Rect x="5" y="9" width="48" height="17" rx="5" fill={accent}/><Rect x="11" y="11" width="10" height="6" rx="1" fill="#b9d9d2"/><Rect x="24" y="11" width="10" height="6" rx="1" fill="#b9d9d2"/><Rect x="37" y="11" width="9" height="6" rx="1" fill="#b9d9d2"/><Circle cx="14" cy="29" r="4" fill="#293236"/><Circle cx="44" cy="29" r="4" fill="#293236"/></>}</Svg>;
}
const styles=StyleSheet.create({travelTransport:{position:'absolute',width:74,height:62},});
