import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { WorldTheme } from '../data/livingWorldArt';
import { EmeraldValleyRealWorld } from './EmeraldValleyRealWorld';

/**
 * Emerald Valley now has a real-asset visual foundation.
 * The previous SVG landscape remains in the repository/history for later reuse,
 * but is no longer part of the active Emerald Valley visual composition.
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
    zIndex: 50,
    elevation: 50,
  },
});
