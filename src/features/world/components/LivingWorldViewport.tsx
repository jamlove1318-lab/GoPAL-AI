import React, { ReactNode, useMemo, useRef } from 'react';
import { Animated, PanResponder, View } from 'react-native';

/**
 * A lightweight world camera for the living world.
 * One finger pans the landscape. Two fingers pinch to zoom. The camera never
 * replaces the world with UI controls; it lets the learner physically explore it.
 */
export function LivingWorldViewport({ children }: { children: ReactNode }) {
  const translate = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const gesture = useRef({ mode: 'none' as 'none' | 'pan' | 'pinch', startDistance: 0, startScale: 1, lastX: 0, lastY: 0 }).current;

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (_, state) => state.numberActiveTouches > 0,
    onMoveShouldSetPanResponder: (_, state) => state.numberActiveTouches > 0 && (Math.abs(state.dx) > 2 || Math.abs(state.dy) > 2 || state.numberActiveTouches > 1),
    onPanResponderGrant: (event) => {
      const touches = event.nativeEvent.touches;
      gesture.mode = touches.length > 1 ? 'pinch' : 'pan';
      gesture.lastX = 0;
      gesture.lastY = 0;
      if (touches.length > 1) {
        gesture.startDistance = distance(touches[0], touches[1]);
        scale.stopAnimation((value) => { gesture.startScale = value; });
      }
    },
    onPanResponderMove: (event, state) => {
      const touches = event.nativeEvent.touches;
      if (touches.length > 1) {
        if (gesture.mode !== 'pinch') {
          gesture.mode = 'pinch';
          gesture.startDistance = distance(touches[0], touches[1]);
          scale.stopAnimation((value) => { gesture.startScale = value; });
        }
        const ratio = distance(touches[0], touches[1]) / Math.max(gesture.startDistance, 1);
        scale.setValue(clamp(gesture.startScale * ratio, 0.82, 2.2));
        return;
      }
      if (gesture.mode === 'pinch') { gesture.mode = 'pan'; gesture.lastX = state.dx; gesture.lastY = state.dy; return; }
      const dx = state.dx - gesture.lastX;
      const dy = state.dy - gesture.lastY;
      gesture.lastX = state.dx;
      gesture.lastY = state.dy;
      translate.setValue({ x: clampValue(translate.x, dx, -900, 900), y: clampValue(translate.y, dy, -900, 900) });
    },
    onPanResponderRelease: () => {
      scale.stopAnimation((value) => {
        const target = value < 0.95 ? 1 : value;
        Animated.spring(scale, { toValue: target, useNativeDriver: true, tension: 80, friction: 10 }).start();
      });
      gesture.mode = 'none';
    },
    onPanResponderTerminationRequest: () => false,
  }), [gesture, scale, translate]);

  return <View className="absolute inset-0" {...responder.panHandlers}>
    <Animated.View style={{ flex: 1, transform: [{ translateX: translate.x }, { translateY: translate.y }, { scale }] }}>
      {children}
    </Animated.View>
  </View>;
}

function distance(a: { pageX: number; pageY: number }, b: { pageX: number; pageY: number }) { return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY); }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
function clampValue(animated: Animated.Value, delta: number, min: number, max: number) {
  let current = 0;
  animated.stopAnimation((value) => { current = value; });
  return clamp(current + delta, min, max);
}
