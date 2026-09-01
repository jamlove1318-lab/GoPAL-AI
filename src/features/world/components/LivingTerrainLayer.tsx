import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getLivingTerrainLayer } from '../data/livingWorldTerrain';

/**
 * Shared terrain renderer. Terrain remains data-driven so every future
 * location can reuse the same path/bridge/road primitives.
 */
export function LivingTerrainLayer({ locationId = 'emerald-village' }: { locationId?: string }) {
  const terrain = getLivingTerrainLayer(locationId);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="none">
        {terrain.paths.map(path => (
          <React.Fragment key={path.id}>
            {path.edgeColor && (path.edgeWidth ?? 0) > 0 && (
              <Path
                d={path.path}
                fill="none"
                stroke={path.edgeColor}
                strokeWidth={(path.width ?? 0) + (path.edgeWidth ?? 0) * 2}
                opacity={Math.min(1, (path.opacity ?? 1) * 0.8)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            <Path
              d={path.path}
              fill="none"
              stroke={path.color ?? terrain.base ?? '#d5c391'}
              strokeWidth={path.width}
              opacity={path.opacity ?? 1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}
