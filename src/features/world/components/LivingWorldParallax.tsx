import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

export function LivingWorldParallax({ children, depth = 0.5, drift = 0 }: { children?: ReactNode; depth?: number; drift?: number }) {
  const motion = useRef(new Animated.Value(0)).current;
  const amount = Math.max(-1, Math.min(1, depth)) * 10;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 7000 + Math.abs(depth) * 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(motion, { toValue: 0, duration: 7000 + Math.abs(depth) * 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [motion, depth]);
  const translateX = motion.interpolate({ inputRange: [0, 1], outputRange: [drift - amount, drift + amount] });
  const translateY = motion.interpolate({ inputRange: [0, 1], outputRange: [depth * 1.5, -depth * 1.5] });
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', inset: 0, transform: [{ translateX }, { translateY }] }}>{children}</Animated.View>;
}

export function LivingWorldDepthBand({ children, depth = 0.5, opacity = 1 }: { children?: ReactNode; depth?: number; opacity?: number }) {
  return <View pointerEvents="none" style={{ position: 'absolute', inset: 0, opacity, zIndex: Math.round(depth * 10) }}>{children}</View>;
}
