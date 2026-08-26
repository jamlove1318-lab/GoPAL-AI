import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';

const LINES = [
  'I kept the kettle warm for you.',
  'The valley missed your footsteps.',
  'Whenever you’re ready, I’m here.',
  'Look — the study bonsai grew a little.',
  'A small wonder happened while you were away.',
  'Your words are starting to sound like home.',
];

// Cassidy — a living, breathing presence that follows you through the app.
// Uses core RN Animated (no worklets) so it can never crash the bundle.
export function LivingCompanion({ onTap }: { onTap?: () => void }) {
  const breathe = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const [line, setLine] = useState(LINES[0]);
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    const breatheAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 3400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    breatheAnim.start();
    floatAnim.start();

    const id = setInterval(() => {
      setShowBubble(false);
      const t = setTimeout(() => {
        setLine(LINES[Math.floor(Math.random() * LINES.length)]);
        setShowBubble(true);
      }, 450);
      // store timeout for cleanup
      (id as unknown as { _t?: ReturnType<typeof setTimeout> })._t = t;
    }, 7000);

    return () => {
      breatheAnim.stop();
      floatAnim.stop();
      clearInterval(id);
    };
  }, [breathe, float]);

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] });
  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const glow = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.65] });

  return (
    <View className="absolute bottom-[96px] right-4 z-50 items-end" pointerEvents="box-none">
      <Animated.View
        style={{ opacity: showBubble ? 1 : 0, transform: [{ translateY: showBubble ? 0 : 6 }] }}
        className="mb-2 max-w-[210px]"
      >
        <View className="rounded-2xl rounded-br-sm border border-emerald-500/30 bg-emerald-900/80 px-3 py-2">
          <Text className="text-[11px] italic text-emerald-100">{line}</Text>
        </View>
      </Animated.View>

      <Pressable onPress={onTap} className="active:opacity-80">
        <Animated.View style={{ transform: [{ scale }, { translateY }] }}>
          <Animated.View
            style={{ opacity: glow }}
            className="absolute -inset-3 rounded-full bg-emerald-400/40"
          />
          <View className="h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40">
            <Text className="text-2xl">🌿</Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}
