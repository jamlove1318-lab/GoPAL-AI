import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';

export type GameWorldBuildingId = 'sanctuary' | 'cafe' | 'library' | 'market' | 'garden';
export type GameWorldBuilding = { id: GameWorldBuildingId; x: number; y: number; scale?: number; label?: string; onPress?: () => void };

const BUILDINGS: GameWorldBuilding[] = [
  { id: 'sanctuary', x: 14, y: 70, scale: .95 },
  { id: 'cafe', x: 47, y: 41, scale: 1.05 },
  { id: 'library', x: 75, y: 23, scale: .92 },
  { id: 'market', x: 78, y: 68 },
  { id: 'garden', x: 31, y: 82, scale: .9 },
];

export function LivingGameWorld({ children, buildings = BUILDINGS, time = 'afternoon' }: { children?: ReactNode; buildings?: GameWorldBuilding[]; time?: 'morning'|'afternoon'|'evening'|'night' }) {
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => { const a = Animated.loop(Animated.sequence([
    Animated.timing(motion, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    Animated.timing(motion, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
  ])); a.start(); return () => a.stop(); }, [motion]);
  const night = time === 'night';
  return <View style={styles.root}>
    <View style={[styles.ground, { backgroundColor: night ? '#172b29' : time === 'evening' ? '#4c634e' : '#668b5d' }]} />
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="none" pointerEvents="none">
      <Path d="M0 125Q100 60 205 105T400 80V0H0Z" fill={night ? '#14283b' : '#8eb9b0'} opacity=".34" />
      <Path d="M-20 610C70 560 95 450 175 405C235 370 275 330 292 210" fill="none" stroke="#b9a47a" strokeWidth="44" opacity=".38" strokeLinecap="round" />
      <Path d="M175 405C235 465 305 500 420 505" fill="none" stroke="#b9a47a" strokeWidth="35" opacity=".32" strokeLinecap="round" />
      <Path d="M175 405C130 505 95 640 70 820" fill="none" stroke="#cdbd8f" strokeWidth="28" opacity=".3" strokeLinecap="round" />
    </Svg>
    <WorldTrees motion={motion} />
    {buildings.map(b => <PhysicalBuilding key={b.id} building={b} night={night} />)}
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>{children}</View>
  </View>;
}

function WorldTrees({ motion }: { motion: Animated.Value }) {
  const trees = [[6,18,1],[20,12,.75],[88,12,.95],[94,43,.72],[8,52,.8],[58,7,.65],[60,89,.8],[94,83,.85]] as const;
  const rotate = motion.interpolate({ inputRange:[0,1], outputRange:['-1deg','1deg'] });
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{trees.map(([x,y,s],i)=><Animated.View key={i} style={{position:'absolute',left:`${x}%`,top:`${y}%`,width:58*s,height:78*s,marginLeft:-29*s,marginTop:-62*s,transform:[{rotate}]}}><Svg width="100%" height="100%" viewBox="0 0 58 78"><Ellipse cx="29" cy="73" rx="23" ry="5" fill="#183022" opacity=".35"/><Rect x="25" y="42" width="8" height="29" rx="3" fill="#5b4630"/><Circle cx="19" cy="35" r="17" fill="#315a39"/><Circle cx="39" cy="32" r="19" fill="#3f6d42"/><Circle cx="29" cy="18" r="18" fill="#4d7a47"/></Svg></Animated.View>)}</View>;
}

function PhysicalBuilding({ building, night }: { building: GameWorldBuilding; night: boolean }) {
  const s = building.scale ?? 1; const w = 150*s;
  return <Pressable disabled={!building.onPress} onPress={building.onPress} style={{position:'absolute',left:`${building.x}%`,top:`${building.y}%`,width:w,height:w,marginLeft:-w/2,marginTop:-w*.75,zIndex:Math.round(building.y*10)}}>
    <View style={{position:'absolute',left:18*s,right:18*s,bottom:8*s,height:24*s,borderRadius:40,backgroundColor:'#15231c',opacity:.4}} />
    <BuildingArt id={building.id} night={night} s={s} />
  </Pressable>;
}

function BuildingArt({ id, night, s }: { id: GameWorldBuildingId; night: boolean; s: number }) {
  const win = night ? '#f8c873' : '#b9d9d2'; const p = { width:150*s, height:125*s };
  if(id==='cafe') return <Svg {...p} viewBox="0 0 150 125"><Polygon points="14,59 75,14 136,59" fill="#55372f"/><Polygon points="20,55 75,19 130,55" fill="#b85e47"/><Path d="M20 55H130V108H20Z" fill="#87503d"/><Rect x="38" y="64" width="23" height="24" rx="3" fill={win}/><Rect x="89" y="64" width="23" height="24" rx="3" fill={win}/><Path d="M65 108V78Q75 68 85 78V108Z" fill="#33282a"/><Path d="M112 39Q124 31 128 19" stroke="#d7e0d9" strokeWidth="5" opacity=".22" strokeLinecap="round"/></Svg>;
  if(id==='library') return <Svg {...p} viewBox="0 0 150 125"><Polygon points="18,48 75,11 132,48" fill="#35465c"/><Path d="M22 47H128V108H22Z" fill="#586277"/><Path d="M33 48V108M54 48V108M75 48V108M96 48V108M117 48V108" stroke="#343c4c" strokeWidth="3"/><Rect x="38" y="63" width="16" height="24" fill={win}/><Rect x="96" y="63" width="16" height="24" fill={win}/><Path d="M65 108V68Q75 56 85 68V108Z" fill="#2b303b"/></Svg>;
  if(id==='market') return <Svg {...p} viewBox="0 0 150 125"><Path d="M13 48Q27 18 41 48Q55 18 69 48Q83 18 97 48Q111 18 137 48Z" fill="#b34f3d"/><Path d="M15 48H135V104H15Z" fill="#714037"/><Path d="M22 63H128M22 79H128" stroke="#d49366" strokeWidth="3" opacity=".45"/><Path d="M33 104V49M117 104V49" stroke="#312523" strokeWidth="5"/><Circle cx="28" cy="37" r="6" fill={win}/><Circle cx="122" cy="37" r="6" fill={win}/></Svg>;
  if(id==='garden') return <Svg {...p} viewBox="0 0 150 125"><Path d="M15 103Q35 45 55 103M40 103Q62 30 80 103M69 103Q90 43 108 103M95 103Q119 49 137 103" stroke="#2f6749" strokeWidth="12" fill="none" strokeLinecap="round"/><Path d="M17 105Q75 70 135 105" stroke="#b0a078" strokeWidth="8" fill="none"/><Circle cx="75" cy="87" r="14" fill="#6e7a7c"/><Circle cx="75" cy="87" r="8" fill="#b9e2d8"/></Svg>;
  return <Svg {...p} viewBox="0 0 150 125"><Polygon points="24,58 75,20 126,58" fill="#314d43"/><Path d="M28 57H122V108H28Z" fill="#52695e"/><Path d="M62 108V73Q75 62 88 73V108Z" fill="#2d3a35"/><Rect x="69" y="59" width="12" height="9" fill={win}/></Svg>;
}

const styles=StyleSheet.create({root:{...StyleSheet.absoluteFillObject,overflow:'hidden'},ground:{...StyleSheet.absoluteFillObject}});
