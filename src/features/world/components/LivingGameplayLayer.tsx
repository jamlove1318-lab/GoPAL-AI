import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Polygon, Rect } from 'react-native-svg';
import {
  getLocationGameplay,
  type WorldGameplayDefinition,
  type WorldGameplayKind,
} from '../data/livingWorldGameplay';
import { worldDepth } from '../geometry/livingWorldGeometry';

type Props = {
  locationId?: string;
  visibleKinds?: WorldGameplayKind[];
};

export function LivingGameplayLayer({
  locationId = 'emerald-village',
  visibleKinds,
}: Props) {
  const objects = getLocationGameplay(locationId).filter(
    (item) => !visibleKinds || visibleKinds.includes(item.kind),
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {objects.map((object) => (
        <GameplayObject key={object.id} object={object} />
      ))}
    </View>
  );
}

function GameplayObject({ object }: { object: WorldGameplayDefinition }) {
  const size = Math.max(24, (object.scale ?? 1) * 34);

  return (
    <View
      style={[
        styles.object,
        {
          left: `${object.x}%`,
          top: `${object.y}%`,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          zIndex: worldDepth(object.y, 35),
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 30 30">
        <G>
          {renderGameplayGraphic(object)}
        </G>
      </Svg>
      {object.label ? <Text style={styles.label}>{object.label}</Text> : null}
    </View>
  );
}

function renderGameplayGraphic(object: WorldGameplayDefinition) {
  switch (object.kind) {
    case 'spawn':
      return (
        <G>
          <Circle cx="15" cy="15" r="10" fill="none" stroke="#a7f3d0" strokeWidth="2" />
          <Circle cx="15" cy="15" r="3" fill="#6ee7b7" />
        </G>
      );
    case 'checkpoint':
      return (
        <G>
          <Path d="M7 24V6M8 7Q15 3 23 8V18Q15 14 8 18Z" fill="#f8fafc" />
          <Circle cx="8" cy="24" r="2" fill="#fbbf24" />
        </G>
      );
    case 'collectible':
      return (
        <G>
          <Path d="M15 3L19 11L27 12L21 18L23 26L15 22L7 26L9 18L3 12L11 11Z" fill="#fcd34d" />
          <Circle cx="12" cy="12" r="2" fill="#fff7ed" />
        </G>
      );
    case 'quest-marker':
      return (
        <G>
          <Circle cx="15" cy="15" r="11" fill="#7c3aed" />
          <Circle cx="15" cy="12" r="3" fill="#fff" />
          <Path d="M12 19Q15 22 18 19" fill="none" stroke="#fff" strokeWidth="2" />
        </G>
      );
    case 'save-point':
      return (
        <G>
          <Circle cx="15" cy="15" r="11" fill="#0f766e" />
          <Rect x="9" y="8" width="12" height="14" rx="2" fill="#ecfeff" />
          <Rect x="11" y="10" width="8" height="4" fill="#0f766e" />
        </G>
      );
    case 'puzzle':
      return (
        <G>
          <Rect x="5" y="5" width="20" height="20" rx="4" fill="#334155" />
          <Path d="M10 10H20M10 15H20M10 20H17" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
        </G>
      );
    case 'portal':
    case 'teleporter':
      return (
        <G>
          <Circle cx="15" cy="15" r="11" fill="none" stroke="#c084fc" strokeWidth="4" />
          <Circle cx="15" cy="15" r="5" fill="#7e22ce" />
        </G>
      );
    case 'door':
      return (
        <G>
          <Rect x="7" y="4" width="16" height="22" rx="2" fill="#765844" />
          <Circle cx="19" cy="16" r="2" fill="#f5cf78" />
        </G>
      );
    case 'switch':
    case 'lever':
    case 'button':
    case 'pressure-plate':
      return (
        <G>
          <Rect x="6" y="10" width="18" height="12" rx="3" fill="#475569" />
          <Circle cx="15" cy="16" r="4" fill="#f59e0b" />
        </G>
      );
    case 'shop':
      return (
        <G>
          <Path d="M5 11H25L22 6H8Z" fill="#efb35f" />
          <Rect x="7" y="11" width="16" height="13" rx="2" fill="#8b5e45" />
          <Path d="M11 14V24M19 14V24" stroke="#f0d09b" strokeWidth="2" />
        </G>
      );
    case 'chest':
    case 'loot-container':
      return (
        <G>
          <Rect x="5" y="11" width="20" height="14" rx="3" fill="#8b5e3c" />
          <Path d="M5 14H25" stroke="#e9c46a" strokeWidth="3" />
          <Rect x="13" y="14" width="4" height="5" fill="#f7d36b" />
        </G>
      );
    case 'hazard':
      return (
        <G>
          <Polygon points="15,3 28,26 2,26" fill="#ef4444" />
          <Path d="M15 10V18" stroke="#fff" strokeWidth="3" />
          <Circle cx="15" cy="22" r="2" fill="#fff" />
        </G>
      );
    case 'trigger':
      return <Circle cx="15" cy="15" r="10" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="3 3" />;
    case 'game-start':
      return <Polygon points="8,5 25,15 8,25" fill="#34d399" />;
    case 'game-over':
      return (
        <G>
          <Path d="M7 7L23 23M23 7L7 23" stroke="#f87171" strokeWidth="4" />
        </G>
      );
    case 'key':
      return (
        <G>
          <Circle cx="10" cy="12" r="5" fill="none" stroke="#fcd34d" strokeWidth="3" />
          <Path d="M14 15L24 25M19 20L23 16" stroke="#fcd34d" strokeWidth="3" />
        </G>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  object: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    top: '100%',
    marginTop: 2,
    color: '#e2e8f0',
    fontSize: 7,
    fontWeight: '800',
    textAlign: 'center',
    width: 100,
  },
});
