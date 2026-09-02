import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import type { WorldTheme } from '../data/livingWorldArt';
import { WORLD_PALETTES } from '../data/livingWorldArt';

export function LivingWorldVisualLayer({ theme='emerald', time='afternoon' }: { theme?: WorldTheme; time?: 'morning'|'afternoon'|'evening'|'night' }) {
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(motion, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [motion]);
  const palette = WORLD_PALETTES[theme];
  const night = time === 'night';
  const evening = time === 'evening';
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="none">
      <Path d="M0 0H400V800H0Z" fill={palette.groundDark} opacity={night ? .16 : evening ? .07 : .025} />
      <Path d="M0 610Q85 565 160 612T315 600T400 615V800H0Z" fill={palette.groundDark} opacity=".22" />
      <Path d="M0 665Q80 620 145 667T275 656T400 675" fill="none" stroke={palette.accent} strokeWidth="26" opacity=".16" strokeLinecap="round" />
      {Array.from({ length: 24 }, (_, index) => {
        const x = (index * 47 + 13) % 400;
        const y = 120 + ((index * 71) % 560);
        return <Path key={`grass-${index}`} d={`M${x} ${y+7}l-3 -7M${x} ${y+7}l3 -7`} stroke={palette.accent} strokeWidth="2" opacity={night ? .12 : .25} strokeLinecap="round" />;
      })}
      <Ellipse cx="52" cy="690" rx="62" ry="18" fill="#101b16" opacity=".12" />
      <Ellipse cx="350" cy="520" rx="72" ry="16" fill="#101b16" opacity=".10" />
      {theme === 'mountain' && <><Polygon points="0,300 72,175 145,300" fill="#4c625a" opacity=".25"/><Polygon points="265,290 335,155 400,290" fill="#40554f" opacity=".22"/></>}
      {theme === 'coastal' && <Path d="M0 735Q50 710 100 735T200 735T300 735T400 735V800H0Z" fill="#9bb6a7" opacity=".25"/>}
      {theme === 'festival' && <><Circle cx="48" cy="118" r="4" fill="#f3d27a" opacity=".5"/><Circle cx="352" cy="142" r="5" fill="#f3d27a" opacity=".42"/></>}
      {theme === 'sakura' && <><Circle cx="70" cy="150" r="5" fill="#e9aebc" opacity=".35"/><Circle cx="330" cy="235" r="4" fill="#e9aebc" opacity=".35"/></>}
      {theme === 'scifi' && <Rect x="22" y="22" width="356" height="756" rx="28" fill="none" stroke="#8de4e8" strokeWidth="1" opacity=".06"/>}
    </Svg>
    <Animated.View style={{ transform: [{ translateX: motion.interpolate({ inputRange:[0,1], outputRange:[-45,45] }) }] }} className="absolute left-[-15%] top-[54%] h-20 w-[130%] rounded-full bg-white/5" />
  </View>;
}
