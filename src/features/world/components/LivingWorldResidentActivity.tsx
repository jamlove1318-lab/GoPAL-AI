import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { LivingResident } from './LivingResidentLayer';
import { LivingCharacter, CharacterMotion } from './LivingCharacter';

export type LivingResidentActivityKind = 'walking' | 'working' | 'talking' | 'observing' | 'resting' | 'greeting';

export type LivingResidentActivity = {
  resident: LivingResident;
  kind: LivingResidentActivityKind;
  destination?: { x: number; y: number };
  duration?: number;
  message?: string;
};

const KIND_MOTION: Record<LivingResidentActivityKind, CharacterMotion> = {
  walking: 'walking',
  working: 'working',
  talking: 'talking',
  observing: 'observing',
  resting: 'sitting',
  greeting: 'greeting',
};

export function LivingWorldResidentActivity({
  activity,
  onPress,
  renderActor,
}: {
  activity: LivingResidentActivity;
  onPress?: (activity: LivingResidentActivity) => void;
  renderActor?: (activity: LivingResidentActivity) => ReactNode;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const destination = activity.destination ?? { x: activity.resident.x, y: activity.resident.y };
  const start = useMemo(() => ({ x: activity.resident.x, y: activity.resident.y }), [activity.resident.x, activity.resident.y]);
  const duration = Math.max(900, activity.duration ?? (activity.kind === 'walking' ? 3600 : 1800));

  useEffect(() => {
    progress.setValue(0);
    const travel = Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
      isInteraction: false,
    });
    const ambient = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    travel.start();
    ambient.start();
    return () => { travel.stop(); ambient.stop(); };
  }, [duration, progress, pulse, start.x, start.y, destination.x, destination.y]);

  const x = progress.interpolate({ inputRange: [0, 1], outputRange: [0, destination.x - start.x] });
  const y = progress.interpolate({ inputRange: [0, 1], outputRange: [0, destination.y - start.y] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, activity.kind === 'greeting' ? 1.035 : 1.015] });
  const motion = KIND_MOTION[activity.kind];

  return (
    <Animated.View style={{ position: 'absolute', left: `${start.x}%`, top: `${start.y}%`, zIndex: Math.round(start.y), transform: [{ translateX: x }, { translateY: y }, { scale }] }}>
      <Pressable pointerEvents="auto" onPress={() => onPress?.(activity)} className="-ml-9 -mt-10 items-center">
        {renderActor?.(activity) ?? <View className="h-[82px] w-[76px] items-center justify-center"><LivingCharacter character={activity.resident.id as any} motion={motion} /></View>}
        {activity.message && <View className="mt-1 max-w-[170px] rounded-full border border-white/10 bg-slate-950/55 px-2.5 py-1"><Text className="text-[9px] text-white/75">{activity.message}</Text></View>}
      </Pressable>
    </Animated.View>
  );
}

export function buildResidentActivity(resident: LivingResident, index = 0): LivingResidentActivity {
  const activity = resident.activity.toLowerCase();
  if (activity.includes('talk')) return { resident, kind: 'talking', message: `${resident.name} is talking with a regular.` };
  if (activity.includes('making') || activity.includes('sorting') || activity.includes('setting') || activity.includes('lighting')) return { resident, kind: 'working' };
  if (activity.includes('looking') || activity.includes('following') || activity.includes('reading')) return { resident, kind: 'observing' };
  if (activity.includes('heading') || activity.includes('calling')) return { resident, kind: 'walking', destination: { x: resident.x + (index % 2 ? -12 : 12), y: resident.y - 3 }, duration: 3000 };
  return { resident, kind: 'resting' };
}

export function LivingWorldResidentActivityLayer({ residents, onPress }: { residents: LivingResident[]; onPress?: (activity: LivingResidentActivity) => void }) {
  return <View pointerEvents="box-none" className="absolute inset-0 z-35">{residents.map((resident, index) => <LivingWorldResidentActivity key={`activity:${resident.id}:${resident.locationKey}`} activity={buildResidentActivity(resident, index)} onPress={onPress} />)}</View>;
}
