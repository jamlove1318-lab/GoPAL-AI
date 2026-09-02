import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LivingWorldRuntime } from '../data/livingWorldRuntime';
import { LivingSimulationActorLayer } from './LivingSimulationActorLayer';

/**
 * Compatibility wrapper. The canonical runtime simulation is the source of
 * truth for vehicle motion; this legacy entry point no longer runs a second
 * independent animation loop.
 */
export function LivingVehicleLayer({ locationId = 'emerald-village', runtime }: { locationId?: string; runtime?: LivingWorldRuntime }) {
  if (!runtime) return <View pointerEvents="none" style={StyleSheet.absoluteFill} />;
  return <LivingSimulationActorLayer runtime={runtime} showVehicles />;
}
