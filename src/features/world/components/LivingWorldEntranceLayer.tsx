import React, { useMemo } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { getWorldEntrances } from '../data/livingWorldEntrances';
import { getLivingLocationTemplate } from '../data/livingWorldCatalog';
import type { LivingWorldRuntime } from '../data/livingWorldRuntime';

/**
 * World-native entrance interaction.
 *
 * Entrances are physical scene entities, not navigation UI. Only canonical
 * materializable location/world targets receive a touch surface; interiors,
 * buildings and games remain available to their future domain systems.
 */
export function LivingWorldEntranceLayer({ runtime }: { runtime: LivingWorldRuntime }) {
  const { width, height } = useWindowDimensions();
  const entrances = useMemo(
    () => getWorldEntrances(runtime.getLocation().id).filter(entrance => {
      if (entrance.interactive === false || entrance.locked === true) return false;
      if (entrance.targetType !== 'location' && entrance.targetType !== 'world') return false;
      if (!entrance.targetId) return false;
      return getLivingLocationTemplate(entrance.targetId).id === entrance.targetId;
    }),
    [runtime, runtime.getLocation().id],
  );

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {entrances.map(entrance => {
        const size = Math.max(entrance.width ?? 12, 14);
        return (
          <Pressable
            key={entrance.id}
            accessibilityRole="button"
            accessibilityLabel={entrance.label ?? 'Travel'}
            onPress={() => {
              if (entrance.targetId) runtime.transitionToLocation(entrance.targetId, 'player', undefined, entrance.travelMode);
            }}
            style={[
              styles.hit,
              {
                left: `${entrance.x}%`,
                top: `${entrance.y}%`,
                width: `${size}%`,
                height: `${Math.max(size * (height / Math.max(width, 1)), 10)}%`,
                transform: [{ translateX: -width * size / 200 }, { translateY: -height * Math.max(size * (height / Math.max(width, 1)), 10) / 200 }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hit: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});
