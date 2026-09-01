import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

type Point = { x: number; y: number };

/** Physical learner avatar + compact world joystick. The world stays visually primary; controls are intentionally translucent. */
export function LivingPlayerLayer() {
  const position = useRef(new Animated.ValueXY({ x: 50, y: 62 })).current;
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const target = useRef<Point>({ x: 50, y: 62 });
  const joystick = useRef(new Animated.ValueXY()).current;
  const knob = useRef({ x: 0, y: 0 });
  const movement = useRef({ x: 0, y: 0, active: false }).current;
  const tick = useRef<ReturnType<typeof setInterval> | undefined>();

  const stop = () => {
    movement.active = false;
    movement.x = 0;
    movement.y = 0;
    knob.x = 0;
    knob.y = 0;
    Animated.spring(joystick, { toValue: { x: 0, y: 0 }, useNativeDriver: true, tension: 140, friction: 10 }).start();
    if (tick.current) clearInterval(tick.current);
    tick.current = undefined;
  };

  const start = () => {
    if (movement.active) return;
    movement.active = true;
    tick.current = setInterval(() => {
      const nextX = clamp(target.current.x + movement.x * 0.72, 8, 92);
      const nextY = clamp(target.current.y + movement.y * 0.72, 14, 88);
      target.current = { x: nextX, y: nextY };
      position.setValue({ x: nextX, y: nextY });
    }, 32);
  };

  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => start(),
    onPanResponderMove: (_, gesture) => {
      const dx = clamp(gesture.dx, -38, 38);
      const dy = clamp(gesture.dy, -38, 38);
      const length = Math.hypot(dx, dy) || 1;
      const normalized = Math.min(length, 38) / 38;
      movement.x = (dx / length) * normalized;
      movement.y = (dy / length) * normalized;
      knob.x = dx;
      knob.y = dy;
      joystick.setValue({ x: dx, y: dy });
      if (Math.abs(dx) > 3) setFacing(dx < 0 ? 'left' : 'right');
    },
    onPanResponderRelease: stop,
    onPanResponderTerminate: stop,
  })).current;

  return <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
    <Animated.View pointerEvents="none" style={[styles.avatar, { left: 0, top: 0, transform: [{ translateX: position.x as any }, { translateY: position.y as any }, { translateX: -34 }, { translateY: -48 }, { scaleX: facing === 'left' ? -1 : 1 }] }]}>
      <PlayerAvatar />
    </Animated.View>
    <View style={styles.joystickWrap} {...responder.panHandlers}>
      <View style={styles.joystickBase}>
        <Animated.View style={[styles.joystickKnob, { transform: [{ translateX: joystick.x }, { translateY: joystick.y }] }]} />
      </View>
    </View>
  </View>;
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
  avatar: { position: 'absolute', width: 68, height: 76, zIndex: 24 },
  avatarSize: { width: 68, height: 76 },
  joystickWrap: { position: 'absolute', left: 18, bottom: 18, width: 92, height: 92, zIndex: 60, alignItems: 'center', justifyContent: 'center' },
  joystickBase: { width: 82, height: 82, borderRadius: 41, borderWidth: 1, borderColor: 'rgba(167,243,208,0.18)', backgroundColor: 'rgba(2,6,23,0.22)', alignItems: 'center', justifyContent: 'center' },
  joystickKnob: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(110,231,183,0.26)', borderWidth: 1, borderColor: 'rgba(167,243,208,0.45)' },
});
