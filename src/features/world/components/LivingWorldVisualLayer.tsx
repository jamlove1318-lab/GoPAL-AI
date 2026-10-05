import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { WorldTheme } from '../data/livingWorldArt';
import { EmeraldValleyRealWorld } from './EmeraldValleyRealWorld';

/**
 * Canonical Emerald Valley visual surface.
 *
 * The legacy SVG/2D world systems remain in the repository for later reuse,
 * but this layer deliberately sits above them so they cannot leak into the
 * active Emerald Valley composition.
 */
export function LivingWorldVisualLayer({ theme = 'emerald' }: { theme?: WorldTheme; time?: 'morning' | 'afternoon' | 'evening' | 'night' }) {
  if (theme !== 'emerald') return <View pointerEvents="none" style={StyleSheet.absoluteFill} />;

  return (
    <View pointerEvents="none" style={styles.activeLayer}>
      <EmeraldValleyRealWorld />
    </View>
  );
}

const styles = StyleSheet.create({
  activeLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100000,
    elevation: 100000,
  },
});
