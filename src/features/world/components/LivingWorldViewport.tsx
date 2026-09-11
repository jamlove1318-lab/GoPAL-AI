import React, { ReactNode, useMemo, useRef } from 'react';
import { Animated, PanResponder, View } from 'react-native';

/** A lightweight camera: drag empty landscape to pan, pinch to zoom. */
export function LivingWorldViewport({ children }: { children: ReactNode }) {
  const translate = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const current = useRef({ x: 0, y: 0, scale: 1 });
  const gesture = useRef({ mode: 'none' as 'none' | 'pan' | 'pinch', startDistance: 0, startScale: 1, lastX: 0, lastY: 0 }).current;
  const setPan = (x: number, y: number) => {
    current.current.x = clamp(x, -900, 900);
    current.current.y = clamp(y, -900, 900);
    translate.setValue({ x: current.current.x, y: current.current.y });
  };
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (_, state) => state.numberActiveTouches > 1,
    onMoveShouldSetPanResponder: (_, state) => state.numberActiveTouches > 1 || Math.abs(state.dx) > 8 || Math.abs(state.dy) > 8,
    onPanResponderGrant: (event) => {
      const touches = event.nativeEvent.touches;
      gesture.mode = touches.length > 1 ? 'pinch' : 'pan';
      gesture.lastX = 0;
      gesture.lastY = 0;
      if (touches.length > 1) {
        gesture.startDistance = distance(touches[0], touches[1]);
        gesture.startScale = current.current.scale;
      }
    },
    onPanResponderMove: (event, state) => {
      const touches = event.nativeEvent.touches;
      if (touches.length > 1) {
        if (gesture.mode !== 'pinch') {
          gesture.mode = 'pinch';
          gesture.startDistance = distance(touches[0], touches[1]);
          gesture.startScale = current.current.scale;
        }
        current.current.scale = clamp(gesture.startScale * distance(touches[0], touches[1]) / Math.max(gesture.startDistance, 1), 0.82, 2.2);
        scale.setValue(current.current.scale);
        return;
      }
      if (gesture.mode === 'pinch') {
        gesture.mode = 'pan';
        gesture.lastX = state.dx;
        gesture.lastY = state.dy;
        return;
      }
      setPan(current.current.x + state.dx - gesture.lastX, current.current.y + state.dy - gesture.lastY);
      gesture.lastX = state.dx;
      gesture.lastY = state.dy;
    },
    onPanResponderRelease: (_, state) => {
      const target = current.current.scale < 0.95 ? 1 : current.current.scale;
      current.current.scale = target;
      Animated.parallel([
        Animated.spring(scale, { toValue: target, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.spring(translate, {
          toValue: { x: current.current.x + clamp(state.vx * 18, -70, 70), y: current.current.y + clamp(state.vy * 18, -70, 70) },
          useNativeDriver: true,
          tension: 70,
          friction: 11,
          isInteraction: false,
        }),
      ]).start(({ finished }) => {
        if (!finished) return;
        const settledX = clamp(current.current.x + clamp(state.vx * 18, -70, 70), -900, 900);
        const settledY = clamp(current.current.y + clamp(state.vy * 18, -70, 70), -900, 900);
        current.current.x = settledX;
        current.current.y = settledY;
        translate.setValue({ x: settledX, y: settledY });
      });
      gesture.mode = 'none';
    },
    onPanResponderTerminationRequest: () => false,
  }), [gesture, scale, translate]);
  const depthScale = translate.y.interpolate({ inputRange: [-900, 0, 900], outputRange: [1.018, 1, 0.982], extrapolate: 'clamp' });
  const combinedScale = Animated.multiply(scale, depthScale);
  return <View className="absolute inset-0" {...responder.panHandlers}><Animated.View style={{ flex: 1, transform: [{ translateX: translate.x }, { translateY: translate.y }, { scale: combinedScale }] }}>{children}</Animated.View></View>;
}
function distance(a: { pageX: number; pageY: number }, b: { pageX: number; pageY: number }) { return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY); }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
