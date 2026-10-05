import React, { useEffect, useRef } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Animated, Easing } from 'react-native';
import { CassidyAction, CassidyMood } from '../characters/cassidy';

const AnimatedG = Animated.createAnimatedComponent(G);

// Interim Cassidy: a hand-authored layered 2D puppet based on the locked
// Cassidy identity reference. It is intentionally expressive and textured
// rather than a generic avatar. The final Cassidy art pack can replace this
// component later without changing its callers or the Cassidy domain model.
const C = {
  skin: '#F0C5A1', skinLight: '#FFDCC1', skinShadow: '#D99E7A',
  hair: '#43291F', hairDeep: '#2A1914', hairLight: '#76503D',
  emerald: '#087B59', emeraldDeep: '#07553F', emeraldLight: '#20A77E',
  cream: '#FFF7E8', creamShade: '#E7D7BF',
  leather: '#75482F', leatherLight: '#9A6745', leatherDeep: '#4A2A1D',
  trousers: '#505754', boot: '#583522', bootLight: '#805338',
  gold: '#D6A03D', goldLight: '#FFE6A2', teal: '#35C6C0', coral: '#E68A7D',
  eye: '#241A17', ink: '#2C2622',
};

interface Props {
  height?: number;
  action?: CassidyAction;
  speaking?: boolean;
  expression?: CassidyMood;
}

export function CassidyCharacter({ height = 150, action = 'idle', speaking = false, expression = 'warm' }: Props) {
  const breathe = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const blinkSecond = useRef(new Animated.Value(1)).current;
  const head = useRef(new Animated.Value(0)).current;
  const hair = useRef(new Animated.Value(0)).current;
  const braid = useRef(new Animated.Value(0)).current;
  const mouth = useRef(new Animated.Value(0)).current;
  const arm = useRef(new Animated.Value(0)).current;
  const step = useRef(new Animated.Value(0)).current;
  const charm = useRef(new Animated.Value(0)).current;
  const eyeLook = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (value: Animated.Value, duration: number, peak = 1) => Animated.loop(Animated.sequence([
      Animated.timing(value, { toValue: peak, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const idle = [
      loop(breathe, 2100), loop(float, 3300), loop(head, 4100), loop(hair, 3500),
      loop(braid, 2700), loop(charm, 1250), loop(eyeLook, 5200),
    ];
    idle.forEach((a) => a.start());
    const blinkTimer = Animated.loop(Animated.sequence([
      Animated.delay(2800),
      Animated.timing(blink, { toValue: 0.06, duration: 70, useNativeDriver: true }),
      Animated.timing(blink, { toValue: 1, duration: 110, useNativeDriver: true }),
      Animated.delay(190),
      Animated.timing(blinkSecond, { toValue: 0.06, duration: 65, useNativeDriver: true }),
      Animated.timing(blinkSecond, { toValue: 1, duration: 105, useNativeDriver: true }),
    ]));
    blinkTimer.start();
    return () => { idle.forEach((a) => a.stop()); blinkTimer.stop(); };
  }, [blink, blinkSecond, breathe, braid, charm, eyeLook, float, hair, head]);

  useEffect(() => {
    const animation = speaking
      ? Animated.loop(Animated.sequence([
          Animated.timing(mouth, { toValue: 1, duration: 145, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(mouth, { toValue: 0.2, duration: 145, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]))
      : Animated.timing(mouth, { toValue: 0.2, duration: 180, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [mouth, speaking]);

  useEffect(() => {
    const animation = action === 'walking'
      ? Animated.loop(Animated.sequence([
          Animated.timing(step, { toValue: 1, duration: 390, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(step, { toValue: -1, duration: 390, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]))
      : action === 'waving'
        ? Animated.loop(Animated.sequence([
            Animated.timing(arm, { toValue: 1, duration: 430, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(arm, { toValue: -1, duration: 430, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]))
        : Animated.timing(arm, { toValue: 0, duration: 220, useNativeDriver: true });
    animation.start();
    return () => {
      animation.stop();
      Animated.timing(step, { toValue: 0, duration: 160, useNativeDriver: true }).start();
      Animated.timing(arm, { toValue: 0, duration: 160, useNativeDriver: true }).start();
    };
  }, [action, arm, step]);

  const width = (height * 240) / 410;
  const bodyScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [-2, 2] });
  const headDeg = head.interpolate({ inputRange: [0, 1], outputRange: [-1.5, 1.5] });
  const hairDeg = hair.interpolate({ inputRange: [0, 1], outputRange: [-1.8, 1.8] });
  const braidDeg = braid.interpolate({ inputRange: [0, 1], outputRange: [-3.5, 4.5] });
  const armDeg = arm.interpolate({ inputRange: [-1, 1], outputRange: [-14, 20] });
  const legA = step.interpolate({ inputRange: [-1, 1], outputRange: [9, -9] });
  const legB = step.interpolate({ inputRange: [-1, 1], outputRange: [-9, 9] });
  const charmScale = charm.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const eyeX = eyeLook.interpolate({ inputRange: [0, 1], outputRange: [-1.2, 1.2] });
  const mouthScale = mouth.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.35] });
  const smile = expression === 'happy' || expression === 'excited' || expression === 'warm';
  const thoughtful = expression === 'thinking';

  return (
    <Svg width={width} height={height} viewBox="0 0 240 410" accessibilityLabel="Cassidy">
      <Defs>
        <LinearGradient id="cassidyHair" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={C.hairLight}/><Stop offset="0.38" stopColor={C.hair}/><Stop offset="1" stopColor={C.hairDeep}/></LinearGradient>
        <LinearGradient id="cassidyVest" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={C.emeraldLight}/><Stop offset="0.48" stopColor={C.emerald}/><Stop offset="1" stopColor={C.emeraldDeep}/></LinearGradient>
        <LinearGradient id="cassidyCream" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFFDF7"/><Stop offset="1" stopColor={C.cream}/></LinearGradient>
        <LinearGradient id="cassidyLeather" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={C.leatherLight}/><Stop offset="1" stopColor={C.leatherDeep}/></LinearGradient>
        <LinearGradient id="cassidyGold" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={C.goldLight}/><Stop offset="0.5" stopColor={C.gold}/><Stop offset="1" stopColor="#A66B20"/></LinearGradient>
        <LinearGradient id="cassidyBoot" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={C.bootLight}/><Stop offset="1" stopColor={C.boot}/></LinearGradient>
      </Defs>

      <AnimatedG transform={[{ translateY: floatY }]}>
        <Ellipse cx={120} cy={394} rx={61} ry={8} fill={C.ink} opacity={0.13}/>

        {/* Articulated side braid. */}
        <AnimatedG transform={[{ translateX: 164 }, { rotate: braidDeg }, { translateX: -164 }]}>
          <Path d="M158 105 Q181 124 176 151 Q172 169 183 185 Q191 198 181 211 Q170 222 159 208 Q151 197 159 181 Q166 166 157 151 Q148 137 158 105Z" fill="url(#cassidyHair)" stroke={C.hairDeep} strokeWidth={1.4}/>
          <Ellipse cx={171} cy={207} rx={11} ry={9} fill={C.hair}/><Ellipse cx={167} cy={224} rx={10} ry={9} fill={C.hairDeep}/><Ellipse cx={171} cy={240} rx={9} ry={8} fill={C.hair}/>
          <Path d="M164 251 Q171 258 179 251" fill="none" stroke={C.gold} strokeWidth={4} strokeLinecap="round"/>
        </AnimatedG>

        {/* Hood and back hair. */}
        <Path d="M65 122 Q58 73 84 53 Q108 34 137 48 Q168 63 166 120 L151 145 L78 145Z" fill={C.emeraldDeep}/>
        <Path d="M68 113 Q72 67 112 53 Q149 58 158 111" fill="none" stroke={C.gold} strokeWidth={2.2} opacity={0.52}/>
        <AnimatedG transform={[{ translateX: 116 }, { rotate: hairDeg }, { translateX: -116 }]}>
          <Path d="M58 101 Q51 53 83 30 Q113 9 146 31 Q177 51 169 101 Q166 119 154 136 L64 136 Q56 119 58 101Z" fill="url(#cassidyHair)" stroke={C.hairDeep} strokeWidth={1.3}/>
          <Path d="M70 76 Q60 59 77 43 Q92 29 108 31" fill="none" stroke={C.hairLight} strokeWidth={4} strokeLinecap="round" opacity={0.75}/>
          <Path d="M87 47 Q103 27 125 31 Q143 34 153 50" fill="none" stroke={C.hairLight} strokeWidth={3} strokeLinecap="round" opacity={0.6}/>
          <Path d="M143 47 Q162 65 153 87" fill="none" stroke={C.hairDeep} strokeWidth={7} strokeLinecap="round"/>
        </AnimatedG>

        {/* Expressive face. */}
        <AnimatedG transform={[{ translateX: 116 }, { rotate: headDeg }, { translateX: -116 }]}>
          <Ellipse cx={62} cy={96} rx={7} ry={11} fill={C.skin}/><Ellipse cx={170} cy={96} rx={7} ry={11} fill={C.skin}/>
          <Path d="M73 63 Q116 35 159 63 L160 105 Q154 141 116 155 Q78 141 72 105Z" fill={C.skinLight} stroke={C.skinShadow} strokeWidth={1.1}/>
          <Path d="M74 107 Q83 137 116 148 Q149 136 159 106 Q154 143 116 155 Q79 142 74 107Z" fill={C.skinShadow} opacity={0.3}/>
          <Path d="M73 68 Q61 87 71 117" fill="none" stroke={C.hairDeep} strokeWidth={11} strokeLinecap="round"/>
          <Path d="M156 67 Q169 88 159 117" fill="none" stroke={C.hairDeep} strokeWidth={11} strokeLinecap="round"/>
          <Path d="M79 63 Q91 43 111 42 Q134 42 153 62" fill="none" stroke={C.hair} strokeWidth={15} strokeLinecap="round"/>
          <Path d={thoughtful ? 'M82 74 Q94 67 106 73' : 'M82 74 Q94 69 106 73'} fill="none" stroke={C.hairDeep} strokeWidth={4.2} strokeLinecap="round"/>
          <Path d={thoughtful ? 'M125 73 Q137 66 149 72' : 'M125 73 Q137 69 149 73'} fill="none" stroke={C.hairDeep} strokeWidth={4.2} strokeLinecap="round"/>
          <AnimatedG transform={[{ translateY: 94 }, { scaleY: blink }, { translateY: -94 }]}>
            <Ellipse cx={94} cy={94} rx={14} ry={16} fill="#FFFDF9"/><Ellipse cx={138} cy={94} rx={14} ry={16} fill="#FFFDF9"/>
            <AnimatedG transform={[{ translateX: eyeX }]}>
              <Ellipse cx={95} cy={95} rx={7} ry={9.2} fill={C.eye}/><Ellipse cx={137} cy={95} rx={7} ry={9.2} fill={C.eye}/>
              <Ellipse cx={95} cy={96} rx={3.2} ry={5.2} fill="#6A4A38" opacity={0.85}/><Ellipse cx={137} cy={96} rx={3.2} ry={5.2} fill="#6A4A38" opacity={0.85}/>
              <Circle cx={97} cy={91} r={2.7} fill="#FFFFFF"/><Circle cx={139} cy={91} r={2.7} fill="#FFFFFF"/>
              <Circle cx={92} cy={100} r={1.1} fill={C.goldLight} opacity={0.9}/><Circle cx={134} cy={100} r={1.1} fill={C.goldLight} opacity={0.9}/>
            </AnimatedG>
          </AnimatedG>
          <Path d="M116 94 Q110 108 116 111 Q121 111 124 106" fill="none" stroke={C.skinShadow} strokeWidth={2.5} strokeLinecap="round"/>
          <Ellipse cx={81} cy={112} rx={11} ry={5.5} fill={C.coral} opacity={0.2}/><Ellipse cx={151} cy={112} rx={11} ry={5.5} fill={C.coral} opacity={0.2}/>
          {smile ? <Path d="M101 121 Q116 135 132 121" fill="none" stroke="#994B49" strokeWidth={3.4} strokeLinecap="round"/> : thoughtful ? <Path d="M106 128 Q116 122 126 127" fill="none" stroke="#994B49" strokeWidth={3.1} strokeLinecap="round"/> : <AnimatedG transform={[{ translateX: 116 }, { scaleY: mouthScale }, { translateX: -116 }]}><Ellipse cx={116} cy={124} rx={7} ry={3.5} fill="#994B49"/></AnimatedG>}
        </AnimatedG>

        <Path d="M100 143 L132 143 L136 169 L96 169Z" fill={C.skinShadow}/>
        <Path d="M91 154 Q116 177 141 154" fill="none" stroke={C.creamShade} strokeWidth={8} strokeLinecap="round"/>

        {/* Walking legs. */}
        <AnimatedG transform={[{ translateX: 89 }, { rotate: legA }, { translateX: -89 }]}>
          <Path d="M78 269 L101 269 L99 344 L75 344Z" fill={C.trousers}/>
          <Path d="M72 338 Q87 331 101 341 L100 361 Q85 366 69 355Z" fill="url(#cassidyBoot)" stroke={C.boot} strokeWidth={1.2}/>
          <Path d="M74 348 L98 352" stroke={C.gold} strokeWidth={2} opacity={0.55}/>
        </AnimatedG>
        <AnimatedG transform={[{ translateX: 143 }, { rotate: legB }, { translateX: -143 }]}>
          <Path d="M123 269 L146 269 L149 344 L125 344Z" fill={C.trousers}/>
          <Path d="M122 341 Q137 331 151 340 L154 357 Q138 366 124 355Z" fill="url(#cassidyBoot)" stroke={C.boot} strokeWidth={1.2}/>
          <Path d="M126 350 L151 346" stroke={C.gold} strokeWidth={2} opacity={0.55}/>
        </AnimatedG>

        {/* Soft blouse with fold lines. */}
        <Path d="M88 169 Q67 163 55 185 Q49 202 62 220 L82 207 L96 178Z" fill="url(#cassidyCream)" stroke={C.creamShade} strokeWidth={1.2}/>
        <Path d="M144 169 Q165 163 177 185 Q183 202 170 220 L150 207 L136 178Z" fill="url(#cassidyCream)" stroke={C.creamShade} strokeWidth={1.2}/>
        <Path d="M62 183 Q72 194 82 195" fill="none" stroke="#D8C5A9" strokeWidth={3} strokeLinecap="round"/>
        <Path d="M170 183 Q160 194 150 195" fill="none" stroke="#D8C5A9" strokeWidth={3} strokeLinecap="round"/>

        <AnimatedG transform={[{ translateY: 176 }, { scaleY: bodyScale }, { translateY: -176 }]}>
          <Path d="M94 157 Q116 148 138 157 L157 276 Q117 291 66 276 L83 158Z" fill="url(#cassidyCream)" stroke={C.creamShade} strokeWidth={1.2}/>
          <Path d="M94 157 Q78 163 72 189 L77 267 Q90 277 105 276 L106 181 L100 158Z" fill="url(#cassidyVest)" stroke={C.emeraldDeep} strokeWidth={1.2}/>
          <Path d="M138 157 Q154 163 160 189 L155 267 Q142 277 127 276 L126 181 L132 158Z" fill="url(#cassidyVest)" stroke={C.emeraldDeep} strokeWidth={1.2}/>
          <Path d="M88 169 Q82 203 86 254" fill="none" stroke={C.emeraldLight} strokeWidth={2} opacity={0.65}/>
          <Path d="M144 169 Q150 203 146 254" fill="none" stroke={C.emeraldLight} strokeWidth={2} opacity={0.65}/>
          <Path d="M106 180 L116 274" stroke={C.gold} strokeWidth={2.2} opacity={0.65}/>
          <Path d="M126 180 L116 274" stroke={C.goldLight} strokeWidth={1} opacity={0.7}/>
          <Circle cx={99} cy={193} r={3.2} fill={C.goldLight}/><Circle cx={99} cy={210} r={3.2} fill={C.goldLight}/>
          <Circle cx={134} cy={193} r={3.2} fill={C.goldLight}/><Circle cx={134} cy={210} r={3.2} fill={C.goldLight}/>
          <Path d="M70 241 Q116 253 158 241 L158 263 Q115 276 69 263Z" fill="url(#cassidyLeather)"/>
          <Rect x={107} y={248} width={19} height={19} rx={4} fill="url(#cassidyGold)"/><Rect x={112} y={253} width={9} height={9} rx={2} fill={C.leatherDeep}/>
          <Path d="M67 243 Q54 241 51 252 L54 271 Q63 276 76 269 L75 248Z" fill="url(#cassidyLeather)" stroke={C.leatherDeep} strokeWidth={1}/>
          <Path d="M157 243 Q170 241 173 252 L170 271 Q161 276 148 269 L149 248Z" fill="url(#cassidyLeather)" stroke={C.leatherDeep} strokeWidth={1}/>
          <Path d="M56 252 L72 251 M160 251 L170 252" stroke={C.gold} strokeWidth={2} opacity={0.7}/>
        </AnimatedG>

        {/* Expressive arms. */}
        <Path d="M82 176 Q64 197 63 224" fill="none" stroke={C.emerald} strokeWidth={16} strokeLinecap="round"/><Circle cx={63} cy={227} r={9.5} fill={C.skinLight} stroke={C.skinShadow} strokeWidth={1}/>
        <AnimatedG transform={[{ translateX: 150 }, { translateY: 176 }, { rotate: armDeg }, { translateX: -150 }, { translateY: -176 }]}>
          <Path d="M150 176 Q169 197 171 224" fill="none" stroke={C.emerald} strokeWidth={16} strokeLinecap="round"/><Circle cx={171} cy={227} r={9.5} fill={C.skinLight} stroke={C.skinShadow} strokeWidth={1}/>
          {action === 'waving' && <G><Path d="M171 225 Q182 213 182 198 M173 227 Q189 218 191 205" fill="none" stroke={C.skinLight} strokeWidth={5} strokeLinecap="round"/></G>}
        </AnimatedG>

        {/* Necklace and Leaf-Star Compass. */}
        <Path d="M96 150 Q116 173 136 150" fill="none" stroke={C.gold} strokeWidth={2.4}/>
        <Path d="M100 153 Q116 177 132 153" fill="none" stroke={C.goldLight} strokeWidth={1} opacity={0.75}/>
        <AnimatedG transform={[{ translateX: 116 }, { translateY: 169 }, { scale: charmScale }, { translateX: -116 }, { translateY: -169 }]}>
          <Circle cx={116} cy={169} r={16} fill={C.teal} opacity={0.13}/>
          <Circle cx={116} cy={169} r={10.5} fill={C.gold} opacity={0.9}/>
          <Path d="M116 153 L120 163 L131 164 L122 170 L125 181 L116 175 L107 181 L110 170 L101 164 L112 163Z" fill="url(#cassidyGold)" stroke="#8B5C1D" strokeWidth={1.1}/>
          <Path d="M116 158 L120 169 L116 176 L112 169Z" fill={C.teal}/><Circle cx={116} cy={168} r={3.5} fill={C.teal} stroke={C.goldLight} strokeWidth={1.1}/>
        </AnimatedG>
      </AnimatedG>
    </Svg>
  );
}
