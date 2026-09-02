import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import type { GameWorldBuilding } from './LivingGameWorld';
import type { WorldInteractionDefinition } from '../data/livingWorldInteraction';
import type { WorldActionId } from '../data/livingWorldActionSystem';
import { LivingWorldRuntime } from '../data/livingWorldRuntime';
import { worldDepth } from '../geometry/livingWorldGeometry';

type Point = { x: number; y: number };

/** Physical learner avatar driven by the canonical living-world runtime. */
export function LivingPlayerLayer({
  buildings = [],
  locationId = 'emerald-village',
  onNearbyBuilding,
  onNearbyInteraction,
}: {
  buildings?: GameWorldBuilding[];
  locationId?: string;
  onNearbyBuilding?: (building: GameWorldBuilding) => void;
  onNearbyInteraction?: (interaction: WorldInteractionDefinition) => void;
}) {
  const { width, height } = useWindowDimensions();
  const runtime = useMemo(() => new LivingWorldRuntime(locationId), [locationId]);
  const position = useRef(new Animated.ValueXY(runtime.getPlayer())).current;
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [nearbyInteraction, setNearbyInteraction] = useState<WorldInteractionDefinition | null>(null);
  const [depth, setDepth] = useState(runtime.getPlayer().y);
  const target = useRef<Point>(runtime.getPlayer()).current;
  const joystick = useRef(new Animated.ValueXY()).current;
  const movement = useRef({ x: 0, y: 0, active: false }).current;
  const tick = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const depthTick = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const point = runtime.getPlayer();
    target.x = point.x;
    target.y = point.y;
    position.setValue(point);
    setDepth(point.y);
    setNearbyInteraction(runtime.getNearbyInteraction());
  }, [runtime, position, target]);

  useEffect(() => () => {
    if (tick.current) clearInterval(tick.current);
    if (depthTick.current) clearInterval(depthTick.current);
  }, []);

  const updateNearby = (point: Point) => {
    runtime.setPlayerPosition(point.x, point.y);
    setNearbyInteraction(runtime.getNearbyInteraction());
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
    setDepth(target.y);
    updateNearby(target);
  };

  const start = () => {
    if (movement.active) return;
    movement.active = true;
    tick.current = setInterval(() => {
      const next = runtime.movePlayer(movement.x * 0.72, movement.y * 0.72);
      target.x = next.x;
      target.y = next.y;
      position.setValue(next);
      setNearbyInteraction(runtime.getNearbyInteraction());
    }, 32);
    depthTick.current = setInterval(() => setDepth(target.y), 64);
  };

  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: start,
    onPanResponderMove: (_, gesture) => {
      const dx = Math.max(-38, Math.min(38, gesture.dx));
      const dy = Math.max(-38, Math.min(38, gesture.dy));
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
  const action = nearbyInteraction?.actions[0];

  const buildingForInteraction = useMemo(() => {
    if (!nearbyInteraction || nearbyInteraction.targetKind !== 'building') return null;
    return buildings.find(item => item.id === nearbyInteraction.targetId) ?? null;
  }, [buildings, nearbyInteraction]);

  const activateNearby = () => {
    if (!nearbyInteraction) return;
    const selectedAction = action as WorldActionId | undefined;
    if (selectedAction) runtime.interact(selectedAction);
    setNearbyInteraction(runtime.getNearbyInteraction());
    onNearbyInteraction?.(nearbyInteraction);
    if (buildingForInteraction) onNearbyBuilding?.(buildingForInteraction);
  };

  return <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
    <Animated.View pointerEvents="none" style={[styles.avatar, { zIndex: worldDepth(depth, 120), transform: [{ translateX }, { translateY }, { translateX: -34 }, { translateY: -48 }, { scaleX: facing === 'left' ? -1 : 1 }] }]}><PlayerAvatar /></Animated.View>
    {nearbyInteraction && <Pressable onPress={activateNearby} style={styles.nearby}>
      <View style={styles.nearbyDot} />
      <Text style={styles.nearbyText}>{nearbyInteraction.label}</Text>
      <Text style={styles.nearbyAction}>{action?.toUpperCase() ?? 'EXPLORE'}</Text>
    </Pressable>}
    <View style={styles.joystickWrap} {...responder.panHandlers}><View style={styles.joystickBase}><Animated.View style={[styles.joystickKnob, { transform: [{ translateX: joystick.x }, { translateY: joystick.y }] }]} /></View></View>
  </View>;
}

function PlayerAvatar() { return <View style={styles.avatarSize}><Svg width={68} height={80} viewBox="0 0 68 80"><Ellipse cx="34" cy="74" rx="24" ry="5" fill="#08120f" opacity={0.42}/><Path d="M22 62L27 74M46 62L41 74" stroke="#202a30" strokeWidth="7" strokeLinecap="round"/><Path d="M16 63Q17 39 34 36Q51 39 52 63Z" fill="#294e5a"/><Path d="M20 60L34 42L48 60" fill="#5b93a0" opacity={0.55}/><Path d="M19 45Q34 35 49 45" stroke="#d7b079" strokeWidth="4" opacity={0.8}/><Circle cx="34" cy="27" r="15" fill="#d8a57f"/><Path d="M20 28Q19 10 34 9Q50 10 49 28Q42 20 34 20Q26 20 20 28Z" fill="#1d2024"/><Path d="M22 20Q28 7 39 10Q47 12 49 22Q39 17 22 20Z" fill="#34383d"/><Circle cx="29" cy="28" r="1.7" fill="#20262b"/><Circle cx="39" cy="28" r="1.7" fill="#20262b"/><Path d="M30 35Q34 38 38 35" stroke="#9b5d58" strokeWidth="1.5" strokeLinecap="round" fill="none"/><Path d="M48 44Q58 47 59 57" stroke="#d6a86a" strokeWidth="4" strokeLinecap="round"/><Rect x="29" y="40" width="10" height="3" rx="1.5" fill="#d6a86a" opacity={0.7}/></Svg></View>; }

const styles = StyleSheet.create({ avatar:{position:'absolute',width:68,height:80}, avatarSize:{width:68,height:80}, nearby:{position:'absolute',left:'50%',top:'50%',marginLeft:-76,marginTop:-100,minWidth:152,paddingHorizontal:12,paddingVertical:8,borderRadius:18,borderWidth:1,borderColor:'rgba(167,243,208,0.25)',backgroundColor:'rgba(2,6,23,0.82)',alignItems:'center',zIndex:58}, nearbyDot:{width:6,height:6,borderRadius:3,backgroundColor:'rgba(110,231,183,0.9)',marginBottom:4}, nearbyText:{color:'#f8fafc',fontSize:11,fontWeight:'800'}, nearbyAction:{color:'#6ee7b7',fontSize:8,fontWeight:'800',letterSpacing:1.8,marginTop:3}, joystickWrap:{position:'absolute',left:18,bottom:18,width:92,height:92,zIndex:60,alignItems:'center',justifyContent:'center'}, joystickBase:{width:82,height:82,borderRadius:41,borderWidth:1,borderColor:'rgba(167,243,208,0.18)',backgroundColor:'rgba(2,6,23,0.22)',alignItems:'center',justifyContent:'center'}, joystickKnob:{width:34,height:34,borderRadius:17,backgroundColor:'rgba(110,231,183,0.26)',borderWidth:1,borderColor:'rgba(167,243,208,0.45)'} });
