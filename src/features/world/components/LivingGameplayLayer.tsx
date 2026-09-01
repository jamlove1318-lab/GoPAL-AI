import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { getLocationGameplay, WorldGameplayDefinition, WorldGameplayKind } from '../data/livingWorldGameplay';
import { worldDepth } from '../geometry/livingWorldGeometry';

type Props = { locationId?: string; visibleKinds?: WorldGameplayKind[] };

/** Shared physical markers for gameplay objects. Keep these lightweight; game-specific visuals can replace them later. */
export function LivingGameplayLayer({ locationId = 'emerald-village', visibleKinds }: Props) {
  const objects = getLocationGameplay(locationId).filter(item => !visibleKinds || visibleKinds.includes(item.kind));
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {objects.map(object => <GameplayObject key={object.id} object={object} />)}
  </View>;
}

function GameplayObject({ object }: { object: WorldGameplayDefinition }) {
  const size = Math.max(22, (object.scale ?? 1) * 30);
  return <View style={[styles.object, { left: `${object.x}%`, top: `${object.y}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, zIndex: worldDepth(object.y, 35) }]}>
    <Svg width={size} height={size} viewBox="0 0 30 30">
      {object.kind === 'spawn' && <><Circle cx="15" cy="15" r="10" fill="none" stroke="#a7f3d0" strokeWidth="2" opacity=".8"/><Circle cx="15" cy="15" r="3" fill="#6ee7b7"/></>}
      {object.kind === 'checkpoint' && <><Path d="M7 24V6M8 7Q15 3 23 8V18Q15 14 8 18Z" fill="#f8fafc" opacity=".9"/><Circle cx="8" cy="24" r="2" fill="#fbbf24"/></>}
      {object.kind === 'collectible' && <><Path d="M15 3L19 11L27 12L21 18L23 26L15 22L7 26L9 18L3 12L11 11Z" fill="#fcd34d"/><Circle cx="12" cy="12" r="2" fill="#fff7ed"/></>}
      {object.kind === 'quest-marker' && <><Circle cx="15" cy="15" r="11" fill="#7c3aed" opacity=".9"/><TextGlyph /></>}
      {object.kind === 'save-point' && <><Circle cx="15" cy="15" r="10" fill="#0f766e" opacity=".9"/><Rect x="9" y="8" width="12" height="14" rx="2" fill="#ecfeff"/><Rect x="11" y="10" width="8" height="4" fill="#0f766e"/></>}
      {object.kind === 'puzzle' && <><Rect x="5" y="5" width="20" height="20" rx="4" fill="#334155"/><Path d="M10 10H20M10 15H20M10 20H17" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round"/></>}
      {object.kind === 'portal' && <><Circle cx="15" cy="15" r="11" fill="none" stroke="#c084fc" strokeWidth="4"/><Circle cx="15" cy="15" r="5" fill="#7e22ce"/></>}
    </Svg>
    {object.label && <Text style={styles.label}>{object.label}</Text>}
  </View>;
}

function TextGlyph() { return <Circle cx="15" cy="15" r="3" fill="#fff"/>; }

const styles = StyleSheet.create({
  object: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  label: { position: 'absolute', top: '100%', marginTop: 2, color: '#e2e8f0', fontSize: 7, fontWeight: '800', textAlign: 'center', width: 90 },
});
