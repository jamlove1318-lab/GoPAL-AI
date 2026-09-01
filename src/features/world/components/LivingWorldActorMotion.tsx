import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { LivingActorMotion } from './LivingWorldActors';

export type LivingWorldActorPath = {
  x: number;
  y: number;
};

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
  const safePath = path.length > 1 ? path : [{ x: 50, y: 50 }, ...(path.length ? path : [{ x: 50, y: 50 }])];
  const duration = Math.max(1800, Math.round(9000 / Math.max(0.35, speed)));

  useEffect(() => {
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
  const translateX = progress.interpolate({
    inputRange,
    outputRange: safePath.map(point => `${point.x}%`),
  });
  const translateY = progress.interpolate({
    inputRange,
    outputRange: safePath.map(point => `${point.y}%`),
  });
  const bob = progress.interpolate({
    inputRange,
    outputRange: safePath.map((_, index) => index % 2 ? -2.5 : 0),
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        transform: [{ translateX }, { translateY }, { translateY: bob }],
      }}
    >
      <View style={{ position: 'absolute', transform: [{ translateX: '-50%' }, { translateY: '-50%' }] }}>
        {children}
      </View>
    </Animated.View>
  );
}
