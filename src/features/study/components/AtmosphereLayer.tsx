import React from 'react';
import { View } from 'react-native';
import type { Season, TimeOfDay } from '../../../lib/types';

export function AtmosphereLayer({ season, timeOfDay }: { season: Season; timeOfDay: TimeOfDay }) {
  // Determine ambient background colors based on world state
  let bgClass = 'bg-slate-900';

  if (timeOfDay === 'morning') {
    bgClass = season === 'spring' ? 'bg-amber-950/20' : 'bg-sky-950/20';
  } else if (timeOfDay === 'afternoon') {
    bgClass = season === 'autumn' ? 'bg-orange-950/30' : 'bg-emerald-950/20';
  } else if (timeOfDay === 'evening') {
    bgClass = 'bg-indigo-950/40';
  } else if (timeOfDay === 'night') {
    bgClass = 'bg-slate-950/80';
  }

  return (
    <View
      pointerEvents="none"
      className={`absolute inset-0 ${bgClass}`}
    />
  );
}

