import React, { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { GameWorldBuilding } from './LivingGameWorld';

type Point = { x: number; y: number };

/** Physical learner avatar + compact world joystick. Nearby locations surface only a contextual world action. */
export function LivingPlayerLayer({ buildings = [], onNearbyBuilding }: { buildings?: GameWorldBuilding[]; onNearbyBuilding?: (building: GameWorldBuilding) => void }) {
  const { width, height } = useWindowDimensions();
  const position = useRef(new Animated.ValueXY({ x: 50, y: 62 })).current;
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [nearby, setNearby] = useState<GameWorldBuilding | null>(null);
  const [depth, setDepth] = useState(62);
  const target = useRef<Point>({ x: 50, y: 62 });
  const joystick = useRef(new Animated.ValueXY()).current;
  const movement = useRef({ x: 0, y: 0, active: false }).current;
  const tick = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const depthTick = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => {
    if (tick.current) clearInterval(tick.current);
    if (depthTick.current) clearInterval(depthTick.current);
  }, []);

  const updateNearby = (point: Point) => {
    let closest: GameWorldBuilding | null = null;
    let best = 10.5;
    for (const building of buildings) {
      const distance = Math.hypot(point.x - building.x, (point.y - building.y) * 0.9);
      if (distance < best) { best = distance; closest = building; }
    }
    setNearby(closest);
  };

  const stop = () => {
    movement.active = false;
    movement.x = 0;
    movement.y = 0;
    Animated.spring(joystick, { toValue: { x: 0, y: 0 }, useNativeDriver: true, tension: 140, friction: 10 }).start();
    if (tick.current) clearInterval(tick.current);
    if (depthTick.current) clearInterval(depthTick.current);
    tick.current = undefined;
    depthTick.current = undefined;
    setDepth(target.current.y);
    updateNearby(target.current);
  };

  const start = () => {
    if (movement.active) return;
    movement.active = true;
    tick.current = setInterval(() => {
      const nextX = clamp(target.current.x + movement.x * 0.72, 8, 92);
      const nextY = clamp(target.current.y + movement.y * 0.72, 14, 88);
      target.current = { x: nextX, y: nextY };
      position.setValue({ x: nextX, y: nextY });
      updateNearby(target.current);
    }, 32);
    depthTick.current = setInterval(() => setDepth(target.current.y), 96);
  };

  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: start,
    onPanResponderMove: (_, gesture) => {
      const dx = clamp(gesture.dx, -38, 38);
      const dy = clamp(gesture.dy, -38, 38);
      const length = Math.hypot(dx, dy) || 1;
      const normalized = Math.min(length, 38) / 38;
      movement.x = (dx / length) * normalized;
      movement.y = (dy / length) * normalized;
      joystick.setValue({ x: dx, y: dy });
      if (Math.abs(dx) > 3) setFacing(dx < 0 ? 'left' : 'right');
    },
    onPanResponderRelease: stop,
    onPanResponderTerminate: stop,
  })).current;

  const translateX = position.x.interpolate({ inputRange: [0, 100], outputRange: [0, width] });
  const translateY = position.y.interpolate({ inputRange: [0, 100], outputRange: [0, height] });

  return <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
    <Animated.View pointerEvents="none" style={[styles.avatar, { zIndex: Math.round(depth * 10), transform: [{ translateX }, { translateY }, { translateX: -34 }, { translateY: -48 }, { scaleX: facing === 'left' ? -1 : 1 }] }]}>
      <PlayerAvatar />
    </Animated.View>
    {nearby && <Pressable onPress={() => onNearbyBuilding?.(nearby)} style={styles.nearby}>
      <View style={styles.nearbyDot} />
      <Text style={styles.nearbyText}>{buildingLabel(nearby.id)}</Text>
      <Text style={styles.nearbyAction}>EXPLORE</Text>
    </Pressable>}
    <View style={styles.joystickWrap} {...responder.panHandlers}>
      <View style={styles.joystickBase}>
        <Animated.View style={[styles.joystickKnob, { transform: [{ translateX: joystick.x }, { translateY: joystick.y }] }]} />
      </View>
    </View>
  </View>;
}

function buildingLabel(id: GameWorldBuilding['id']) {
  return id === 'cafe' ? 'Komorebi Café' : id === 'library' ? 'Whispering Library' : id === 'market' ? 'Lantern Market' : id === 'garden' ? 'Whisper Garden' : 'Sanctuary';
}

function PlayerAvatar() {
  return <View style={styles.avatarSize}>
    <Svg width={68} height={76} viewBox="0 0 68 76">
      <Ellipse cx="34" cy="70" rx="24" ry="5" fill="#08120f" opacity={0.42} />
      <Path d="M23 61L27 72" stroke="#202a30" strokeWidth="6" strokeLinecap="round" />
      <Path d="M45 61L41 72" stroke="#202a30" strokeWidth="6" strokeLinecap="round" />
      <Path d="M17 62Q18 39 34 36Q50 39 51 62Z" fill="#294e5a" />
      <Path d="M21 59L34 42L47 59" fill="#3f7180" opacity={0.6} />
      <Circle cx="34" cy="27" r="15" fill="#d8a57f" />
      <Path d="M20 28Q19 10 34 9Q50 10 49 28Q42 20 34 20Q26 20 20 28Z" fill="#1d2024" />
      <Circle cx="29" cy="28" r="1.7" fill="#20262b" />
      <Circle cx="39" cy="28" r="1.7" fill="#20262b" />
      <Path d="M30 35Q34 38 38 35" stroke="#9b5d58" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M48 44Q58 47 59 57" stroke="#d6a86a" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  </View>;
}

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }

const styles = StyleSheet.create({
  avatar: { position: 'absolute', width: 68, height: 76 },
  avatarSize: { width: 68, height: 76 },
  nearby: { position: 'absolute', left: '50%', top: '50%', marginLeft: -76, marginTop: -100, minWidth: 152, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(167,243,208,0.25)', backgroundColor: 'rgba(2,6,23,0.82)', alignItems: 'center', zIndex: 58 },
  nearbyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(110,231,183,0.9)', marginBottom: 4 },
  nearbyText: { color: '#f8fafc', fontSize: 11, fontWeight: '800' },
  nearbyAction: { color: '#6ee7b7', fontSize: 8, fontWeight: '800', letterSpacing: 1.8, marginTop: 3 },
  joystickWrap: { position: 'absolute', left: 18, bottom: 18, width: 92, height: 92, zIndex: 60, alignItems: 'center', justifyContent: 'center' },
  joystickBase: { width: 82, height: 82, borderRadius: 41, borderWidth: 1, borderColor: 'rgba(167,243,208,0.18)', backgroundColor: 'rgba(2,6,23,0.22)', alignItems: 'center', justifyContent: 'center' },
  joystickKnob: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(110,231,183,0.26)', borderWidth: 1, borderColor: 'rgba(167,243,208,0.45)' },
});
