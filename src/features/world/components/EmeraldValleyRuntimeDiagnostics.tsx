import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Development-only visual diagnostics for the real Emerald Valley renderer.
 * This is intentionally tiny and can be removed/archived after device
 * verification. It helps distinguish a renderer-loading failure from an
 * old-world render leak without changing the world composition.
 */
export function EmeraldValleyRuntimeDiagnostics() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!__DEV__ || !mounted) return null;

  return (
    <View pointerEvents="none" style={styles.badge}>
      <Text style={styles.text}>EMERALD VALLEY • REAL WORLD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 200000,
    elevation: 200000,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
});
