import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getLivingWorldTransport } from '../data/livingWorldTransport';

export function LivingTransportLayer({ locationId = 'emerald-village' }: { locationId?: string }) {
  const networks = getLivingWorldTransport(locationId);
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="none">
      {networks.flatMap(network => network.features.map(feature => <React.Fragment key={feature.id}>
        {feature.edgeColor && <Path d={feature.path} fill="none" stroke={feature.edgeColor} strokeWidth={feature.width + (feature.edgeWidth ?? 0) * 2} opacity={feature.opacity ?? 1} strokeLinecap="round" strokeLinejoin="round" />}
        <Path d={feature.path} fill="none" stroke={feature.color ?? '#667085'} strokeWidth={feature.width} opacity={feature.opacity ?? 1} strokeLinecap="round" strokeLinejoin="round" />
      </React.Fragment>))}
    </Svg>
  </View>;
}
