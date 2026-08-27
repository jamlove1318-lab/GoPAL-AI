import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { BookOpen, Compass, Heart, MapPin, Sparkles, Wind } from 'lucide-react-native';
import type { WorldSnapshot } from '../../../engines/world/livingWorldRuntime';

interface LivingWorldSceneProps {
  snapshot: WorldSnapshot;
  onNavigate: (destination: 'study' | 'world' | 'cassidy' | 'journey') => void;
  onStartScenario?: (scenarioKey: string) => void;
}

function greeting(timeOfDay: WorldSnapshot['timeOfDay']) {
  switch (timeOfDay) {
    case 'morning': return 'The valley is waking with you.';
    case 'afternoon': return 'There is still time for something curious.';
    case 'evening': return 'The lights are beginning to glow.';
    default: return 'The world is quiet, but not asleep.';
  }
}

function LivingDot({ delay, left, top, size = 4 }: { delay: number; left: string; top: string; size?: number }) {
  const motion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(motion, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(motion, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [delay, motion]);
  return (
    <Animated.View style={{ position: 'absolute', left, top, width: size, height: size, borderRadius: size / 2, backgroundColor: '#a7f3d0', opacity: motion.interpolate({ inputRange: [0, .5, 1], outputRange: [.12, .85, .18] }), transform: [{ translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, -16] }) }] }} />
  );
}

function LivingTree({ side = 'left' }: { side?: 'left' | 'right' }) {
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(sway, { toValue: -1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(sway, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [sway]);
  const rotate = sway.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-1.8deg', '0deg', '1.8deg'] });
  return (
    <Animated.View style={{ position: 'absolute', bottom: side === 'left' ? '13%' : '17%', [side]: side === 'left' ? '2%' : '0%', transform: [{ rotate }] }}>
      <View className="absolute bottom-0 left-10 h-28 w-2 rounded-full bg-amber-950/65" />
      <View className="h-24 w-24 rounded-full bg-emerald-950/65" />
      <View className="-ml-2 -mt-16 h-20 w-20 rounded-full bg-emerald-900/60" />
      <View className="ml-8 -mt-14 h-16 w-16 rounded-full bg-emerald-800/55" />
    </Animated.View>
  );
}

function BirdFlock({ night }: { night: boolean }) {
  const flight = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(flight, { toValue: 1, duration: 10500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(flight, { toValue: 0, duration: 10500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [flight]);
  if (night) return null;
  const translateX = flight.interpolate({ inputRange: [0, 1], outputRange: [-45, 120] });
  const translateY = flight.interpolate({ inputRange: [0, .45, 1], outputRange: [4, -10, 2] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: '26%', top: '22%', transform: [{ translateX }, { translateY }] }}>
      <View className="flex-row items-center gap-2 opacity-40"><Text className="text-[13px] text-slate-300">⌁</Text><Text className="text-[11px] text-slate-300">⌁</Text><Text className="text-[9px] text-slate-300">⌁</Text></View>
    </Animated.View>
  );
}

function LivingLantern({ evening }: { evening: boolean }) {
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [glow]);
  if (!evening) return null;
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', left: '73%', top: '47%', opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [.35, .8] }), transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [.92, 1.06] }) }] }}><View className="h-3 w-3 rounded-full bg-amber-200" /><View className="absolute -inset-3 rounded-full bg-amber-200/15" /></Animated.View>;
}

export function LivingWorldScene({ snapshot, onNavigate, onStartScenario }: LivingWorldSceneProps) {
  const moment = snapshot.returnMoment;
  const hasContinuity = snapshot.continuity.newDay || snapshot.continuity.isNewSeason;
  const isNight = snapshot.timeOfDay === 'night';
  const isEvening = snapshot.timeOfDay === 'evening';
  const isRain = /rain|storm|drizzle/i.test(snapshot.weather);
  const isWinter = /winter/i.test(snapshot.season) || /snow/i.test(snapshot.weather);
  const isAutumn = /autumn|fall/i.test(snapshot.season);
  const breath = useRef(new Animated.Value(0)).current;
  const breeze = useRef(new Animated.Value(0)).current;
  const celestial = useRef(new Animated.Value(0)).current;
  const fireflies = useMemo(() => Array.from({ length: isNight ? 10 : 6 }, (_, i) => ({ left: `${8 + ((i * 19) % 82)}%`, top: `${23 + ((i * 17) % 48)}%`, delay: i * 370 })), [isNight]);
  const fireflyValues = useRef(fireflies.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = [
      Animated.loop(Animated.sequence([Animated.timing(breath, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(breath, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true })])),
      Animated.loop(Animated.sequence([Animated.timing(breeze, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(breeze, { toValue: 0, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true })])),
      Animated.loop(Animated.sequence([Animated.timing(celestial, { toValue: 1, duration: 12000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(celestial, { toValue: 0, duration: 12000, easing: Easing.inOut(Easing.sin), useNativeDriver: true })])),
      ...fireflyValues.map((value, i) => Animated.loop(Animated.sequence([Animated.delay(fireflies[i].delay), Animated.timing(value, { toValue: 1, duration: 2500 + i * 170, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(value, { toValue: 0, duration: 2500 + i * 170, easing: Easing.inOut(Easing.sin), useNativeDriver: true })]))),
    ];
    loops.forEach((animation) => animation.start());
    return () => loops.forEach((animation) => animation.stop());
  }, [breath, breeze, celestial, fireflies, fireflyValues]);

  return (
    <View className="flex-1 overflow-hidden bg-transparent">
      <View className="absolute inset-0 bg-slate-950/25" />
      <Animated.View style={{ transform: [{ translateX: breeze.interpolate({ inputRange: [0, 1], outputRange: [-24, 24] }) }] }} className="absolute -top-8 left-1/4 h-24 w-72 rounded-full bg-white/5" />
      <Animated.View style={{ transform: [{ translateY: celestial.interpolate({ inputRange: [0, 1], outputRange: [0, 9] }) }] }} className={`absolute right-10 top-20 h-24 w-24 rounded-full ${isNight ? 'bg-indigo-200/10' : 'bg-amber-200/10'}`} />
      <View className="absolute bottom-0 left-[-10%] h-[34%] w-[120%] rounded-[50%] bg-emerald-950/35" />
      <LivingTree side="left" /><LivingTree side="right" />
      <BirdFlock night={isNight} />
      <LivingLantern evening={isEvening} />
      {Array.from({ length: isNight ? 16 : 9 }, (_, i) => <LivingDot key={`dot-${i}`} delay={i * 230} left={`${6 + ((i * 29) % 88)}%`} top={`${16 + ((i * 31) % 55)}%`} size={isNight ? 4 : 3} />)}
      {isWinter && Array.from({ length: 10 }, (_, i) => <LivingDot key={`snow-${i}`} delay={i * 160} left={`${i * 10}%`} top={`${14 + (i % 5) * 11}%`} size={4} />)}
      {isRain && Array.from({ length: 9 }, (_, i) => <Animated.View key={`rain-${i}`} style={{ position: 'absolute', left: `${5 + i * 12}%`, top: `${16 + (i % 4) * 12}%`, height: 70, width: 1, backgroundColor: '#bfdbfe', opacity: .16, transform: [{ rotate: '18deg' }, { translateY: breeze.interpolate({ inputRange: [0, 1], outputRange: [-30, 100] }) }] }} />)}
      {isAutumn && <Animated.View style={{ transform: [{ translateX: breeze.interpolate({ inputRange: [0, 1], outputRange: [-30, 60] }) }] }} className="absolute left-1/4 top-1/2 h-2 w-2 rounded-full bg-amber-300/50" />}
      {isNight && fireflies.map((firefly, i) => <Animated.View key={`firefly-${i}`} style={{ left: firefly.left, top: firefly.top, opacity: fireflyValues[i].interpolate({ inputRange: [0, .5, 1], outputRange: [.05, .95, .08] }), transform: [{ translateY: fireflyValues[i].interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) }] }} className="absolute h-1.5 w-1.5 rounded-full bg-emerald-200" />)}

      <View className="flex-1 px-6 pt-10">
        <View className="flex-row items-center justify-between">
          <View><Text className="text-xs font-semibold uppercase tracking-[3px] text-emerald-300/80">{snapshot.worldName || 'Your World'}</Text><Text className="mt-1 text-3xl font-light text-white">{snapshot.locationName || 'Sanctuary'}</Text></View>
          <View className="items-end"><Text className="text-xs uppercase tracking-widest text-slate-400">{snapshot.timeOfDay}</Text><Text className="mt-1 text-xs text-slate-500">{snapshot.season} · {snapshot.weather}</Text></View>
        </View>

        <Animated.View style={{ transform: [{ scale: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.018] }) }] }} className="flex-1 justify-center">
          <View className="max-w-[340px]"><Text className="text-sm leading-6 text-emerald-200/80">{greeting(snapshot.timeOfDay)}</Text><Text className="mt-3 text-4xl font-light leading-[46px] text-white">{moment.title}</Text><Text className="mt-4 text-base leading-7 text-slate-300/90">{moment.message}</Text>{hasContinuity && <Text className="mt-5 text-xs leading-5 text-slate-500">While you were away, only things that were eligible to change have moved forward.</Text>}{onStartScenario && moment.kind === 'discovery' && <Pressable onPress={() => onStartScenario('scen-cafe-order')} className="mt-5 self-start rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2.5 active:bg-emerald-300/20"><Text className="text-xs font-semibold text-emerald-100">Follow the thread</Text></Pressable>}</View>
        </Animated.View>

        <View className="mb-7"><Text className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-slate-500">What calls to you?</Text><View className="flex-row items-center gap-3"><WorldAction icon={<BookOpen size={19} color="#d1fae5" />} label="Learn" onPress={() => onNavigate('study')} /><WorldAction icon={<Compass size={19} color="#d1fae5" />} label="Wander" onPress={() => onNavigate('world')} /><WorldAction icon={<Heart size={19} color="#d1fae5" />} label="Cassidy" onPress={() => onNavigate('cassidy')} /><WorldAction icon={<Sparkles size={19} color="#d1fae5" />} label="Journey" onPress={() => onNavigate('journey')} /></View><View className="mt-4 flex-row items-center"><MapPin size={13} color="#64748b" /><Text className="ml-1.5 text-[10px] text-slate-500">You are here · your world remembers this place</Text></View></View>
      </View>
    </View>
  );
}

function WorldAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  const press = useRef(new Animated.Value(0)).current;
  return <Pressable onPress={onPress} onPressIn={() => Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 28, bounciness: 5 }).start()} onPressOut={() => Animated.spring(press, { toValue: 0, useNativeDriver: true, speed: 28, bounciness: 5 }).start()} className="flex-1 items-center rounded-2xl border border-white/10 bg-slate-900/30 py-3 active:bg-white/10"><Animated.View style={{ transform: [{ scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, .92] }) }] }}>{icon}</Animated.View><Text className="mt-1.5 text-[10px] font-medium text-slate-300">{label}</Text></Pressable>;
}
