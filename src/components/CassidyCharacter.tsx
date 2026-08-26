import React, { useEffect, useRef } from 'react';
import Svg, { G, Circle, Ellipse, Path, Rect, Line } from 'react-native-svg';
import { Animated, Easing } from 'react-native';
import { CassidyAction, CassidyMood } from '../characters/cassidy';

const AnimatedG = Animated.createAnimatedComponent(G);

const SKIN = '#f4c9a3';
const SKIN_SHADE = '#e7b489';
const HAIR = '#5b3a29';
const HAIR_HI = '#7a4f37';
const SHIRT = '#10b981';
const SHIRT_SHADE = '#0c9268';
const PANTS = '#334155';
const SHOE = '#1e293b';

interface Props {
  height?: number;
  action?: CassidyAction;
  speaking?: boolean;
  expression?: CassidyMood;
}

export function CassidyCharacter({ height = 150, action = 'idle', speaking = false, expression = 'warm' }: Props) {
  const breathe = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const mouth = useRef(new Animated.Value(1)).current;
  const arm = useRef(new Animated.Value(0)).current;
  const legL = useRef(new Animated.Value(0)).current;
  const legR = useRef(new Animated.Value(0)).current;

  // Always-on life: breathing, gentle bob, blink, hair sway.
  useEffect(() => {
    const loop = (v: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
    const anims = [
      loop(breathe, 2600),
      loop(bob, 3200),
      loop(sway, 4200),
      // blink: stay open, snap shut, open — repeats ~every 3.4s
      Animated.loop(
        Animated.sequence([
          Animated.timing(blink, { toValue: 1, duration: 3000, useNativeDriver: true }),
          Animated.timing(blink, { toValue: 0.1, duration: 90, useNativeDriver: true }),
          Animated.timing(blink, { toValue: 1, duration: 110, useNativeDriver: true }),
        ])
      ),
    ];
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [breathe, bob, sway, blink]);

  // Speaking → mouth flaps.
  useEffect(() => {
    if (speaking) {
      const a = Animated.loop(
        Animated.sequence([
          Animated.timing(mouth, { toValue: 2.1, duration: 160, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(mouth, { toValue: 1, duration: 160, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
      a.start();
      return () => a.stop();
    }
    Animated.timing(mouth, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [speaking, mouth]);

  // Action-driven limbs.
  useEffect(() => {
    const make = (v: Animated.Value, from: number, to: number, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: to, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: from, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
    let a: ReturnType<typeof Animated.loop> | null = null;
    if (action === 'waving') a = make(arm, -6, 26, 620);
    else if (action === 'walking') {
      a = Animated.loop(Animated.parallel([make(legL, -18, 18, 420), make(legR, 18, -18, 420)]));
    }
    if (a) a.start();
    return () => {
      a?.stop();
      Animated.timing(arm, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      Animated.timing(legL, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      Animated.timing(legR, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    };
  }, [action, arm, legL, legR]);

  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [-4, 4] });
  const breathScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const swayDeg = sway.interpolate({ inputRange: [0, 1], outputRange: [-3, 3] });
  const mouthScale = mouth;
  const armDeg = arm.interpolate({ inputRange: [-6, 26], outputRange: [-6, 26] });
  const legLDeg = legL.interpolate({ inputRange: [-18, 18], outputRange: [-18, 18] });
  const legRDeg = legR.interpolate({ inputRange: [-18, 18], outputRange: [-18, 18] });

  const browY = expression === 'thinking' ? 1 : 0;
  const width = (height * 200) / 340;

  return (
    <Svg height={height} width={width} viewBox="0 0 200 340">
      {/* whole figure bob */}
      <AnimatedG transform={[{ translateY: bobY }]}>
        {/* upper body breathes around the hips (y=232) */}
        <AnimatedG transform={[{ translateY: 232 }, { scaleY: breathScale }, { translateY: -232 }]}>

          {/* HAIR (back) + sway — pivot at y=80 */}
          <AnimatedG transform={[{ translateY: 80 }, { rotate: swayDeg }, { translateY: -80 }]}>
            <Path d="M54 84 Q56 28 100 26 Q144 28 146 84 Q146 60 100 54 Q54 60 54 84 Z" fill={HAIR} />
          </AnimatedG>

          {/* HEAD */}
          <Circle cx={100} cy={82} r={46} fill={SKIN} />
          <Path d="M62 70 Q60 36 100 34 Q140 36 138 70 Q140 52 100 48 Q60 52 62 70 Z" fill={HAIR_HI} />

          {/* EYES — blink pivot at y=82 */}
          <AnimatedG transform={[{ translateY: 82 }, { scaleY: blink }, { translateY: -82 }]}>
            {expression === 'thinking' ? (
              <>
                <Ellipse cx={84} cy={84} rx={5} ry={5} fill="#2b2b2b" />
                <Ellipse cx={116} cy={84} rx={5} ry={5} fill="#2b2b2b" />
              </>
            ) : (
              <>
                <Circle cx={84} cy={84} r={8} fill="#fff" />
                <Circle cx={116} cy={84} r={8} fill="#fff" />
                <Circle cx={85} cy={85} r={4.2} fill="#3a2a1f" />
                <Circle cx={117} cy={85} r={4.2} fill="#3a2a1f" />
              </>
            )}
          </AnimatedG>

          {/* BROWS */}
          <Line x1={76} y1={70 - browY * 2} x2={92} y2={70 - browY * 4} stroke={HAIR} strokeWidth={3} strokeLinecap="round" />
          <Line x1={108} y1={70 - browY * 4} x2={124} y2={70 - browY * 2} stroke={HAIR} strokeWidth={3} strokeLinecap="round" />

          {/* CHEEKS */}
          <Circle cx={72} cy={98} r={6} fill="#f6a98c" opacity={0.5} />
          <Circle cx={128} cy={98} r={6} fill="#f6a98c" opacity={0.5} />

          {/* MOUTH — talks pivot at y=104 */}
          <AnimatedG transform={[{ translateY: 104 }, { scaleY: mouthScale }, { translateY: -104 }]}>
            <Ellipse cx={100} cy={104} rx={9} ry={4} fill="#b5485a" />
          </AnimatedG>

          {/* NECK */}
          <Rect x={92} y={120} width={16} height={18} fill={SKIN_SHADE} />

          {/* TORSO / SHIRT */}
          <Path d="M70 150 Q100 132 130 150 L136 232 L64 232 Z" fill={SHIRT} />
          <Path d="M100 132 L100 232 L64 232 L70 150 Q84 140 100 138 Z" fill={SHIRT_SHADE} opacity={0.5} />

          {/* LEFT ARM (resting) */}
          <G>
            <Path d="M72 152 Q56 180 60 210" stroke={SHIRT} strokeWidth={14} fill="none" strokeLinecap="round" />
            <Circle cx={60} cy={212} r={8} fill={SKIN} />
          </G>

          {/* RIGHT ARM (waves) — pivot at shoulder (128,152) */}
          <AnimatedG transform={[{ translateY: 152 }, { translateX: 128 }, { rotate: armDeg }, { translateX: -128 }, { translateY: -152 }]}>
            <Path d="M128 152 Q146 178 140 208" stroke={SHIRT} strokeWidth={14} fill="none" strokeLinecap="round" />
            <Circle cx={140} cy={210} r={8} fill={SKIN} />
          </AnimatedG>
        </AnimatedG>

        {/* LEGS (walk) — pivot at hips y=232 */}
        <AnimatedG transform={[{ translateY: 232 }, { translateX: 86 }, { rotate: legLDeg }, { translateX: -86 }, { translateY: -232 }]}>
          <Rect x={78} y={230} width={16} height={66} rx={7} fill={PANTS} />
          <Ellipse cx={86} cy={300} rx={13} ry={8} fill={SHOE} />
        </AnimatedG>
        <AnimatedG transform={[{ translateY: 232 }, { translateX: 114 }, { rotate: legRDeg }, { translateX: -114 }, { translateY: -232 }]}>
          <Rect x={106} y={230} width={16} height={66} rx={7} fill={PANTS} />
          <Ellipse cx={114} cy={300} rx={13} ry={8} fill={SHOE} />
        </AnimatedG>
      </AnimatedG>
    </Svg>
  );
}
