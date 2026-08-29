import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type LandmarkId = 'sanctuary' | 'cafe' | 'library' | 'market' | 'garden';
export type Landmark = { id: LandmarkId; name: string; x: number; y: number; scene: string; scenario?: string };

export const LIVING_LANDMARKS: Landmark[] = [
  { id: 'sanctuary', name: 'Sanctuary', x: 12, y: 70, scene: 'Your quiet home glows softly beneath the old trees.' },
  { id: 'cafe', name: 'Komorebi Café', x: 47, y: 38, scene: 'Warm windows, rising steam, and the sound of people talking.', scenario: 'scen-cafe-order' },
  { id: 'library', name: 'Whispering Library', x: 73, y: 20, scene: 'Tall shelves disappear behind glowing windows. A page turns somewhere inside.', scenario: 'scen-library-inquiry' },
  { id: 'market', name: 'Lantern Market', x: 78, y: 67, scene: 'Canvas awnings, hanging lanterns, and a street that never quite stays still.', scenario: 'scen-market-browse' },
  { id: 'garden', name: 'Whisper Garden', x: 31, y: 79, scene: 'Bamboo, stone paths, and a quiet corner that feels older than the valley.' },
];

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export function LivingLandmarkLayer({ onLandmarkPress, time = 'afternoon' }: { onLandmarkPress?: (landmark: Landmark) => void; time?: string }) {
  const lantern = useRef(new Animated.Value(0)).current;
  useEffect(() => { const loop = Animated.loop(Animated.sequence([Animated.timing(lantern,{toValue:1,duration:1600,useNativeDriver:true}),Animated.timing(lantern,{toValue:0,duration:1600,useNativeDriver:true})])); loop.start(); return () => loop.stop(); }, [lantern]);
  const night = time === 'night' || time === 'evening';
  return <View pointerEvents="box-none" className="absolute inset-0 z-20">
    {LIVING_LANDMARKS.map(landmark => <LandmarkPresence key={landmark.id} landmark={landmark} night={night} lantern={lantern} onPress={onLandmarkPress} />)}
  </View>;
}

function LandmarkPresence({ landmark, night, lantern, onPress }: { landmark: Landmark; night: boolean; lantern: Animated.Value; onPress?: (landmark: Landmark) => void }) {
  const pulse = lantern.interpolate({ inputRange: [0,1], outputRange: [0.72,1] });
  return <Pressable onPress={() => onPress?.(landmark)} style={{ position:'absolute', left:`${landmark.x}%`, top:`${landmark.y}%`, marginLeft:-56, marginTop:-62, width:112, height:124 }}>
    {landmark.id === 'cafe' && <Café night={night} glow={pulse} />}
    {landmark.id === 'library' && <Library night={night} glow={pulse} />}
    {landmark.id === 'market' && <Market night={night} glow={pulse} />}
    {landmark.id === 'sanctuary' && <Sanctuary night={night} glow={pulse} />}
    {landmark.id === 'garden' && <Garden night={night} glow={pulse} />}
    <View pointerEvents="none" className="absolute bottom-0 left-0 right-0 items-center"><Text className="rounded-full bg-slate-950/65 px-2 py-1 text-[9px] font-bold text-white/90">{landmark.name}</Text></View>
  </Pressable>;
}

function Glow({ glow, x, y }: { glow: Animated.AnimatedInterpolation<string|number>; x:number; y:number }) { return <Animated.View pointerEvents="none" style={{position:'absolute',left:x,top:y,width:20,height:20,opacity:glow,transform:[{scale:glow.interpolate({inputRange:[0.72,1],outputRange:[0.8,1.25]})}]}} className="rounded-full bg-amber-200/20"/>; }
function Café({night,glow}:{night:boolean;glow:Animated.AnimatedInterpolation<string|number>}) { return <View className="absolute inset-x-0 top-0 h-24"><Glow glow={glow} x={48} y={32}/><Svg width="112" height="98" viewBox="0 0 112 98"><Path d="M16 54 L56 16 L96 54 Z" fill="#3d2b2a"/><Path d="M12 54 L100 54 L92 90 L20 90 Z" fill="#87513d"/><Rect x="29" y="58" width="20" height="16" rx="2" fill={night?'#f8c87a':'#dceef1'}/><Rect x="64" y="58" width="20" height="16" rx="2" fill={night?'#f8c87a':'#dceef1'}/><Path d="M48 90 L48 67 Q56 61 64 67 L64 90" fill="#342528"/><Path d="M20 78 Q56 70 92 78" stroke="#f2d0a5" strokeWidth="2" opacity=".45"/></Svg><Text className="absolute left-[47px] top-[39px] text-[9px]">☕</Text></View>; }
function Library({night,glow}:{night:boolean;glow:Animated.AnimatedInterpolation<string|number>}) { return <View className="absolute inset-x-0 top-0 h-24"><Glow glow={glow} x={50} y={31}/><Svg width="112" height="100" viewBox="0 0 112 100"><Path d="M14 42 L25 14 L87 14 L99 42 Z" fill="#263a55"/><Rect x="16" y="42" width="80" height="48" rx="4" fill="#4b5266"/><Path d="M25 42 V90 M43 42 V90 M61 42 V90 M79 42 V90" stroke="#313747" strokeWidth="2"/><Rect x="27" y="53" width="15" height="19" fill={night?'#f8d58d':'#c9e1e6'}/><Rect x="68" y="53" width="15" height="19" fill={night?'#f8d58d':'#c9e1e6'}/><Path d="M49 90 V58 Q56 51 63 58 V90" fill="#2a2c39"/></Svg><Text className="absolute left-[46px] top-[31px] text-[12px] text-amber-100">✦</Text></View>; }
function Market({night,glow}:{night:boolean;glow:Animated.AnimatedInterpolation<string|number>}) { return <View className="absolute inset-x-0 top-0 h-24"><Glow glow={glow} x={17} y={30}/><Glow glow={glow} x={77} y={30}/><Svg width="112" height="100" viewBox="0 0 112 100"><Path d="M12 44 Q24 18 36 44 Q48 18 60 44 Q72 18 84 44 Q96 18 106 44 Z" fill="#9d4b37"/><Rect x="14" y="44" width="90" height="38" fill="#6d3e32"/><Path d="M20 55 H98 M20 66 H98" stroke="#c98759" strokeWidth="2" opacity=".55"/><Path d="M30 82 V49 M82 82 V49" stroke="#2d2020" strokeWidth="4"/><Circle cx="22" cy="35" r="5" fill={night?'#f6c66e':'#d79a46'}/><Circle cx="88" cy="35" r="5" fill={night?'#f6c66e':'#d79a46'}/></Svg></View>; }
function Sanctuary({night,glow}:{night:boolean;glow:Animated.AnimatedInterpolation<string|number>}) { return <View className="absolute inset-x-0 top-0 h-24"><Glow glow={glow} x={49} y={38}/><Svg width="112" height="100" viewBox="0 0 112 100"><Path d="M20 54 L56 22 L92 54 Z" fill="#263a37"/><Path d="M25 53 H87 V88 H25 Z" fill="#455a51"/><Path d="M51 88 V61 Q56 55 62 61 V88" fill="#2d3935"/><Circle cx="16" cy="44" r="18" fill="#23483d"/><Circle cx="95" cy="45" r="20" fill="#23483d"/><Circle cx="56" cy="48" r="3" fill={night?'#f8d58d':'#b9d9d4'}/></Svg></View>; }
function Garden({night,glow}:{night:boolean;glow:Animated.AnimatedInterpolation<string|number>}) { return <View className="absolute inset-x-0 top-0 h-24"><Glow glow={glow} x={51} y={42}/><Svg width="112" height="100" viewBox="0 0 112 100"><Path d="M8 83 Q28 42 42 83 M26 83 Q43 29 56 83 M48 83 Q64 39 77 83 M68 83 Q86 42 103 83" stroke="#315c48" strokeWidth="7" fill="none" strokeLinecap="round"/><Path d="M15 88 Q56 64 98 88" stroke="#8b8770" strokeWidth="5" fill="none"/><Circle cx="56" cy="74" r="9" fill="#6b7480"/><Circle cx="56" cy="74" r="5" fill={night?'#8dd8d1':'#bde8df'}/></Svg></View>; }
