import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, PanResponder, View } from 'react-native';
import { LivingWorldRuntime } from '../data/livingWorldRuntime';

/** World camera: manual exploration when idle, authored choreography during world scenarios. */
export function LivingWorldViewport({ children, runtime }: { children: ReactNode; runtime?: LivingWorldRuntime }) {
  const translate = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const current = useRef({ x: 0, y: 0, scale: 1 });
  const gesture = useRef({ mode: 'none' as 'none' | 'pan' | 'pinch', startDistance: 0, startScale: 1, lastX: 0, lastY: 0 }).current;
  const cinematicAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const setPan = (x: number, y: number) => { current.current.x = clamp(x, -900, 900); current.current.y = clamp(y, -900, 900); translate.setValue({ x: current.current.x, y: current.current.y }); };

  useEffect(() => {
    if (!runtime) return;
    let lastScenarioId: string | null = null;
    let cancelled = false;
    const playScenario = () => {
      const scenario = runtime.getActiveScenario();
      if (!scenario || scenario.id === lastScenarioId) return;
      lastScenarioId = scenario.id;
      cinematicAnimation.current?.stop();
      let shotIndex = 0;
      const playShot = () => {
        if (cancelled || runtime.getActiveScenario()?.id !== scenario.id || shotIndex >= scenario.shots.length) return;
        const shot = scenario.shots[shotIndex++];
        const target = cameraTarget(shot.focus, shot.motion);
        cinematicAnimation.current = Animated.parallel([
          Animated.timing(translate, { toValue: { x: target.x, y: target.y }, duration: shot.durationMs, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
          Animated.timing(scale, { toValue: target.scale, duration: shot.durationMs, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        ]);
        cinematicAnimation.current.start(({ finished }) => { if (finished) playShot(); });
      };
      playShot();
    };
    playScenario();
    const unsubscribe = runtime.events.subscribe(playScenario);
    return () => { cancelled = true; unsubscribe(); cinematicAnimation.current?.stop(); };
  }, [runtime, scale, translate]);

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (_, state) => !runtime?.isCinematicActive() && state.numberActiveTouches > 1,
    onMoveShouldSetPanResponder: (_, state) => !runtime?.isCinematicActive() && (state.numberActiveTouches > 1 || Math.abs(state.dx) > 8 || Math.abs(state.dy) > 8),
    onPanResponderGrant: (event) => { const touches = event.nativeEvent.touches; gesture.mode = touches.length > 1 ? 'pinch' : 'pan'; gesture.lastX = 0; gesture.lastY = 0; if (touches.length > 1) { gesture.startDistance = distance(touches[0], touches[1]); gesture.startScale = current.current.scale; } },
    onPanResponderMove: (event, state) => {
      if (runtime?.isCinematicActive()) return;
      const touches = event.nativeEvent.touches;
      if (touches.length > 1) { if (gesture.mode !== 'pinch') { gesture.mode = 'pinch'; gesture.startDistance = distance(touches[0], touches[1]); gesture.startScale = current.current.scale; } current.current.scale = clamp(gesture.startScale * distance(touches[0], touches[1]) / Math.max(gesture.startDistance, 1), 0.82, 2.2); scale.setValue(current.current.scale); return; }
      if (gesture.mode === 'pinch') { gesture.mode = 'pan'; gesture.lastX = state.dx; gesture.lastY = state.dy; return; }
      setPan(current.current.x + state.dx - gesture.lastX, current.current.y + state.dy - gesture.lastY); gesture.lastX = state.dx; gesture.lastY = state.dy;
    },
    onPanResponderRelease: () => { const target = current.current.scale < 0.95 ? 1 : current.current.scale; current.current.scale = target; Animated.spring(scale, { toValue: target, useNativeDriver: true, tension: 80, friction: 10 }).start(); gesture.mode = 'none'; },
    onPanResponderTerminationRequest: () => false,
  }), [gesture, runtime, scale, translate]);
  return <View className="absolute inset-0" {...responder.panHandlers}><Animated.View style={{ flex: 1, transform: [{ translateX: translate.x }, { translateY: translate.y }, { scale }] }}>{children}</Animated.View></View>;
}

function cameraTarget(focus: string, motion: string) {
  const targets: Record<string, { x: number; y: number; scale: number }> = {
    establishing: { x: 0, y: 0, scale: 1 },
    landmark: { x: -90, y: -55, scale: 1.16 },
    resident: { x: 75, y: 35, scale: 1.24 },
    transport: { x: 0, y: -85, scale: 1.2 },
    environment: { x: -55, y: 70, scale: 1.1 },
    departure: { x: 100, y: 0, scale: 1.12 },
  };
  const base = targets[focus] ?? targets.establishing;
  if (motion === 'orbit') return { ...base, x: base.x + 45, y: base.y - 25 };
  if (motion === 'push') return { ...base, scale: Math.min(1.35, base.scale + 0.08) };
  if (motion === 'follow') return { ...base, x: base.x + 30 };
  if (motion === 'reveal') return { ...base, y: base.y - 30 };
  return base;
}
function distance(a: { pageX: number; pageY: number }, b: { pageX: number; pageY: number }) { return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY); }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }