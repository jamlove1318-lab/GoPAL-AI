import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Compass, LockKeyhole, MapPin, Sparkles, Users } from 'lucide-react-native';

export type WorldPlaceHotspot = {
  id: string;
  label: string;
  kind: 'landmark' | 'resident' | 'discovery' | 'path' | 'locked';
  x: number;
  y: number;
  enabled?: boolean;
  scenarioIds?: string[];
  nextHotspotId?: string;
};

const ICONS = { landmark: MapPin, resident: Users, discovery: Sparkles, path: Compass, locked: LockKeyhole } as const;

export function WorldPlaceHotspots({ hotspots, onSelect }: { hotspots: WorldPlaceHotspot[]; onSelect: (hotspot: WorldPlaceHotspot) => void }) {
  return <View className="absolute inset-0" pointerEvents="box-none">
    {hotspots.map((hotspot) => {
      const Icon = ICONS[hotspot.kind];
      const enabled = hotspot.enabled !== false && hotspot.kind !== 'locked';
      return <Pressable key={hotspot.id} disabled={!enabled} accessibilityRole="button" accessibilityLabel={`${hotspot.label}${enabled ? '' : ', locked'}`} onPress={() => onSelect(hotspot)} className="absolute items-center" style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}>
        <View className={`h-11 w-11 items-center justify-center rounded-full border ${enabled ? 'border-emerald-200/40 bg-emerald-950/70' : 'border-white/10 bg-black/55'}`}>
          <Icon size={17} color={enabled ? '#a7f3d0' : '#64748b'} />
        </View>
        <Text numberOfLines={1} className={`mt-1 max-w-28 rounded-full px-2 py-1 text-[10px] font-bold ${enabled ? 'bg-black/45 text-white' : 'bg-black/35 text-slate-500'}`}>{hotspot.label}</Text>
      </Pressable>;
    })}
  </View>;
}
