import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BookOpen, Compass, Heart, MapPin, Sparkles } from 'lucide-react-native';
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

export function LivingWorldScene({ snapshot, onNavigate }: LivingWorldSceneProps) {
  const moment = snapshot.returnMoment;
  const hasContinuity = snapshot.continuity.newDay || snapshot.continuity.isNewSeason;

  return (
    <View className="flex-1 overflow-hidden bg-transparent">
      {/* Sky / atmosphere */}
      <View className="absolute inset-0 bg-slate-950/35" />
      <View className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10" />
      <View className="absolute -left-28 bottom-16 h-80 w-80 rounded-full bg-indigo-500/10" />

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

        {/* The world moment — deliberately not a card grid */}
        <View className="flex-1 justify-center">
          <View className="max-w-[340px]">
            <Text className="text-sm leading-6 text-emerald-200/80">{greeting(snapshot.timeOfDay)}</Text>
            <Text className="mt-3 text-4xl font-light leading-[46px] text-white">
              {moment.title}
            </Text>
            <Text className="mt-4 text-base leading-7 text-slate-300/90">
              {moment.message}
            </Text>

            {hasContinuity && (
              <Text className="mt-5 text-xs leading-5 text-slate-500">
                While you were away, only things that were eligible to change have moved forward.
              </Text>
            )}
          </View>
        </View>

        {/* Contextual actions, not persistent app navigation */}
        <View className="mb-7">
          <Text className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-slate-500">
            What calls to you?
          </Text>
          <View className="flex-row items-center gap-3">
            <WorldAction icon={<BookOpen size={19} color="#d1fae5" />} label="Learn" onPress={() => onNavigate('study')} />
            <WorldAction icon={<Compass size={19} color="#d1fae5" />} label="Wander" onPress={() => onNavigate('world')} />
            <WorldAction icon={<Heart size={19} color="#d1fae5" />} label="Cassidy" onPress={() => onNavigate('cassidy')} />
            <WorldAction icon={<Sparkles size={19} color="#d1fae5" />} label="Journey" onPress={() => onNavigate('journey')} />
          </View>
          <View className="mt-4 flex-row items-center">
            <MapPin size={13} color="#64748b" />
            <Text className="ml-1.5 text-[10px] text-slate-500">
              You are here · your world remembers this place
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function WorldAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center rounded-2xl border border-white/10 bg-slate-900/35 py-3 active:bg-white/10">
      {icon}
      <Text className="mt-1.5 text-[10px] font-medium text-slate-300">{label}</Text>
    </Pressable>
  );
}
