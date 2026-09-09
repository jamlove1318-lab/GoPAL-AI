import React, { useEffect, useRef } from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Line,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { Animated, Easing } from 'react-native';
import { CassidyAction, CassidyMood } from '../characters/cassidy';

const AnimatedG = Animated.createAnimatedComponent(G);

// Canonical Cassidy palette — intentionally derived from the locked reference.
const SKIN = '#F1C7A5';
const SKIN_LIGHT = '#FFDCC0';
const SKIN_SHADE = '#DFA883';
const HAIR = '#4A2D21';
const HAIR_DARK = '#321E18';
const HAIR_HI = '#704532';
const EMERALD = '#087F5B';
const EMERALD_DARK = '#075B45';
const EMERALD_LIGHT = '#18A77D';
const CREAM = '#FFF4DF';
const CREAM_SHADE = '#E9D8BD';
const LEATHER = '#70462E';
const LEATHER_DARK = '#4C2C1F';
const TROUSER = '#4A514F';
const BOOT = '#5A3726';
const GOLD = '#D9A441';
const GOLD_LIGHT = '#FFE39A';
const TEAL = '#36C7C0';
const CORAL = '#E9897A';
const EYE = '#2A211C';

interface Props {
  height?: number;
  action?: CassidyAction;
  speaking?: boolean;
  expression?: CassidyMood;
}

/**
 * Polished interim 2D Cassidy.
 *
 * This is deliberately a temporary visual bridge for completing the app.
 * It follows the canonical reference's identity anchors (dark warm eyes,
 * chocolate side-braid hair, Emerald Valley explorer outfit and luminous
 * Leaf-Star Compass charm) without replacing the future artist-authored pack.
 *
 * The approved Gemini Cassidy video remains a separate production asset and
 * is still preferred by Cassidy2DProductionRenderer when mapped.
 */
export function CassidyCharacter({
  height = 150,
  action = 'idle',
  speaking = false,
  expression = 'warm',
}: Props) {
  const breathe = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const hairSway = useRef(new Animated.Value(0)).current;
  const mouth = useRef(new Animated.Value(0.15)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const walk = useRef(new Animated.Value(0)).current;
  const charmPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (value: Animated.Value, duration: number, toValue = 1) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );

    const animations = [
      loop(breathe, 2400),
      loop(bob, 3200),
      loop(hairSway, 4200),
      loop(charmPulse, 1300),
      Animated.loop(
        Animated.sequence([
          Animated.delay(2600),
          Animated.timing(blink, { toValue: 0.08, duration: 75, useNativeDriver: true }),
          Animated.timing(blink, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]),
      ),
    ];

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [blink, bob, breathe, charmPulse, hairSway]);

  useEffect(() => {
    const animation = speaking
      ? Animated.loop(
          Animated.sequence([
            Animated.timing(mouth, { toValue: 1, duration: 150, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(mouth, { toValue: 0.15, duration: 150, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
        )
      : Animated.timing(mouth, { toValue: 0.15, duration: 180, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [mouth, speaking]);

  useEffect(() => {
    const animation =
      action === 'waving'
        ? Animated.loop(
            Animated.sequence([
              Animated.timing(wave, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              Animated.timing(wave, { toValue: -1, duration: 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ]),
          )
        : action === 'walking'
          ? Animated.loop(
              Animated.sequence([
                Animated.timing(walk, { toValue: 1, duration: 420, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(walk, { toValue: -1, duration: 420, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              ]),
            )
          : null;

    animation?.start();
    return () => {
      animation?.stop();
      Animated.timing(wave, { toValue: 0, duration: 180, useNativeDriver: true }).start();
      Animated.timing(walk, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    };
  }, [action, walk, wave]);

  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [-2.5, 2.5] });
  const bodyScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.018] });
  const hairDeg = hairSway.interpolate({ inputRange: [0, 1], outputRange: [-1.8, 1.8] });
  const waveDeg = wave.interpolate({ inputRange: [-1, 1], outputRange: [-12, 18] });
  const legLeftDeg = walk.interpolate({ inputRange: [-1, 1], outputRange: [10, -10] });
  const legRightDeg = walk.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] });
  const charmScale = charmPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.09] });
  const mouthScale = mouth.interpolate({ inputRange: [0.15, 1], outputRange: [0.7, 1.45] });
  const width = (height * 220) / 380;

  const browLift = expression === 'thinking' || expression === 'curious' || expression === 'surprised';
  const smile = expression === 'happy' || expression === 'excited' || expression === 'gentle' || expression === 'warm';
  const concerned = expression === 'concerned';

  return (
    <Svg width={width} height={height} viewBox="0 0 220 380" accessibilityLabel="Cassidy">
      <Defs>
        <LinearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={HAIR_HI} />
          <Stop offset="0.45" stopColor={HAIR} />
          <Stop offset="1" stopColor={HAIR_DARK} />
        </LinearGradient>
        <LinearGradient id="vest" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={EMERALD_LIGHT} />
          <Stop offset="0.48" stopColor={EMERALD} />
          <Stop offset="1" stopColor={EMERALD_DARK} />
        </LinearGradient>
        <LinearGradient id="cream" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFDF5" />
          <Stop offset="1" stopColor={CREAM} />
        </LinearGradient>
        <LinearGradient id="leather" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#95613E" />
          <Stop offset="1" stopColor={LEATHER_DARK} />
        </LinearGradient>
        <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={GOLD_LIGHT} />
          <Stop offset="0.5" stopColor={GOLD} />
          <Stop offset="1" stopColor="#A66C20" />
        </LinearGradient>
      </Defs>

      <AnimatedG transform={[{ translateY: bobY }]}>
        {/* Back hair silhouette and long side braid */}
        <AnimatedG transform={[{ translateX: 108 }, { rotate: hairDeg }, { translateX: -108 }]}>
          <Path
            d="M51 92 C47 47 70 25 108 25 C147 25 170 49 166 94 C163 119 155 135 151 148 L62 148 C56 130 53 112 51 92Z"
            fill="url(#hair)"
          />
          <Path d="M151 92 C177 112 180 143 165 164 C153 181 157 205 146 221 C137 234 118 225 124 210 C130 195 147 187 145 168 C143 151 155 137 151 119Z" fill="url(#hair)" />
          <Circle cx={151} cy={221} r={10} fill={HAIR_DARK} />
          <Circle cx={151} cy={238} r={9} fill={HAIR} />
          <Circle cx={147} cy={254} r={8} fill={HAIR_DARK} />
          <Path d="M143 264 Q151 271 159 264" fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
        </AnimatedG>

        {/* Hood behind head */}
        <Path d="M61 105 Q58 55 108 43 Q158 55 159 105 L146 124 L70 124Z" fill={EMERALD_DARK} opacity={0.95} />
        <Path d="M65 102 Q67 60 108 50 Q149 60 155 102" fill="none" stroke={GOLD} strokeWidth={2.5} opacity={0.55} />

        {/* Face */}
        <Path d="M72 65 Q108 39 145 65 L148 101 Q144 137 109 151 Q74 137 71 101Z" fill={SKIN_LIGHT} />
        <Path d="M72 104 Q78 132 108 145 Q139 132 148 103 Q143 136 109 151 Q75 137 72 104Z" fill={SKIN_SHADE} opacity={0.55} />

        {/* Front hair framing the face */}
        <Path d="M65 83 Q58 52 89 36 Q120 20 151 43 Q169 58 157 91 Q147 74 135 67 Q122 57 106 60 Q84 61 65 83Z" fill="url(#hair)" />
        <Path d="M69 76 Q66 52 93 39 Q117 28 142 43" fill="none" stroke={HAIR_HI} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        <Path d="M75 75 Q66 94 73 111" fill="none" stroke={HAIR_DARK} strokeWidth={10} strokeLinecap="round" />
        <Path d="M145 72 Q155 92 148 112" fill="none" stroke={HAIR_DARK} strokeWidth={10} strokeLinecap="round" />

        {/* Eyes */}
        <AnimatedG transform={[{ translateY: 91 }, { scaleY: blink }, { translateY: -91 }]}>
          <Ellipse cx={91} cy={91} rx={13} ry={15} fill="#FFFDF8" />
          <Ellipse cx={128} cy={91} rx={13} ry={15} fill="#FFFDF8" />
          <Ellipse cx={93} cy={92} rx={6.2} ry={8.2} fill={EYE} />
          <Ellipse cx={130} cy={92} rx={6.2} ry={8.2} fill={EYE} />
          <Circle cx={95} cy={89} r={2.2} fill="#FFFDF8" />
          <Circle cx={132} cy={89} r={2.2} fill="#FFFDF8" />
        </AnimatedG>

        {/* Brows */}
        <Path d={browLift ? 'M79 72 Q91 66 102 72' : concerned ? 'M79 73 Q91 79 102 72' : 'M79 73 Q91 68 102 72'} fill="none" stroke={HAIR_DARK} strokeWidth={4} strokeLinecap="round" />
        <Path d={browLift ? 'M117 72 Q128 66 139 72' : concerned ? 'M117 72 Q128 79 139 73' : 'M117 72 Q128 68 139 72'} fill="none" stroke={HAIR_DARK} strokeWidth={4} strokeLinecap="round" />

        {/* Nose + cheeks */}
        <Path d="M108 91 Q103 105 109 108 Q114 108 116 104" fill="none" stroke={SKIN_SHADE} strokeWidth={2.5} strokeLinecap="round" />
        <Ellipse cx={79} cy={108} rx={10} ry={5} fill={CORAL} opacity={0.24} />
        <Ellipse cx={140} cy={108} rx={10} ry={5} fill={CORAL} opacity={0.24} />

        {/* Mouth */}
        {smile ? (
          <Path d="M96 116 Q109 128 123 116" fill="none" stroke="#9B4D4B" strokeWidth={3.2} strokeLinecap="round" />
        ) : concerned ? (
          <Path d="M98 124 Q109 116 120 124" fill="none" stroke="#9B4D4B" strokeWidth={3.2} strokeLinecap="round" />
        ) : (
          <AnimatedG transform={[{ translateX: 109 }, { scaleY: mouthScale }, { translateX: -109 }]}>
            <Ellipse cx={109} cy={119} rx={6.5} ry={3.2} fill="#9B4D4B" />
          </AnimatedG>
        )}

        {/* Neck */}
        <Path d="M94 139 L124 139 L127 164 L92 164Z" fill={SKIN_SHADE} />

        {/* Legs behind torso */}
        <AnimatedG transform={[{ translateX: 86 }, { rotate: legLeftDeg }, { translateX: -86 }]}>
          <Path d="M76 275 L98 275 L97 335 L75 335Z" fill={TROUSER} />
          <Path d="M72 327 Q85 321 99 331 L98 348 Q83 353 69 344Z" fill="url(#leather)" />
          <Path d="M73 336 L96 339" stroke={GOLD} strokeWidth={2} opacity={0.6} />
        </AnimatedG>
        <AnimatedG transform={[{ translateX: 136 }, { rotate: legRightDeg }, { translateX: -136 }]}>
          <Path d="M122 275 L144 275 L146 335 L124 335Z" fill={TROUSER} />
          <Path d="M121 331 Q134 321 148 330 L151 345 Q137 354 123 346Z" fill="url(#leather)" />
          <Path d="M124 338 L148 335" stroke={GOLD} strokeWidth={2} opacity={0.6} />
        </AnimatedG>

        {/* Blouse sleeves */}
        <Path d="M79 165 Q62 160 53 181 Q48 198 60 212 L77 201 L88 174Z" fill="url(#cream)" />
        <Path d="M139 165 Q156 160 167 181 Q172 198 160 212 L143 201 L130 174Z" fill="url(#cream)" />
        <Path d="M56 180 Q65 190 76 190" fill="none" stroke={CREAM_SHADE} strokeWidth={3} opacity={0.8} />
        <Path d="M164 180 Q155 190 144 190" fill="none" stroke={CREAM_SHADE} strokeWidth={3} opacity={0.8} />

        {/* Torso */}
        <AnimatedG transform={[{ translateY: 164 }, { scaleY: bodyScale }, { translateY: -164 }]}>
          <Path d="M84 157 Q108 145 135 157 L151 273 Q109 287 69 273 L82 159Z" fill="url(#cream)" />

          {/* Emerald vest */}
          <Path d="M83 158 Q69 167 67 191 L73 267 Q88 276 103 274 L105 180 L96 157Z" fill="url(#vest)" />
          <Path d="M133 157 Q147 167 150 191 L145 267 Q130 276 115 274 L113 180 L121 157Z" fill="url(#vest)" />
          <Path d="M104 179 L109 273" stroke={GOLD} strokeWidth={2} opacity={0.55} />
          <Circle cx={99} cy={190} r={3} fill={GOLD_LIGHT} />
          <Circle cx={99} cy={207} r={3} fill={GOLD_LIGHT} />
          <Circle cx={119} cy={190} r={3} fill={GOLD_LIGHT} />
          <Circle cx={119} cy={207} r={3} fill={GOLD_LIGHT} />

          {/* Belt */}
          <Path d="M69 238 Q110 249 150 238 L151 259 Q109 270 68 259Z" fill="url(#leather)" />
          <Rect x={101} y={246} width={17} height={17} rx={3} fill="url(#gold)" />
          <Rect x={105} y={250} width={9} height={9} rx={1.5} fill={LEATHER_DARK} />

          {/* Pouches */}
          <Path d="M65 242 Q54 241 51 250 L54 268 Q62 273 73 267 L73 247Z" fill="url(#leather)" />
          <Path d="M147 242 Q158 241 162 250 L159 268 Q151 273 140 267 L140 247Z" fill="url(#leather)" />
          <Line x1={55} y1={250} x2={70} y2={249} stroke={GOLD} strokeWidth={2} opacity={0.65} />
          <Line x1={143} y1={249} x2={158} y2={250} stroke={GOLD} strokeWidth={2} opacity={0.65} />
        </AnimatedG>

        {/* Arms + hands */}
        <Path d="M77 174 Q61 195 61 221" fill="none" stroke={EMERALD} strokeWidth={15} strokeLinecap="round" />
        <Circle cx={61} cy={224} r={9} fill={SKIN_LIGHT} />
        <AnimatedG transform={[{ translateX: 141 }, { translateY: 174 }, { rotate: waveDeg }, { translateX: -141 }, { translateY: -174 }]}>
          <Path d="M141 174 Q158 194 159 218" fill="none" stroke={EMERALD} strokeWidth={15} strokeLinecap="round" />
          <Circle cx={159} cy={222} r={9} fill={SKIN_LIGHT} />
          {action === 'waving' && (
            <Path d="M159 219 Q170 207 171 195 M160 220 Q176 213 179 202" fill="none" stroke={SKIN_LIGHT} strokeWidth={5} strokeLinecap="round" />
          )}
        </AnimatedG>

        {/* Necklace chain */}
        <Path d="M90 145 Q109 166 129 145" fill="none" stroke={GOLD} strokeWidth={2.5} />
        <Path d="M93 148 Q109 172 126 148" fill="none" stroke={GOLD_LIGHT} strokeWidth={1} opacity={0.7} />

        {/* Leaf-Star Compass charm */}
        <AnimatedG transform={[{ translateX: 109 }, { translateY: 167 }, { scale: charmScale }, { translateX: -109 }, { translateY: -167 }]}>
          <Circle cx={109} cy={167} r={13} fill={TEAL} opacity={0.16} />
          <Path d="M109 153 L112 162 L122 163 L114 169 L116 179 L109 173 L101 179 L103 169 L95 163 L105 162Z" fill="url(#gold)" stroke="#8A5A1C" strokeWidth={1.2} />
          <Path d="M109 158 L112 166 L109 174 L106 166Z" fill={TEAL} />
          <Circle cx={109} cy={166} r={3.5} fill={TEAL} stroke={GOLD_LIGHT} strokeWidth={1.2} />
        </AnimatedG>
      </AnimatedG>
    </Svg>
  );
}
