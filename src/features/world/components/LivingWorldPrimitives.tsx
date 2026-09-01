import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type WorldTheme = 'emerald' | 'sakura' | 'mountain' | 'coastal' | 'festival';
export type WorldBuildingType = 'house' | 'cafe' | 'library' | 'market' | 'school' | 'sanctuary' | 'workshop';
export type WorldPropType = 'tree' | 'rock' | 'lamp' | 'bench' | 'fence' | 'flower' | 'sign';

export type WorldBuildingDefinition = {
  id: string;
  type: WorldBuildingType;
  x: number;
  y: number;
  scale?: number;
  label?: string;
  onPress?: () => void;
};

export type WorldPropDefinition = {
  id: string;
  type: WorldPropType;
  x: number;
  y: number;
  scale?: number;
};

const BUILDING_ART: Record<WorldBuildingType, { roof: string; body: string; door: string; icon: string; width: number; height: number }> = {
  house: { roof: 'bg-amber-700', body: 'bg-amber-100', door: 'bg-amber-900', icon: '⌂', width: 92, height: 82 },
  cafe: { roof: 'bg-rose-700', body: 'bg-orange-100', door: 'bg-rose-950', icon: '☕', width: 104, height: 88 },
  library: { roof: 'bg-indigo-700', body: 'bg-stone-100', door: 'bg-indigo-950', icon: '📚', width: 112, height: 94 },
  market: { roof: 'bg-emerald-700', body: 'bg-yellow-100', door: 'bg-emerald-950', icon: '🏮', width: 108, height: 84 },
  school: { roof: 'bg-sky-700', body: 'bg-sky-100', door: 'bg-sky-950', icon: '✦', width: 118, height: 96 },
  sanctuary: { roof: 'bg-violet-700', body: 'bg-violet-100', door: 'bg-violet-950', icon: '✧', width: 112, height: 96 },
  workshop: { roof: 'bg-slate-700', body: 'bg-orange-100', door: 'bg-slate-950', icon: '⚒', width: 108, height: 88 },
};

const PROP_ICON: Record<WorldPropType, string> = { tree: '🌳', rock: '🪨', lamp: '🏮', bench: '🪑', fence: '▥', flower: '🌼', sign: '▰' };

export function WorldBuilding({ building, theme = 'emerald' }: { building: WorldBuildingDefinition; theme?: WorldTheme }) {
  const art = BUILDING_ART[building.type];
  const scale = building.scale ?? 1;
  const content = (
    <View style={{ width: art.width * scale, height: art.height * scale, alignItems: 'center' }}>
      <View style={{ position: 'absolute', bottom: 0, width: art.width * 0.86 * scale, height: 12 * scale, borderRadius: 10, backgroundColor: 'rgba(15,23,42,0.24)' }} />
      <View className={`absolute top-1 h-9 rounded-t-[30px] ${art.roof}`} style={{ width: art.width * 0.94 * scale }} />
      <View className={`absolute top-7 rounded-b-xl ${art.body}`} style={{ width: art.width * 0.82 * scale, height: art.height * 0.62 * scale }}>
        <View className="absolute left-2 top-3 h-5 w-5 rounded-sm bg-sky-300/80" />
        <View className="absolute right-2 top-3 h-5 w-5 rounded-sm bg-sky-300/80" />
        <View className={`absolute bottom-0 left-1/2 h-10 w-7 -translate-x-1/2 rounded-t-lg ${art.door}`} />
      </View>
      <View className="absolute top-10 items-center rounded-full bg-slate-950/20 px-2 py-1">
        <Text style={{ fontSize: 14 * scale }}>{art.icon}</Text>
      </View>
      {building.label && <Text className="absolute -bottom-3 rounded-full bg-slate-950/45 px-2 py-0.5 text-[8px] font-bold text-white/80">{building.label}</Text>}
    </View>
  );
  return (
    <Pressable disabled={!building.onPress} onPress={building.onPress} style={{ position: 'absolute', left: `${building.x}%`, top: `${building.y}%`, zIndex: Math.round(building.y * 10) }}>
      {content}
    </Pressable>
  );
}

export function WorldProp({ prop }: { prop: WorldPropDefinition }) {
  const scale = prop.scale ?? 1;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: `${prop.x}%`, top: `${prop.y}%`, zIndex: Math.round(prop.y * 10) }}>
      <View className="items-center justify-center" style={{ transform: [{ scale }] }}>
        <View className="absolute bottom-0 h-2 w-8 rounded-full bg-slate-950/20" />
        <Text style={{ fontSize: prop.type === 'tree' ? 34 : 24 }}>{PROP_ICON[prop.type]}</Text>
      </View>
    </View>
  );
}

export function WorldScene({ buildings, props, theme = 'emerald' }: { buildings: WorldBuildingDefinition[]; props: WorldPropDefinition[]; theme?: WorldTheme }) {
  return <View pointerEvents="box-none" className="absolute inset-0">{props.map(prop => <WorldProp key={prop.id} prop={prop} />)}{buildings.map(building => <WorldBuilding key={building.id} building={building} theme={theme} />)}</View>;
}
