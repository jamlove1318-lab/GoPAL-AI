import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, PanResponder, View } from 'react-native';
import { LivingWorldRuntime } from '../data/livingWorldRuntime';
import { getLocationWorldObjects } from '../data/livingWorldObjectFactory';
import { resolveCinematicTarget } from '../data/livingWorldObjects';
import { resolveTravelCinematicPath } from '../data/livingWorldTravelCinematic';

/** World camera: manual exploration when idle, authored choreography during world scenarios. */
export function LivingWorldViewport({ children, runtime }: { children: ReactNode; runtime?: LivingWorldRuntime }) {
  const translate = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const current = useRef({ x: 0, y: 0, scale: 1 });
  const gesture = useRef({ mode: 'none' as 'none' | 'pan' | 'pinch', startDistance: 0, startScale: 1, lastX: 0, lastY: 0 }).current;
  const cinematicAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const setPan = (x: number, y: number) => { current.current.x = clamp(x, -900, 900); current.current.y = clamp(y, -900, 900); translate.setValue({ x: current.current.x, y: current.current.y }); };

  useEffect(() => {
    const translateListener = translate.addListener(({ value }) => {
      current.current.x = value.x;
      current.current.y = value.y;
    });
    const scaleListener = scale.addListener(({ value }) => {
      current.current.scale = value;
    });
    return () => {
      translate.removeListener(translateListener);
      scale.removeListener(scaleListener);
    };
  }, [scale, translate]);

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
      const locationId = scenario.locationId || runtime.getLocation().id;
      const location = runtime.getLocation();
      const objects = getLocationWorldObjects(locationId);
      const playShot = () => {
        if (cancelled || runtime.getActiveScenario()?.id !== scenario.id || shotIndex >= scenario.shots.length) return;
        const shot = scenario.shots[shotIndex++];
        if (scenario.kind === 'travel' && shot.id === 'journey') {
          const modeValue = scenario.metadata?.mode;
          const mode = modeValue === 'plane' || modeValue === 'magic' || modeValue === 'train' || modeValue === 'bus' || modeValue === 'car' || modeValue === 'walk' ? modeValue : 'train';
          const sourceLocationId = typeof scenario.metadata?.sourceLocationId === 'string' ? scenario.metadata.sourceLocationId : runtime.getLocation().id;
          const path = resolveTravelCinematicPath(sourceLocationId, mode);
          const segmentDuration = Math.max(120, Math.round(shot.durationMs / Math.max(1, path.length - 1)));
          const animations: Animated.CompositeAnimation[] = [];
          for (let index = 1; index < path.length; index += 1) {
            const point = path[index];
            const target = cameraTarget(point, 'transport', 'follow');
            animations.push(Animated.parallel([
              Animated.timing(translate, { toValue: { x: target.x, y: target.y }, duration: segmentDuration, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
              Animated.timing(scale, { toValue: target.scale, duration: segmentDuration, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
            ]));
          }
          cinematicAnimation.current = Animated.sequence(animations);
          cinematicAnimation.current.start(({ finished }) => { if (finished) playShot(); });
          return;
        }
        const resolved = resolveCinematicTarget(objects, shot.focus, location.cinematicAnchors);
        const target = cameraTarget(resolved, shot.focus, shot.motion);
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

function cameraTarget(target: { x: number; y: number; scale?: number }, focus: string, motion: string) {
  const normalizedX = clamp((50 - target.x) * 7.5, -900, 900);
  const normalizedY = clamp((50 - target.y) * 7.5, -900, 900);
  const base = { x: normalizedX, y: normalizedY, scale: target.scale ?? (focus === 'resident' || focus === 'transport' ? 1.2 : 1.08) };
  if (motion === 'orbit') return { ...base, x: base.x + 45, y: base.y - 25 };
  if (motion === 'push') return { ...base, scale: Math.min(1.4, base.scale + 0.08) };
  if (motion === 'follow') return { ...base, x: base.x + 30 };
  if (motion === 'reveal') return { ...base, y: base.y - 30 };
  return base;
}
function distance(a: { pageX: number; pageY: number }, b: { pageX: number; pageY: number }) { return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY); }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }