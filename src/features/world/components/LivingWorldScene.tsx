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

export function LivingWorldScene({ snapshot, onNavigate, onStartScenario }: LivingWorldSceneProps) {
  const moment = snapshot.returnMoment;
  const hasContinuity = snapshot.continuity.newDay || snapshot.continuity.isNewSeason;
  const isNight = snapshot.timeOfDay === 'night';
  const isRain = /rain|storm|drizzle/i.test(snapshot.weather);
  const isWinter = /winter/i.test(snapshot.season);
  const isAutumn = /autumn|fall/i.test(snapshot.season);

  const breath = useRef(new Animated.Value(0)).current;
  const breeze = useRef(new Animated.Value(0)).current;
  const celestial = useRef(new Animated.Value(0)).current;
  const fireflies = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    left: 10 + ((i * 17) % 78),
    top: 24 + ((i * 23) % 48),
    size: i % 3 === 0 ? 4 : 3,
    delay: i * 420,
    duration: 2800 + i * 260,
  })), []);
  const fireflyValues = useRef(fireflies.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const looping = [
      Animated.loop(Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(breeze, { toValue: 1, duration: 7200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breeze, { toValue: 0, duration: 7200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(celestial, { toValue: 1, duration: 12000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(celestial, { toValue: 0, duration: 12000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])),
      ...fireflyValues.map((value, i) => Animated.loop(Animated.sequence([
        Animated.delay(fireflies[i].delay),
        Animated.timing(value, { toValue: 1, duration: fireflies[i].duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration: fireflies[i].duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]))),
    ];
    looping.forEach((animation) => animation.start());
    return () => looping.forEach((animation) => animation.stop());
  }, [breath, breeze, celestial, fireflyValues, fireflies]);

  const treeSway = breeze.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '1.5deg'] });
  const cloudX = breeze.interpolate({ inputRange: [0, 1], outputRange: [-22, 22] });
  const sunY = celestial.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const livingScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });

  return (
    <View className="flex-1 overflow-hidden bg-transparent">
      <View className="absolute inset-0 bg-slate-950/25" />

      {/* The scene has slow movement at different depths. It should feel alive before the learner touches anything. */}
      <Animated.View style={{ transform: [{ translateX: cloudX }] }} className="absolute -top-10 left-1/4 h-28 w-64 rounded-full bg-white/5" />
      <Animated.View style={{ transform: [{ translateY: sunY }] }} className={`absolute right-10 top-20 h-24 w-24 rounded-full ${isNight ? 'bg-indigo-200/10' : 'bg-amber-200/10'}`} />

      <View className="absolute bottom-20 left-[-8%] right-[-8%] h-44 rounded-[50%] bg-emerald-950/45" />
      <Animated.View style={{ transform: [{ rotate: treeSway }] }} className="absolute bottom-20 left-3 h-36 w-24 origin-bottom">
        <View className="absolute bottom-0 left-11 h-24 w-2 rounded-full bg-amber-950/70" />
        <View className="absolute bottom-12 left-1 h-20 w-20 rounded-full bg-emerald-900/70" />
        <View className="absolute bottom-20 left-9 h-16 w-16 rounded-full bg-emerald-800/60" />
      </Animated.View>
      <Animated.View style={{ transform: [{ rotate: treeSway }] }} className="absolute bottom-24 right-1 h-40 w-28 origin-bottom">
        <View className="absolute bottom-0 left-12 h-28 w-2 rounded-full bg-amber-950/65" />
        <View className="absolute bottom-14 left-0 h-24 w-24 rounded-full bg-emerald-950/75" />
        <View className="absolute bottom-24 left-8 h-16 w-16 rounded-full bg-emerald-800/55" />
      </Animated.View>

      {isAutumn && (
        <View className="absolute bottom-24 left-1/3 rounded-full bg-amber-300/10 px-8 py-3">
          <Wind size={16} color="#fbbf24" />
        </View>
      )}

      {isWinter && Array.from({ length: 9 }, (_, i) => (
        <Animated.View
          key={`snow-${i}`}
          style={{
            left: `${8 + i * 10}%`,
            top: `${18 + (i % 4) * 12}%`,
            opacity: 0.35,
            transform: [{ translateY: breeze.interpolate({ inputRange: [0, 1], outputRange: [-12, 55 + i * 3] }) }],
          }}
          className="absolute h-1.5 w-1.5 rounded-full bg-sky-100"
        />
      ))}

      {isRain && Array.from({ length: 7 }, (_, i) => (
        <Animated.View
          key={`rain-${i}`}
          style={{
            left: `${8 + i * 14}%`,
            top: `${20 + (i % 3) * 15}%`,
            opacity: 0.16,
            transform: [{ rotate: '18deg' }, { translateY: breeze.interpolate({ inputRange: [0, 1], outputRange: [-25, 110] }) }],
          }}
          className="absolute h-20 w-px bg-sky-100"
        />
      ))}

      {isNight && fireflies.map((firefly, i) => {
        const value = fireflyValues[i];
        const opacity = value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.08, 0.9, 0.12] });
        const y = value.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
        return (
          <Animated.View
            key={`firefly-${i}`}
            style={{ left: `${firefly.left}%`, top: `${firefly.top}%`, opacity, transform: [{ translateY: y }] }}
            className="absolute rounded-full bg-emerald-200"
            // @ts-expect-error RN accepts numeric dimensions through style but class controls the base shape.
          />
        );
      })}

      <View className="flex-1 px-6 pt-10">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-[3px] text-emerald-300/80">
              {snapshot.worldName || 'Your World'}
            </Text>
            <Text className="mt-1 text-3xl font-light text-white">
              {snapshot.locationName || 'Sanctuary'}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs uppercase tracking-widest text-slate-400">{snapshot.timeOfDay}</Text>
            <Text className="mt-1 text-xs text-slate-500">{snapshot.season} · {snapshot.weather}</Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: livingScale }] }} className="flex-1 justify-center">
          <View className="max-w-[340px]">
            <Text className="text-sm leading-6 text-emerald-200/80">{greeting(snapshot.timeOfDay)}</Text>
            <Text className="mt-3 text-4xl font-light leading-[46px] text-white">{moment.title}</Text>
            <Text className="mt-4 text-base leading-7 text-slate-300/90">{moment.message}</Text>

            {hasContinuity && (
              <Text className="mt-5 text-xs leading-5 text-slate-500">
                While you were away, only things that were eligible to change have moved forward.
              </Text>
            )}

            {onStartScenario && moment.kind === 'discovery' && (
              <Pressable
                onPress={() => onStartScenario('scen-cafe-order')}
                className="mt-5 self-start rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2.5 active:bg-emerald-300/20"
              >
                <Text className="text-xs font-semibold text-emerald-100">Follow the thread</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        <View className="mb-7">
          <Text className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-slate-500">What calls to you?</Text>
          <View className="flex-row items-center gap-3">
            <WorldAction icon={<BookOpen size={19} color="#d1fae5" />} label="Learn" onPress={() => onNavigate('study')} />
            <WorldAction icon={<Compass size={19} color="#d1fae5" />} label="Wander" onPress={() => onNavigate('world')} />
            <WorldAction icon={<Heart size={19} color="#d1fae5" />} label="Cassidy" onPress={() => onNavigate('cassidy')} />
            <WorldAction icon={<Sparkles size={19} color="#d1fae5" />} label="Journey" onPress={() => onNavigate('journey')} />
          </View>
          <View className="mt-4 flex-row items-center">
            <MapPin size={13} color="#64748b" />
            <Text className="ml-1.5 text-[10px] text-slate-500">You are here · your world remembers this place</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function WorldAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  const press = useRef(new Animated.Value(0)).current;
  return (
    <Pressable
      onPressIn={() => Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 28, bounciness: 5 }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 0, useNativeDriver: true, speed: 28, bounciness: 5 }).start()}
      onPress={onPress}
      className="flex-1 items-center rounded-2xl border border-white/10 bg-slate-900/30 py-3 active:bg-white/10"
    >
      <Animated.View style={{ transform: [{ scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] }) }] }}>{icon}</Animated.View>
      <Text className="mt-1.5 text-[10px] font-medium text-slate-300">{label}</Text>
    </Pressable>
  );
}
