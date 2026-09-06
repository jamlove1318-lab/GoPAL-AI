import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import { buildingVariant, propScale, WORLD_PALETTES } from '../data/livingWorldArt';
import { worldDepth } from '../geometry/livingWorldGeometry';

export type WorldTheme = 'emerald' | 'sakura' | 'mountain' | 'coastal' | 'festival' | 'scifi';
export type WorldBuildingType =
  | 'house' | 'cafe' | 'library' | 'market' | 'school' | 'sanctuary' | 'workshop'
  | 'railway-station' | 'airport';
export type WorldPropType = 'tree' | 'rock' | 'lamp' | 'bench' | 'fence' | 'flower' | 'sign';

export type WorldBuildingDefinition = {
  id: string; type: WorldBuildingType; x: number; y: number; scale?: number; label?: string;
  interactionRadius?: number; collisionWidth?: number; collisionHeight?: number; onPress?: () => void;
};
export type WorldPropDefinition = { id: string; type: WorldPropType; x: number; y: number; scale?: number };

export function WorldBuilding({ building, theme = 'emerald' }: { building: WorldBuildingDefinition; theme?: WorldTheme }) {
  const art = buildingVariant(theme, building.type);
  const scale = building.scale ?? 1;
  const width = 128 * scale;
  const height = 112 * scale;
  const isTall = building.type === 'library' || building.type === 'school';
  return (
    <Pressable disabled={!building.onPress} onPress={building.onPress} style={{ position: 'absolute', left: `${building.x}%`, top: `${building.y}%`, zIndex: worldDepth(building.y, 20), width, height, marginLeft: -width / 2, marginTop: -height * 0.82 }}>
      <View style={{ position: 'absolute', left: width * .05, right: width * .05, bottom: 2 * scale, height: 15 * scale, borderRadius: 20, backgroundColor: '#0b1711', opacity: .32 }} />
      <Svg width={width} height={height} viewBox="0 0 128 112">
        <G>
          {building.type === 'railway-station' ? <>
            <Polygon points="8,48 64,12 120,48" fill={art.roof} />
            <Rect x="15" y="45" width="98" height="53" rx="4" fill={art.wall} />
            <Rect x="28" y="54" width="72" height="44" rx="3" fill={art.accent} opacity={.72} />
            <Rect x="42" y="59" width="16" height="15" rx="2" fill={art.window} />
            <Rect x="61" y="59" width="16" height="15" rx="2" fill={art.window} />
            <Path d="M20 79H108" stroke={art.trim} strokeWidth="3" />
            <Line x1="20" y1="96" x2="108" y2="96" stroke="#4a4944" strokeWidth="4" />
            <Line x1="17" y1="102" x2="111" y2="102" stroke="#4a4944" strokeWidth="4" />
            <Rect x="43" y="17" width="42" height="10" rx="2" fill={art.accent} />
          </> : building.type === 'airport' ? <>
            <Path d="M12 51Q28 22 64 16Q100 22 116 51V96H12Z" fill={art.wall} />
            <Path d="M20 50Q30 30 64 23Q98 30 108 50" fill={art.roof} />
            <Rect x="25" y="53" width="78" height="42" rx="4" fill={art.window} opacity={.9} />
            <Line x1="42" y1="53" x2="42" y2="95" stroke={art.trim} strokeWidth="3" />
            <Line x1="64" y1="53" x2="64" y2="95" stroke={art.trim} strokeWidth="3" />
            <Line x1="86" y1="53" x2="86" y2="95" stroke={art.trim} strokeWidth="3" />
            <Rect x="49" y="15" width="30" height="9" rx="2" fill={art.accent} />
            <Line x1="64" y1="7" x2="64" y2="15" stroke={art.trim} strokeWidth="2" />
            <Circle cx="64" cy="5" r="3" fill={art.trim} />
          </> : building.type === 'market' ? <>
            <Path d="M9 49L64 14L119 49Z" fill={art.roof} />
            <Rect x="12" y="47" width="104" height="49" rx="3" fill={art.wall} />
            <Path d="M12 48Q25 25 38 48Q51 25 64 48Q77 25 90 48Q103 25 116 48" fill="none" stroke={art.trim} strokeWidth="8" />
            <Rect x="20" y="57" width="88" height="10" rx="3" fill={art.accent} />
            <Rect x="24" y="72" width="18" height="20" rx="2" fill={art.window} />
            <Rect x="55" y="72" width="18" height="20" rx="2" fill={art.window} />
            <Rect x="86" y="72" width="18" height="20" rx="2" fill={art.window} />
          </> : building.type === 'cafe' ? <>
            <Polygon points="15,48 64,15 113,48" fill={art.roof} />
            <Rect x="18" y="46" width="92" height="51" rx="10" fill={art.wall} />
            <Rect x="25" y="54" width="28" height="27" rx="5" fill={art.window} stroke={art.trim} strokeWidth="2" />
            <Rect x="75" y="54" width="28" height="27" rx="5" fill={art.window} stroke={art.trim} strokeWidth="2" />
            <Path d="M54 97V68Q64 57 74 68V97Z" fill={art.accent} />
            <Circle cx="64" cy="28" r="8" fill={art.accent} />
            <Path d="M58 28H70M64 22V34" stroke={art.trim} strokeWidth="2" />
            <Path d="M34 88Q39 82 44 88M84 88Q89 82 94 88" fill="none" stroke={art.trim} strokeWidth="2" />
          </> : building.type === 'workshop' ? <>
            <Polygon points="10,50 64,18 118,50" fill={art.roof} />
            <Rect x="15" y="47" width="98" height="50" rx="3" fill={art.wall} />
            <Rect x="24" y="58" width="29" height="28" rx="2" fill={art.window} />
            <Rect x="58" y="57" width="44" height="39" rx="2" fill={art.accent} opacity={.65} />
            <Path d="M68 66H92M68 75H92M68 84H92" stroke={art.trim} strokeWidth="3" />
            <Path d="M19 49H109" stroke={art.trim} strokeWidth="4" />
          </> : building.type === 'sanctuary' ? <>
            <Path d="M13 49L64 12L115 49Z" fill={art.roof} />
            <Rect x="17" y="46" width="94" height="52" rx="5" fill={art.wall} />
            <Rect x="52" y="57" width="24" height="41" rx="12" fill={art.accent} />
            <Circle cx="64" cy="25" r="8" fill={art.window} />
            <Path d="M64 10V30M55 20H73" stroke={art.trim} strokeWidth="2" />
            <Path d="M25 62Q32 51 39 62V78Q32 87 25 78Z" fill={art.window} />
            <Path d="M89 62Q96 51 103 62V78Q96 87 89 78Z" fill={art.window} />
          </> : <>
            <Polygon points={isTall ? '18,42 64,8 110,42' : '10,49 64,10 118,49'} fill={art.roof} />
            <Polygon points="18,48 64,17 110,48" fill={art.trim} opacity={.45} />
            <Rect x={isTall ? 24 : 18} y="46" width={isTall ? 80 : 92} height={isTall ? 55 : 55} rx="7" fill={art.wall} />
            <Rect x={isTall ? 30 : 25} y="54" width="22" height="19" rx="3" fill={art.window} stroke={art.trim} strokeWidth="2" />
            <Rect x={isTall ? 76 : 81} y="54" width="22" height="19" rx="3" fill={art.window} stroke={art.trim} strokeWidth="2" />
            <Path d="M54 101V70Q64 59 74 70V101Z" fill={art.accent} />
            {building.type === 'school' ? <G><Rect x="46" y="23" width="36" height="9" rx="3" fill={art.accent} /><Path d="M52 27H76" stroke={art.trim} strokeWidth="2" /></G> : null}
            {building.type === 'library' ? <Path d="M34 78V50M45 78V50M83 78V50M94 78V50" stroke={art.trim} strokeWidth="3" opacity={.7} /> : null}
          </>}
        </G>
      </Svg>
    </Pressable>
  );
}

export function WorldProp({ prop, theme = 'emerald' }: { prop: WorldPropDefinition; theme?: WorldTheme }) {
  const scale = (prop.scale ?? 1) * propScale(prop.type);
  const palette = WORLD_PALETTES[theme];
  return <View pointerEvents="none" style={{ position: 'absolute', left: `${prop.x}%`, top: `${prop.y}%`, zIndex: worldDepth(prop.y, 10), transform: [{ scale }] }}>
    <Svg width={42} height={52} viewBox="0 0 42 52">
      <G>
        <Ellipse cx="21" cy="48" rx="14" ry="3" fill="#0b1711" opacity={.3} />
        {prop.type === 'tree' ? <G><Path d="M18 45V29" stroke="#654b37" strokeWidth="7" /><Circle cx="21" cy="21" r="14" fill={palette.accent} /><Circle cx="12" cy="26" r="9" fill={palette.groundDark} /><Circle cx="30" cy="26" r="9" fill={palette.accent} /></G> : null}
        {prop.type === 'rock' ? <G><Polygon points="5,43 11,28 29,25 38,39 31,48 12,47" fill="#777b76" /><Path d="M11 35L28 30" stroke="#a4aaa3" strokeWidth="3" opacity={.7} /></G> : null}
        {prop.type === 'lamp' ? <G><Path d="M21 47V13" stroke="#37433f" strokeWidth="4" /><Path d="M13 14Q21 6 29 14L26 21H16Z" fill={palette.trim} /><Circle cx="21" cy="17" r="5" fill="#ffe6a8" opacity={.9} /></G> : null}
        {prop.type === 'bench' ? <G><Rect x="7" y="27" width="28" height="7" rx="2" fill="#795744" /><Rect x="10" y="36" width="22" height="6" rx="2" fill="#634936" /><Line x1="11" y1="42" x2="9" y2="49" stroke="#3c332c" strokeWidth="3" /><Line x1="31" y1="42" x2="33" y2="49" stroke="#3c332c" strokeWidth="3" /></G> : null}
        {prop.type === 'flower' ? <G><Path d="M21 47V27" stroke="#3c754b" strokeWidth="3" /><Circle cx="21" cy="23" r="5" fill="#f0a7b9" /><Circle cx="15" cy="26" r="4" fill="#f5c2cf" /><Circle cx="27" cy="26" r="4" fill="#f5c2cf" /><Circle cx="21" cy="27" r="3" fill="#f3d26f" /></G> : null}
        {prop.type === 'fence' ? <G><Line x1="7" y1="15" x2="7" y2="47" stroke="#765d46" strokeWidth="4" /><Line x1="35" y1="15" x2="35" y2="47" stroke="#765d46" strokeWidth="4" /><Line x1="5" y1="23" x2="37" y2="23" stroke="#765d46" strokeWidth="4" /><Line x1="5" y1="35" x2="37" y2="35" stroke="#765d46" strokeWidth="4" /></G> : null}
        {prop.type === 'sign' ? <G><Path d="M21 47V20" stroke="#5a4637" strokeWidth="4" /><Rect x="6" y="11" width="30" height="13" rx="3" fill={palette.trim} /></G> : null}
      </G>
    </Svg>
  </View>;
}

export function WorldScene({ buildings, props, theme = 'emerald' }: { buildings: WorldBuildingDefinition[]; props: WorldPropDefinition[]; theme?: WorldTheme }) {
  return <View pointerEvents="box-none" style={{ position: 'absolute', inset: 0 }}>
    {props.map(prop => <WorldProp key={prop.id} prop={prop} theme={theme} />)}
    {buildings.map(building => <WorldBuilding key={building.id} building={building} theme={theme} />)}
  </View>;
}