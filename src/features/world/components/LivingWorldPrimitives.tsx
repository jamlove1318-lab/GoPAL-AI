import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import { buildingVariant, propScale, WORLD_PALETTES } from '../data/livingWorldArt';
import { worldDepth } from '../geometry/livingWorldGeometry';

export type WorldTheme = 'emerald' | 'sakura' | 'mountain' | 'coastal' | 'festival';
export type WorldBuildingType =
  | 'house'
  | 'cafe'
  | 'library'
  | 'market'
  | 'school'
  | 'sanctuary'
  | 'workshop'
  | 'railway-station'
  | 'airport';
export type WorldPropType = 'tree' | 'rock' | 'lamp' | 'bench' | 'fence' | 'flower' | 'sign';

export type WorldBuildingDefinition = {
  id: string;
  type: WorldBuildingType;
  x: number;
  y: number;
  scale?: number;
  label?: string;
  interactionRadius?: number;
  collisionWidth?: number;
  collisionHeight?: number;
  onPress?: () => void;
};

export type WorldPropDefinition = {
  id: string;
  type: WorldPropType;
  x: number;
  y: number;
  scale?: number;
};

export function WorldBuilding({
  building,
  theme = 'emerald',
}: {
  building: WorldBuildingDefinition;
  theme?: WorldTheme;
}) {
  const art = buildingVariant(theme, building.type);
  const scale = building.scale ?? 1;
  const width = 128 * scale;
  const height = 112 * scale;

  return (
    <Pressable
      disabled={!building.onPress}
      onPress={building.onPress}
      style={{
        position: 'absolute',
        left: `${building.x}%`,
        top: `${building.y}%`,
        zIndex: worldDepth(building.y, 20),
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height * 0.82,
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: width * 0.05,
          right: width * 0.05,
          bottom: 2 * scale,
          height: 15 * scale,
          borderRadius: 20,
          backgroundColor: '#0b1711',
          opacity: 0.32,
        }}
      />
      <Svg width={width} height={height} viewBox="0 0 128 112">
        <G>
          <Polygon points="10,49 64,10 118,49" fill={art.roof} />
          <Polygon points="18,48 64,17 110,48" fill={art.trim} opacity={0.45} />
          <Rect x="18" y="46" width="92" height="55" rx="7" fill={art.wall} />
          <Rect x="25" y="54" width="22" height="19" rx="3" fill={art.window} stroke={art.trim} strokeWidth="2" />
          <Rect x="81" y="54" width="22" height="19" rx="3" fill={art.window} stroke={art.trim} strokeWidth="2" />
          <Path d="M54 101V70Q64 59 74 70V101Z" fill={art.accent} />
          <Rect x="57" y="82" width="14" height="4" rx="2" fill={art.trim} opacity={0.8} />
          <Path d="M19 48H109" stroke="#24332b" strokeWidth="3" opacity={0.5} />
          <Circle cx="64" cy="31" r="7" fill={art.window} opacity={0.45} />
          {building.type === 'school' ? (
            <G>
              <Rect x="46" y="23" width="36" height="9" rx="3" fill={art.accent} />
              <Path d="M52 27H76" stroke={art.trim} strokeWidth="2" />
            </G>
          ) : null}
          {building.type === 'library' ? (
            <Path d="M34 78V50M45 78V50M83 78V50M94 78V50" stroke={art.trim} strokeWidth="3" opacity={0.7} />
          ) : null}
          {building.type === 'market' ? (
            <Path
              d="M18 48Q30 23 42 48Q54 23 66 48Q78 23 90 48Q102 23 110 48"
              fill="none"
              stroke={art.trim}
              strokeWidth="7"
            />
          ) : null}
          {building.type === 'railway-station' ? (
            <G>
              <Rect x="42" y="18" width="44" height="10" rx="2" fill={art.accent} />
              <Line x1="28" y1="95" x2="100" y2="95" stroke="#4a4944" strokeWidth="4" />
              <Line x1="25" y1="101" x2="103" y2="101" stroke="#4a4944" strokeWidth="4" />
            </G>
          ) : null}
          {building.type === 'airport' ? (
            <G>
              <Rect x="48" y="18" width="32" height="22" rx="3" fill={art.accent} />
              <Line x1="64" y1="10" x2="64" y2="18" stroke={art.trim} strokeWidth="2" />
              <Circle cx="64" cy="8" r="3" fill={art.trim} />
            </G>
          ) : null}
        </G>
      </Svg>
      {building.label ? (
        <Text
          style={{
            position: 'absolute',
            bottom: -14 * scale,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 8 * scale,
            fontWeight: '800',
            color: '#fff',
            backgroundColor: 'rgba(15,23,42,.48)',
            paddingHorizontal: 5,
            borderRadius: 8,
          }}
        >
          {building.label}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function WorldProp({
  prop,
  theme = 'emerald',
}: {
  prop: WorldPropDefinition;
  theme?: WorldTheme;
}) {
  const scale = (prop.scale ?? 1) * propScale(prop.type);
  const palette = WORLD_PALETTES[theme];

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: `${prop.x}%`,
        top: `${prop.y}%`,
        zIndex: worldDepth(prop.y, 10),
        transform: [{ scale }],
      }}
    >
      <Svg width={42} height={52} viewBox="0 0 42 52">
        <G>
          <Ellipse cx="21" cy="48" rx="14" ry="3" fill="#0b1711" opacity={0.3} />
          {prop.type === 'tree' ? (
            <G>
              <Path d="M18 45V29" stroke="#654b37" strokeWidth="7" />
              <Circle cx="21" cy="21" r="14" fill={palette.accent} />
              <Circle cx="12" cy="26" r="9" fill={palette.groundDark} />
              <Circle cx="30" cy="26" r="9" fill={palette.accent} />
            </G>
          ) : null}
          {prop.type === 'rock' ? (
            <G>
              <Polygon points="5,43 11,28 29,25 38,39 31,48 12,47" fill="#777b76" />
              <Path d="M11 35L28 30" stroke="#a4aaa3" strokeWidth="3" opacity={0.7} />
            </G>
          ) : null}
          {prop.type === 'lamp' ? (
            <G>
              <Path d="M21 47V13" stroke="#37433f" strokeWidth="4" />
              <Path d="M13 14Q21 6 29 14L26 21H16Z" fill={palette.trim} />
              <Circle cx="21" cy="17" r="5" fill="#ffe6a8" opacity={0.9} />
            </G>
          ) : null}
          {prop.type === 'bench' ? (
            <G>
              <Rect x="7" y="27" width="28" height="7" rx="2" fill="#795744" />
              <Rect x="10" y="36" width="22" height="6" rx="2" fill="#634936" />
              <Line x1="11" y1="42" x2="9" y2="49" stroke="#3c332c" strokeWidth="3" />
              <Line x1="31" y1="42" x2="33" y2="49" stroke="#3c332c" strokeWidth="3" />
            </G>
          ) : null}
          {prop.type === 'flower' ? (
            <G>
              <Path d="M21 47V27" stroke="#3c754b" strokeWidth="3" />
              <Circle cx="21" cy="23" r="5" fill="#f0a7b9" />
              <Circle cx="15" cy="26" r="4" fill="#f5c2cf" />
              <Circle cx="27" cy="26" r="4" fill="#f5c2cf" />
              <Circle cx="21" cy="27" r="3" fill="#f3d26f" />
            </G>
          ) : null}
          {prop.type === 'fence' ? (
            <G>
              <Line x1="7" y1="15" x2="7" y2="47" stroke="#765d46" strokeWidth="4" />
              <Line x1="35" y1="15" x2="35" y2="47" stroke="#765d46" strokeWidth="4" />
              <Line x1="5" y1="23" x2="37" y2="23" stroke="#765d46" strokeWidth="4" />
              <Line x1="5" y1="35" x2="37" y2="35" stroke="#765d46" strokeWidth="4" />
            </G>
          ) : null}
          {prop.type === 'sign' ? (
            <G>
              <Path d="M21 47V20" stroke="#5a4637" strokeWidth="4" />
              <Rect x="6" y="11" width="30" height="13" rx="3" fill={palette.trim} />
            </G>
          ) : null}
        </G>
      </Svg>
    </View>
  );
}

export function WorldScene({
  buildings,
  props,
  theme = 'emerald',
}: {
  buildings: WorldBuildingDefinition[];
  props: WorldPropDefinition[];
  theme?: WorldTheme;
}) {
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', inset: 0 }}>
      {props.map((prop) => (
        <WorldProp key={prop.id} prop={prop} theme={theme} />
      ))}
      {buildings.map((building) => (
        <WorldBuilding key={building.id} building={building} theme={theme} />
      ))}
    </View>
  );
}
