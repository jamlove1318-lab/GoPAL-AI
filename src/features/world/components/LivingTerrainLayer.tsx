import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getLivingTerrainLayer } from '../data/livingWorldTerrain';

export function LivingTerrainLayer({ locationId = 'emerald-village' }: { locationId?: string }) {
  const terrain = getLivingTerrainLayer(locationId);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox="0 0 400 800"
        preserveAspectRatio="none"
      >
        {terrain.paths.map(path => (
          <Path
            key={path.id}
            d={path.path}
            fill="none"
            stroke={path.color ?? terrain.base ?? '#d5c391'}
            strokeWidth={path.width}
            opacity={path.opacity ?? 1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </View>
  );
}
