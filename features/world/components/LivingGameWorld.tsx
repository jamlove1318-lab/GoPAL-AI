import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect } from 'react-native-svg';

export type GameWorldBuildingId = 'sanctuary' | 'cafe' | 'library' | 'market' | 'garden';

export interface GameWorldBuilding {
  id: GameWorldBuildingId;
  x: number;
  y: number;
  width: number;
  height: number;
  accent: string;
  onPress?: (building: GameWorldBuilding) => void;
}

const BUILDINGS: GameWorldBuilding[] = [
  { id: 'sanctuary', x: 15, y: 19, width: 24, height: 22, accent: '#8b5cf6' },
  { id: 'cafe', x: 45, y: 28, width: 22, height: 19, accent: '#f59e0b' },
  { id: 'library', x: 70, y: 18, width: 21, height: 20, accent: '#38bdf8' },
  { id: 'market', x: 69, y: 57, width: 22, height: 18, accent: '#fb7185' },
  { id: 'garden', x: 25, y: 62, width: 27, height: 18, accent: '#34d399' },
];

const TREE_POINTS = [
  [8, 18], [7, 47], [12, 77], [20, 87], [39, 83], [55, 87], [86, 84], [94, 67],
  [92, 43], [82, 8], [58, 11], [36, 9], [4, 63], [57, 72], [79, 78],
] as const;

const ROCK_POINTS = [[13, 57], [42, 18], [62, 63], [88, 51], [55, 48], [31, 46]] as const;

function BuildingArt({ building }: { building: GameWorldBuilding }) {
  const width = 180;
  const height = 145;
  const roof = building.accent;
  const body = building.id === 'library' ? '#dbeafe' : building.id === 'garden' ? '#dcfce7' : '#f8fafc';
  const wall = building.id === 'sanctuary' ? '#ede9fe' : '#e2e8f0';

  return (
    <Svg width={width} height={height} viewBox="0 0 180 145">
      <Ellipse cx="90" cy="128" rx="72" ry="12" fill="#020617" opacity={0.25} />
      <Polygon points="90,10 166,48 90,86 14,48" fill={roof} opacity={0.95} />
      <Polygon points="14,48 90,86 90,132 14,94" fill={wall} />
      <Polygon points="90,86 166,48 166,94 90,132" fill={body} />
      <Polygon points="28,49 90,19 152,49 90,78" fill="#ffffff" opacity={0.18} />
      {building.id === 'cafe' && <>
        <Rect x="35" y="69" width="38" height="28" rx="4" fill="#92400e" opacity={0.85} />
        <Rect x="43" y="75" width="22" height="14" rx="3" fill="#fde68a" opacity={0.8} />
        <Circle cx="116" cy="88" r="9" fill="#fbbf24" opacity={0.7} />
        <Path d="M112 78 C104 70 116 65 120 73 C124 65 134 70 126 79" stroke="#f8fafc" strokeWidth="3" fill="none" opacity={0.75} />
      </>}
      {building.id === 'library' && <>
        <Rect x="29" y="61" width="42" height="38" rx="4" fill="#7c3aed" opacity={0.72} />
        <Path d="M39 68v25M49 68v25M59 68v25" stroke="#e9d5ff" strokeWidth="5" opacity={0.8} />
        <Rect x="106" y="72" width="34" height="22" rx="3" fill="#60a5fa" opacity={0.55} />
      </>}
      {building.id === 'market' && <>
        <Path d="M28 70 Q90 45 151 70 L145 87 Q90 66 35 87Z" fill="#fb7185" />
        <Path d="M39 80v25M141 80v25" stroke="#78350f" strokeWidth="6" />
        <Circle cx="89" cy="86" r="12" fill="#f59e0b" opacity={0.7} />
      </>}
      {building.id === 'garden' && <>
        <Ellipse cx="90" cy="88" rx="50" ry="27" fill="#86efac" opacity={0.75} />
        <Circle cx="66" cy="78" r="7" fill="#fb7185" /><Circle cx="83" cy="95" r="6" fill="#facc15" />
        <Circle cx="105" cy="78" r="7" fill="#a78bfa" /><Circle cx="119" cy="94" r="6" fill="#fb7185" />
        <Path d="M90 61v48M70 68v42M110 68v42" stroke="#166534" strokeWidth="3" opacity={0.8} />
      </>}
      {building.id === 'sanctuary' && <>
        <Polygon points="90,28 103,49 77,49" fill="#f8fafc" opacity={0.9} />
        <Rect x="70" y="63" width="40" height="48" rx="3" fill="#c4b5fd" opacity={0.7} />
        <Path d="M90 70v30M78 85h24" stroke="#7c3aed" strokeWidth="5" opacity={0.7} />
      </>}
      <Path d="M15 94 L90 132 L166 94" stroke="#ffffff" strokeWidth="2" opacity={0.18} fill="none" />
    </Svg>
  );
}

function Tree({ x, y, index }: { x: number; y: number; index: number }) {
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 1800 + index * 120, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(sway, { toValue: 0, duration: 1800 + index * 120, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [index, sway]);
  const rotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: [{ translateX: -22 }, { translateY: -54 }, { rotate }], zIndex: Math.round(y) }}>
      <View style={{ position: 'absolute', left: 8, top: 48, width: 28, height: 12, borderRadius: 20, backgroundColor: '#020617', opacity: 0.22 }} />
      <Svg width={58} height={72} viewBox="0 0 58 72">
        <Ellipse cx="29" cy="63" rx="23" ry="6" fill="#020617" opacity={0.18} />
        <Path d="M27 58 C26 48 26 40 29 32" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
        <Circle cx="19" cy="32" r="15" fill="#166534" />
        <Circle cx="36" cy="30" r="18" fill="#15803d" />
        <Circle cx="29" cy="17" r="16" fill="#22c55e" />
        <Circle cx="21" cy="12" r="6" fill="#86efac" opacity={0.35} />
      </Svg>
    </Animated.View>
  );
}

function Rock({ x, y, index }: { x: number; y: number; index: number }) {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(index * 160),
      Animated.timing(bob, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(bob, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [bob, index]);
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] });
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: [{ translateX: -11 }, { translateY },], zIndex: Math.round(y) }}><Svg width={30} height={22}><Ellipse cx="15" cy="16" rx="12" ry="4" fill="#020617" opacity={0.16}/><Polygon points="4,14 10,4 24,3 28,13 19,18" fill="#64748b"/><Path d="M10 6l10-1" stroke="#cbd5e1" strokeWidth="2" opacity={0.45}/></Svg></Animated.View>;
}

function GroundPath() {
  return <Svg pointerEvents="none" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><Path d="M50 103 C48 87 42 78 31 69 C24 63 28 55 43 51 C56 47 66 42 64 32 C61 20 56 8 52 -3" stroke="#d6b98c" strokeWidth="10" fill="none" opacity={0.95}/><Path d="M49 103 C48 87 42 78 31 69 C24 63 28 55 43 51 C56 47 66 42 64 32 C61 20 56 8 52 -3" stroke="#ead3a6" strokeWidth="6" fill="none" opacity={0.9}/><Path d="M31 69 C49 72 65 74 82 68" stroke="#d6b98c" strokeWidth="8" fill="none" opacity={0.95}/><Path d="M31 69 C49 72 65 74 82 68" stroke="#ead3a6" strokeWidth="4" fill="none" opacity={0.9}/></Svg>;
}

function Water() {
  const wave = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(wave, { toValue: 1, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(wave, { toValue: 0, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [wave]);
  const shift = wave.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] });
  return <View pointerEvents="none" style={{ position: 'absolute', left: '52%', top: '72%', width: '43%', height: '20%', borderRadius: 999, overflow: 'hidden', opacity: 0.72, transform: [{ rotate: '-8deg' }], zIndex: 1 }}><Svg width="100%" height="100%" viewBox="0 0 160 70"><Ellipse cx="80" cy="35" rx="78" ry="31" fill="#38bdf8" opacity={0.25}/><Animated.View style={{ transform: [{ translateX: shift }] }}><Svg width="160" height="70"><Path d="M10 30 Q45 20 80 30 T150 30M20 45 Q55 35 90 45 T145 45" stroke="#bae6fd" strokeWidth="3" opacity={0.55} fill="none"/></Svg></Animated.View></Svg></View>;
}

export function LivingGameWorld({ buildings = BUILDINGS, children, onBuildingPress }: { buildings?: GameWorldBuilding[]; children?: ReactNode; onBuildingPress?: (building: GameWorldBuilding) => void }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.14] });
  const orderedBuildings = useMemo(() => [...buildings].sort((a, b) => a.y - b.y), [buildings]);

  return (
    <View className="absolute inset-0 overflow-hidden" pointerEvents="box-none">
      <View pointerEvents="none" className="absolute inset-0 bg-[#79a85b]" />
      <Svg pointerEvents="none" className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Polygon points="0,0 100,0 100,100 0,100" fill="#86b866" />
        <Path d="M0 24 Q25 8 51 22 T100 18" stroke="#9bc77a" strokeWidth="16" opacity={0.25} fill="none" />
        <Path d="M-5 82 Q20 63 45 78 T105 65" stroke="#5f944b" strokeWidth="14" opacity={0.2} fill="none" />
      </Svg>
      <Water />
      <GroundPath />
      {TREE_POINTS.map(([x, y], index) => <Tree key={`tree-${index}`} x={x} y={y} index={index} />)}
      {ROCK_POINTS.map(([x, y], index) => <Rock key={`rock-${index}`} x={x} y={y} index={index} />)}
      {orderedBuildings.map(building => (
        <Pressable key={building.id} onPress={() => { onBuildingPress?.(building); building.onPress?.(building); }} style={{ position: 'absolute', left: `${building.x}%`, top: `${building.y}%`, width: `${building.width}%`, height: `${building.height}%`, transform: [{ translateX: '-50%' }, { translateY: '-10%' }], zIndex: Math.round(building.y) + 10 }}>
          <View className="items-center">
            <BuildingArt building={building} />
            <Animated.View pointerEvents="none" style={{ position: 'absolute', left: '20%', right: '20%', top: '25%', height: '45%', borderRadius: 999, backgroundColor: building.accent, opacity: glowOpacity }} />
          </View>
        </Pressable>
      ))}
      <View pointerEvents="none" className="absolute inset-0" style={{ backgroundColor: '#fef3c7', opacity: 0.04 }} />
      {children}
    </View>
  );
}
