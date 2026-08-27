import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, Easing, useWindowDimensions } from 'react-native';

type AtmosphereProps = {
  intensity?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: string;
  season?: string;
};

type Particle = { x: number; y: number; size: number; duration: number; delay: number; drift: number };

// Subtle living atmosphere. Motion is intentional and restrained: the world
// should breathe, not compete with the learner. Core RN Animated keeps this
// reliable across native and web builds.
export function AmbientBackground({
  intensity = 0.5,
  timeOfDay = 'morning',
  weather = 'clear',
  season = 'spring',
}: AtmosphereProps) {
  const { width } = useWindowDimensions();
  const safeIntensity = Math.max(0, Math.min(1, intensity));
  const glowA = useRef(new Animated.Value(0)).current;
  const glowB = useRef(new Animated.Value(0)).current;
  const glowC = useRef(new Animated.Value(0)).current;
  const life = useRef(new Animated.Value(0)).current;
  const particles = useMemo<Particle[]>(() => [
    { x: 8, y: 18, size: 3, duration: 5200, delay: 0, drift: 22 },
    { x: 17, y: 42, size: 2, duration: 6900, delay: 700, drift: -18 },
    { x: 29, y: 24, size: 2, duration: 6100, delay: 1300, drift: 16 },
    { x: 41, y: 61, size: 3, duration: 7400, delay: 400, drift: -24 },
    { x: 53, y: 31, size: 2, duration: 5700, delay: 1900, drift: 20 },
    { x: 64, y: 76, size: 3, duration: 8100, delay: 900, drift: -16 },
    { x: 76, y: 21, size: 2, duration: 6300, delay: 1600, drift: 24 },
    { x: 88, y: 48, size: 3, duration: 7200, delay: 500, drift: -20 },
    { x: 94, y: 72, size: 2, duration: 5900, delay: 2200, drift: 18 },
    { x: 22, y: 84, size: 2, duration: 7700, delay: 1100, drift: -14 },
    { x: 48, y: 12, size: 2, duration: 6600, delay: 2500, drift: 12 },
    { x: 70, y: 55, size: 2, duration: 7000, delay: 300, drift: -15 },
  ], []);
  const particleValues = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loop = (value: Animated.Value, duration: number, delay = 0) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const animations = [
      loop(glowA, 16000), loop(glowB, 21000, 900), loop(glowC, 19000, 1700), loop(life, 11000, 500),
      ...particleValues.map((value, i) => loop(value, particles[i].duration, particles[i].delay)),
    ];
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [glowA, glowB, glowC, life, particleValues, particles]);

  const aX = glowA.interpolate({ inputRange: [0, 1], outputRange: [-40, 40] });
  const aY = glowA.interpolate({ inputRange: [0, 1], outputRange: [-30, 50] });
  const bX = glowB.interpolate({ inputRange: [0, 1], outputRange: [40, -30] });
  const bY = glowB.interpolate({ inputRange: [0, 1], outputRange: [20, -40] });
  const cX = glowC.interpolate({ inputRange: [0, 1], outputRange: [-20, 30] });
  const cY = glowC.interpolate({ inputRange: [0, 1], outputRange: [30, -20] });
  const isNight = timeOfDay === 'night';
  const isRain = /rain|storm|drizzle/i.test(weather);
  const isWinter = /winter/i.test(season);
  const isAutumn = /autumn|fall/i.test(season);
  const particleOpacity = safeIntensity * (isNight ? 0.62 : 0.34);

  return (
    <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
      <Animated.View style={{ transform: [{ translateX: aX }, { translateY: aY }], opacity: safeIntensity * 0.9 }} className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-emerald-700/20" />
      <Animated.View style={{ transform: [{ translateX: bX }, { translateY: bY }], opacity: safeIntensity * 0.7 }} className="absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-indigo-700/15" />
      <Animated.View style={{ transform: [{ translateX: cX }, { translateY: cY }], opacity: safeIntensity * 0.55 }} className="absolute bottom-[-120px] left-1/3 h-80 w-80 rounded-full bg-teal-700/10" />
      <Animated.View
        style={{
          opacity: life.interpolate({ inputRange: [0, 1], outputRange: [0.02, 0.075] }),
          transform: [{ translateX: life.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.15, width * 0.15] }) }],
        }}
        className="absolute -left-1/4 top-1/4 h-72 w-3/4 rounded-full bg-white/10"
      />

      {particles.map((particle, i) => {
        const value = particleValues[i];
        const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [0, -particle.drift] });
        const translateX = value.interpolate({ inputRange: [0, 1], outputRange: [0, particle.drift * 0.45] });
        const opacity = value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [particleOpacity * 0.25, particleOpacity, particleOpacity * 0.2] });
        const tint = isNight ? 'bg-emerald-200' : isWinter ? 'bg-sky-100' : isAutumn ? 'bg-amber-200' : 'bg-emerald-100';
        return (
          <Animated.View
            key={`mote-${i}`}
            style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size, opacity, transform: [{ translateX }, { translateY }] }}
            className={`absolute rounded-full ${tint}`}
          />
        );
      })}

      {isRain && [0, 1, 2, 3, 4, 5].map((i) => (
        <Animated.View
          key={`rain-${i}`}
          style={{
            left: `${12 + i * 15}%`, top: `${12 + (i % 3) * 17}%`, opacity: safeIntensity * 0.14,
            transform: [{ rotate: '18deg' }, { translateY: life.interpolate({ inputRange: [0, 1], outputRange: [-20, 120] }) }],
          }}
          className="absolute h-16 w-px bg-sky-200"
        />
      ))}
    </View>
  );
}
