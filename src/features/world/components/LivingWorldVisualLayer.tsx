import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import type { WorldTheme } from '../data/livingWorldArt';
import { WORLD_PALETTES } from '../data/livingWorldArt';

/**
 * Emerald Valley's visual foundation.
 *
 * This layer is deliberately 2.5D: the sky, mountain depth, treeline and
 * atmospheric planes establish a large valley before foreground buildings
 * and characters are rendered. It is not a collection of random decorative
 * shapes; every layer exists to establish distance and orientation.
 */
export function LivingWorldVisualLayer({ theme = 'emerald', time = 'afternoon' }: { theme?: WorldTheme; time?: 'morning' | 'afternoon' | 'evening' | 'night' }) {
  const cloudMotion = useRef(new Animated.Value(0)).current;
  const mistMotion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cloudLoop = Animated.loop(Animated.sequence([
      Animated.timing(cloudMotion, { toValue: 1, duration: 42000, easing: Easing.linear, useNativeDriver: true, isInteraction: false }),
      Animated.timing(cloudMotion, { toValue: 0, duration: 42000, easing: Easing.linear, useNativeDriver: true, isInteraction: false }),
    ]));
    const mistLoop = Animated.loop(Animated.sequence([
      Animated.timing(mistMotion, { toValue: 1, duration: 18000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(mistMotion, { toValue: 0, duration: 18000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    cloudLoop.start();
    mistLoop.start();
    return () => {
      cloudLoop.stop();
      mistLoop.stop();
    };
  }, [cloudMotion, mistMotion]);

  if (theme !== 'emerald') return <GenericWorldVisualLayer theme={theme} time={time} />;

  const night = time === 'night';
  const evening = time === 'evening';
  const morning = time === 'morning';

  const skyTop = night ? '#0b1830' : evening ? '#38405b' : morning ? '#7aa8ad' : '#5f8794';
  const skyMid = night ? '#263653' : evening ? '#9a7771' : morning ? '#a9c6c4' : '#b7d1cb';
  const horizon = night ? '#30485a' : evening ? '#d09a79' : '#d4ddd2';
  const farMountain = night ? '#182c36' : '#46605a';
  const midMountain = night ? '#1d383c' : '#567067';
  const nearRidge = night ? '#18312d' : '#35544a';
  const ground = night ? '#10251f' : evening ? '#30463b' : '#355d4b';
  const stream = night ? '#142e3b' : '#285d61';
  const warm = evening || morning ? '#e8b879' : '#f2d58a';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="emeraldSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={skyTop} />
            <Stop offset="0.55" stopColor={skyMid} />
            <Stop offset="1" stopColor={horizon} />
          </LinearGradient>
          <LinearGradient id="valleyGround" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={ground} />
            <Stop offset="1" stopColor={night ? '#0a1915' : '#213d32'} />
          </LinearGradient>
          <LinearGradient id="mountainFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={farMountain} stopOpacity="0.72" />
            <Stop offset="1" stopColor={farMountain} stopOpacity="0.96" />
          </LinearGradient>
        </Defs>

        {/* Sky: intentionally fills the entire upper field. */}
        <Rect width="400" height="800" fill="url(#emeraldSky)" />

        {/* Distant atmospheric haze. */}
        <Path d="M0 300 Q90 260 175 292 T400 278 L400 385 L0 385 Z" fill="#dce6dc" opacity={night ? 0.035 : 0.15} />

        {/* Mount Emerald — farthest silhouette. */}
        <Path
          d="M0 330 L0 248 L34 218 L58 232 L91 166 L119 210 L147 142 L176 201 L205 116 L234 194 L265 150 L293 213 L327 176 L352 224 L380 190 L400 220 L400 330 Z"
          fill="url(#mountainFade)"
        />
        <Path
          d="M0 276 L38 245 L62 256 L92 206 L119 238 L147 180 L175 232 L205 153 L232 225 L265 190 L293 245 L326 211 L352 251 L380 222 L400 242"
          fill="none"
          stroke={night ? '#3d5860' : '#73877e'}
          strokeWidth="3"
          opacity={night ? 0.25 : 0.38}
        />

        {/* Middle mountain wall: makes the valley feel enclosed. */}
        <Path d="M0 370 L0 282 L48 246 L93 300 L128 238 L170 300 L214 248 L255 302 L300 242 L344 298 L400 256 L400 370 Z" fill={midMountain} opacity={night ? 0.88 : 0.82} />

        {/* Sugi treeline — intentionally irregular, not a grid. */}
        <G opacity={night ? 0.96 : 0.94}>
          {[
            [8, 296, 1.15], [26, 315, 0.86], [45, 285, 1.05], [64, 306, 0.78],
            [84, 290, 1.12], [106, 315, 0.92], [129, 294, 1.22], [151, 313, 0.82],
            [175, 286, 1.0], [197, 310, 0.88], [220, 292, 1.18], [244, 316, 0.82],
            [267, 286, 1.04], [289, 306, 0.9], [312, 281, 1.16], [335, 309, 0.86],
            [359, 291, 1.08], [385, 305, 0.92],
          ].map(([x, y, s], i) => (
            <G key={`cedar-${i}`} transform={`translate(${x} ${y}) scale(${s})`}>
              <Path d="M0 52 L-17 88 H17 Z" fill={nearRidge} />
              <Path d="M0 27 L-13 61 H13 Z" fill={nearRidge} />
              <Path d="M0 4 L-9 37 H9 Z" fill={nearRidge} />
              <Rect x="-2" y="72" width="4" height="22" fill="#20372f" />
            </G>
          ))}
        </G>

        {/* Valley floor — starts below the distant ridge, leaving real depth. */}
        <Path d="M0 342 Q55 316 110 348 Q165 379 216 342 Q275 310 328 350 Q365 373 400 344 V800 H0 Z" fill="url(#valleyGround)" />

        {/* Distant settlement silhouettes. */}
        <G opacity={night ? 0.58 : 0.42}>
          <Path d="M46 392 L62 378 L78 392 V422 H46 Z" fill="#263f38" />
          <Path d="M91 408 L108 390 L125 408 V435 H91 Z" fill="#29433b" />
          <Path d="M285 400 L303 382 L322 400 V428 H285 Z" fill="#29433b" />
          <Path d="M333 414 L349 398 L365 414 V438 H333 Z" fill="#263f38" />
          {night && <><Circle cx="61" cy="398" r="2" fill={warm}/><Circle cx="114" cy="410" r="2" fill={warm}/><Circle cx="310" cy="403" r="2" fill={warm}/><Circle cx="357" cy="416" r="2" fill={warm}/></>}
        </G>

        {/* Valley paths. */}
        <Path d="M-20 700 Q85 608 166 555 Q237 507 300 431" fill="none" stroke="#a58d6c" strokeWidth="30" opacity="0.5" strokeLinecap="round" />
        <Path d="M86 820 Q106 686 158 584 Q184 526 196 425" fill="none" stroke="#8c765c" strokeWidth="18" opacity="0.48" strokeLinecap="round" />
        <Path d="M370 790 Q320 674 292 593 Q270 522 285 421" fill="none" stroke="#8e785f" strokeWidth="15" opacity="0.38" strokeLinecap="round" />

        {/* Suzu Stream — a clear geographic spine. */}
        <Path d="M224 800 C205 742 230 687 216 635 C201 580 165 550 184 502 C203 455 244 446 225 390" fill="none" stroke="#183d3e" strokeWidth="34" opacity="0.5" strokeLinecap="round" />
        <Path d="M224 800 C205 742 230 687 216 635 C201 580 165 550 184 502 C203 455 244 446 225 390" fill="none" stroke={stream} strokeWidth="25" opacity="0.96" strokeLinecap="round" />
        <Path d="M218 798 C205 742 222 687 210 638 C197 584 174 548 191 507 C205 471 231 454 220 406" fill="none" stroke="#75b9b0" strokeWidth="2.2" opacity={night ? 0.2 : 0.5} strokeLinecap="round" strokeDasharray="11 13" />

        {/* Stone arch bridge crossing the stream. */}
        <Path d="M154 540 Q205 516 250 539 L247 557 Q202 538 158 558 Z" fill="#7c7569" />
        <Path d="M171 550 Q202 532 233 550" fill="none" stroke="#3f4b45" strokeWidth="6" />
        <Path d="M157 558 Q205 538 248 557" fill="none" stroke="#b1a58e" strokeWidth="3" />

        {/* Foreground foliage framing. */}
        <G opacity={night ? 0.62 : 0.78}>
          <Path d="M0 700 Q45 655 78 706 T142 710 V800 H0 Z" fill="#1b342b" />
          <Path d="M400 680 Q362 644 330 698 T268 716 V800 H400 Z" fill="#193129" />
        </G>

        {/* Subtle grass clusters. */}
        {Array.from({ length: 42 }, (_, i) => {
          const x = (i * 83 + 17) % 400;
          const y = 430 + ((i * 47) % 330);
          return <Path key={`grass-${i}`} d={`M${x} ${y + 8}l-4 -9M${x} ${y + 8}l4 -9M${x} ${y + 8}l0 -11`} stroke={night ? '#507064' : '#7e9b73'} strokeWidth="1.6" opacity={0.28} strokeLinecap="round" />;
        })}
      </Svg>

      {/* Slow cloud drift: 2.5D atmosphere, not expensive geometry. */}
      <Animated.View
        pointerEvents="none"
        style={{ transform: [{ translateX: cloudMotion.interpolate({ inputRange: [0, 1], outputRange: [-70, 80] }) }] }}
      >
        <Svg width="520" height="190" viewBox="0 0 520 190" style={styles.clouds}>
          <G opacity={night ? 0.11 : evening ? 0.17 : 0.22}>
            <Ellipse cx="105" cy="85" rx="82" ry="24" fill="#f2f0e5" />
            <Ellipse cx="170" cy="70" rx="62" ry="30" fill="#f2f0e5" />
            <Ellipse cx="245" cy="86" rx="95" ry="26" fill="#f2f0e5" />
            <Ellipse cx="390" cy="52" rx="68" ry="22" fill="#f2f0e5" />
            <Ellipse cx="455" cy="66" rx="52" ry="18" fill="#f2f0e5" />
          </G>
        </Svg>
      </Animated.View>

      {/* Moving valley mist is deliberately subtle. */}
      <Animated.View
        pointerEvents="none"
        style={{ opacity: mistMotion.interpolate({ inputRange: [0, 1], outputRange: [0.10, 0.20] }), transform: [{ translateX: mistMotion.interpolate({ inputRange: [0, 1], outputRange: [-16, 16] }) }] }}
      >
        <View style={styles.mist} />
      </Animated.View>
    </View>
  );
}

function GenericWorldVisualLayer({ theme, time }: { theme: WorldTheme; time: 'morning' | 'afternoon' | 'evening' | 'night' }) {
  const palette = WORLD_PALETTES[theme];
  const night = time === 'night';
  const evening = time === 'evening';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="none">
        <Path d="M0 0H400V800H0Z" fill={palette.groundDark} opacity={night ? .16 : evening ? .07 : .025} />
        <Path d="M0 610Q85 565 160 612T315 600T400 615V800H0Z" fill={palette.groundDark} opacity=".22" />
        <Path d="M0 665Q80 620 145 667T275 656T400 675" fill="none" stroke={palette.accent} strokeWidth="26" opacity=".16" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  clouds: { position: 'absolute', top: 34, left: -40 },
  mist: { position: 'absolute', top: 310, left: -80, width: 560, height: 80, borderRadius: 80, backgroundColor: '#e6eee5' },
});
