import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { LivingActorMotion } from './LivingWorldActors';

export type LivingWorldActorPath = { x: number; y: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function LivingWorldActorMotion({
  path,
  motion = 'walking',
  speed = 1,
  children,
}: {
  path: LivingWorldActorPath[];
  motion?: LivingActorMotion;
  speed?: number;
  children: ReactNode;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const safePath = useMemo(
    () => (path.length > 1 ? path : path.length ? [path[0], path[0]] : [{ x: 0, y: 0 }, { x: 0, y: 0 }]),
    [path],
  );
  const safeSpeed = clamp(speed, 0.35, 3);
  const duration = Math.max(1800, Math.round(9000 / safeSpeed));
  const bobAmount = motion === 'walking' ? 2.5 : motion === 'celebrating' ? 5 : motion === 'talking' ? 1.5 : 0.75;
  const scaleAmount = motion === 'celebrating' ? 1.035 : motion === 'talking' ? 1.01 : 1;

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: safePath.length - 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [duration, progress, safePath.length]);

  const inputRange = safePath.map((_, index) => index);
  const translateX = progress.interpolate({ inputRange, outputRange: safePath.map(point => point.x) });
  const translateY = progress.interpolate({ inputRange, outputRange: safePath.map(point => point.y) });
  const bob = progress.interpolate({ inputRange, outputRange: safePath.map((_, index) => (index % 2 ? -bobAmount : 0)) });
  const scale = progress.interpolate({ inputRange, outputRange: safePath.map(() => scaleAmount) });

  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: [{ translateX }, { translateY }, { translateY: bob }, { scale }] }}>
      <View style={{ position: 'absolute', transform: [{ translateX: '-50%' }, { translateY: '-50%' }] }}>{children}</View>
    </Animated.View>
  );
}
