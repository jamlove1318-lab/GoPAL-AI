import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { buildingVariant, propScale, WORLD_PALETTES } from '../data/livingWorldArt';
import { worldDepth } from '../geometry/livingWorldGeometry';

export type WorldTheme = 'emerald' | 'sakura' | 'mountain' | 'coastal' | 'festival';
export type WorldBuildingType = 'house' | 'cafe' | 'library' | 'market' | 'school' | 'sanctuary' | 'workshop';
export type WorldPropType = 'tree' | 'rock' | 'lamp' | 'bench' | 'fence' | 'flower' | 'sign';
export type WorldBuildingDefinition = { id:string; type:WorldBuildingType; x:number; y:number; scale?:number; label?:string; onPress?:()=>void };
export type WorldPropDefinition = { id:string; type:WorldPropType; x:number; y:number; scale?:number };

const ICON:Record<WorldBuildingType,string>={house:'⌂',cafe:'☕',library:'📚',market:'🏮',school:'✦',sanctuary:'✧',workshop:'⚒'};
const PROP:Record<WorldPropType,string>={tree:'🌳',rock:'🪨',lamp:'🏮',bench:'🪑',fence:'▥',flower:'🌼',sign:'▰'};

export function WorldBuilding({building,theme='emerald'}:{building:WorldBuildingDefinition;theme?:WorldTheme}){
 const art=buildingVariant(theme,building.type); const s=building.scale??1; const w=112*s; const h=92*s;
 return <Pressable disabled={!building.onPress} onPress={building.onPress} style={{position:'absolute',left:`${building.x}%`,top:`${building.y}%`,zIndex:worldDepth(building.y,20),width:w,height:h,marginLeft:-w/2,marginTop:-h*.82}}>
  <View style={{position:'absolute',left:w*.08,right:w*.08,bottom:0,height:12*s,borderRadius:20,backgroundColor:'#0f172a',opacity:.25}}/>
  <View style={{position:'absolute',left:w*.03,top:2*s,width:w*.94,height:32*s,backgroundColor:art.roof,borderTopLeftRadius:28*s,borderTopRightRadius:28*s,transform:[{skewX:'-4deg'}]}}/>
  <View style={{position:'absolute',left:w*.09,top:27*s,width:w*.82,height:h*.58,backgroundColor:art.wall,borderBottomLeftRadius:12*s,borderBottomRightRadius:12*s}}>
   <View style={{position:'absolute',left:8*s,top:11*s,width:20*s,height:18*s,borderRadius:4*s,backgroundColor:art.window,borderWidth:2,borderColor:art.trim}}/>
   <View style={{position:'absolute',right:8*s,top:11*s,width:20*s,height:18*s,borderRadius:4*s,backgroundColor:art.window,borderWidth:2,borderColor:art.trim}}/>
   <View style={{position:'absolute',left:'50%',bottom:0,width:26*s,height:39*s,marginLeft:-13*s,backgroundColor:art.accent,borderTopLeftRadius:9*s,borderTopRightRadius:9*s}}/>
   <View style={{position:'absolute',left:'50%',bottom:20*s,width:6*s,height:6*s,marginLeft:-3*s,borderRadius:3*s,backgroundColor:art.trim}}/>
  </View>
  <View style={{position:'absolute',top:33*s,left:'50%',marginLeft:-17*s,width:34*s,height:26*s,alignItems:'center',justifyContent:'center',borderRadius:13*s,backgroundColor:'rgba(15,23,42,.16)'}}><Text style={{fontSize:15*s}}>{ICON[building.type]}</Text></View>
  {building.label&&<Text style={{position:'absolute',bottom:-15*s,left:0,right:0,textAlign:'center',fontSize:8*s,fontWeight:'800',color:'#fff',backgroundColor:'rgba(15,23,42,.45)',paddingHorizontal:5,borderRadius:8}}>{building.label}</Text>}
 </Pressable>;
}

export function WorldProp({prop,theme='emerald'}:{prop:WorldPropDefinition;theme?:WorldTheme}){
 const scale=(prop.scale??1)*propScale(prop.type); const palette=WORLD_PALETTES[theme];
 return <View pointerEvents="none" style={{position:'absolute',left:`${prop.x}%`,top:`${prop.y}%`,zIndex:worldDepth(prop.y,10),transform:[{scale}],transformOrigin:'center'}}>
  <View style={{alignItems:'center',justifyContent:'center'}}>
   <View style={{position:'absolute',bottom:0,width:28,height:7,borderRadius:8,backgroundColor:'#0f172a',opacity:.2}}/>
   <Text style={{fontSize:prop.type==='tree'?31:22}}>{PROP[prop.type]}</Text>
   {prop.type==='tree'&&<View style={{position:'absolute',top:7,right:3,width:6,height:6,borderRadius:3,backgroundColor:palette.accent,opacity:.45}}/>}
  </View>
 </View>;
}

export function WorldScene({buildings,props,theme='emerald'}:{buildings:WorldBuildingDefinition[];props:WorldPropDefinition[];theme?:WorldTheme}){
 return <View pointerEvents="box-none" style={{position:'absolute',inset:0}}>{props.map(p=><WorldProp key={p.id} prop={p} theme={theme}/>)}{buildings.map(b=><WorldBuilding key={b.id} building={b} theme={theme}/>)}</View>;
}
