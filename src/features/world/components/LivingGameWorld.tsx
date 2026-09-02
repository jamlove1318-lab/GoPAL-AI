import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import { buildWorldLocation } from '../data/livingWorldLocationFactory';
import type { WorldObjectDefinition } from '../data/livingWorldObjects';
import { LivingTerrainLayer } from './LivingTerrainLayer';
import { LivingTransportLayer } from './LivingTransportLayer';
import { LivingInfrastructureLayer } from './LivingInfrastructureLayer';
import { LivingGameplayLayer } from './LivingGameplayLayer';
import { LivingVehicleLayer } from './LivingVehicleLayer';
import { WorldProp } from './LivingWorldPrimitives';
import { worldDepth } from '../geometry/livingWorldGeometry';

export type GameWorldBuildingId = string;
export type GameWorldBuilding = {
  id: GameWorldBuildingId;
  type?: string;
  x: number;
  y: number;
  scale?: number;
  onPress?: () => void;
  interactionRadius?: number;
  collisionWidth?: number;
  collisionHeight?: number;
};

/** Legacy compatibility export. The source of truth is now the canonical world object stream. */
const EMERALD_OBJECTS = buildWorldLocation('emerald-village').objects;
export const LIVING_BUILDINGS: GameWorldBuilding[] = EMERALD_OBJECTS
  .filter(object => object.category === 'building')
  .map(object => canonicalBuilding(object));

function canonicalBuilding(object: WorldObjectDefinition): GameWorldBuilding {
  return {
    id: object.id,
    type: String(object.type),
    x: object.transform.x,
    y: object.transform.y,
    scale: object.transform.scale,
    interactionRadius: object.interaction?.radius,
    collisionWidth: object.collision?.width,
    collisionHeight: object.collision?.height,
  };
}

function canonicalProp(object: WorldObjectDefinition): { id:string; type:'tree'|'rock'|'lamp'|'bench'|'fence'|'flower'|'sign'; x:number; y:number; scale?:number } | null {
  if (!['nature', 'prop'].includes(object.category)) return null;
  const type = String(object.type);
  if (!['tree','rock','lamp','bench','fence','flower','sign'].includes(type)) return null;
  return { id: object.id, type: type as 'tree'|'rock'|'lamp'|'bench'|'fence'|'flower'|'sign', x: object.transform.x, y: object.transform.y, scale: object.transform.scale };
}

export function LivingGameWorld({ children, buildings, time = 'afternoon', locationId = 'emerald-village' }: {
  children?: ReactNode;
  buildings?: GameWorldBuilding[];
  time?: 'morning'|'afternoon'|'evening'|'night';
  locationId?: string;
}) {
  const motion = useRef(new Animated.Value(0)).current;
  const location = useMemo(() => buildWorldLocation(locationId), [locationId]);
  const canonicalBuildings = useMemo(() => location.objects.filter(object => object.category === 'building').map(canonicalBuilding), [location]);
  const canonicalProps = useMemo(() => location.objects.map(canonicalProp).filter((prop): prop is NonNullable<ReturnType<typeof canonicalProp>> => prop !== null), [location]);
  const renderBuildings = buildings ?? canonicalBuildings;

  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(motion, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    a.start(); return () => a.stop();
  }, [motion]);

  const night = time === 'night';
  const evening = time === 'evening';
  return <View style={styles.root}>
    <View style={[styles.ground, { backgroundColor: night ? '#142725' : evening ? '#53684f' : time === 'morning' ? '#789d69' : '#668b5d' }]} />

    <LivingTerrainLayer locationId={location.id} />
    <LivingTransportLayer locationId={location.id} />
    <LivingInfrastructureLayer locationId={location.id} />

    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="none" pointerEvents="none">
      <Path d="M0 125Q100 60 205 105T400 80V0H0Z" fill={night ? '#14283b' : '#9ac2b9'} opacity=".34" />
      <Path d="M0 0H400V800H0Z" fill={night ? '#081521' : evening ? '#473a52' : '#ffffff'} opacity={night ? '.20' : evening ? '.08' : '.015'} />
    </Svg>

    {/* Static physical props now come from the canonical object stream. */}
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {canonicalProps.map(prop => <WorldProp key={prop.id} prop={prop} theme={location.theme} />)}
    </View>
    {renderBuildings.map(building => <PhysicalBuilding key={building.id} building={building} night={night} />)}

    <LivingGameplayLayer locationId={location.id} />
    <LivingVehicleLayer locationId={location.id} />

    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>{children}</View>
  </View>;
}

function PhysicalBuilding({ building, night }: { building: GameWorldBuilding; night: boolean }) {
  const s = building.scale ?? 1; const w = 150*s;
  return <Pressable disabled={!building.onPress} onPress={building.onPress} style={{position:'absolute',left:`${building.x}%`,top:`${building.y}%`,width:w,height:w,marginLeft:-w/2,marginTop:-w*.75,zIndex:worldDepth(building.y,20)}}>
    <View style={{position:'absolute',left:18*s,right:18*s,bottom:8*s,height:24*s,borderRadius:40,backgroundColor:'#15231c',opacity:.4}} />
    <BuildingArt id={building.id} type={building.type} night={night} s={s} />
  </Pressable>;
}

function BuildingArt({ id, type, night, s }: { id: string; type?: string; night: boolean; s: number }) {
  const win = night ? '#ffd477' : '#b9d9d2'; const p = { width:150*s, height:125*s };
  const visualId = ['sanctuary','cafe','library','market','garden'].includes(id) ? id : type;
  if(visualId==='cafe') return <Svg {...p} viewBox="0 0 150 125"><Polygon points="14,59 75,14 136,59" fill="#4b302c"/><Polygon points="20,55 75,19 130,55" fill="#c56b50"/><Path d="M20 55H130V108H20Z" fill="#9b5b43"/><Path d="M24 55H126" stroke="#e2a071" strokeWidth="3"/><Rect x="38" y="64" width="23" height="24" rx="3" fill={win}/><Rect x="89" y="64" width="23" height="24" rx="3" fill={win}/><Path d="M65 108V78Q75 68 85 78V108Z" fill="#33282a"/><Path d="M112 39Q124 31 128 19" stroke="#d7e0d9" strokeWidth="5" opacity=".28" strokeLinecap="round"/><Circle cx="75" cy="32" r="6" fill="#f4c77b" opacity=".65"/></Svg>;
  if(visualId==='library') return <Svg {...p} viewBox="0 0 150 125"><Polygon points="18,48 75,11 132,48" fill="#303e56"/><Path d="M22 47H128V108H22Z" fill="#667084"/><Path d="M28 57H122" stroke="#9da9b9" strokeWidth="4"/><Path d="M33 48V108M54 48V108M75 48V108M96 48V108M117 48V108" stroke="#3d4657" strokeWidth="3"/><Rect x="38" y="63" width="16" height="24" fill={win}/><Rect x="96" y="63" width="16" height="24" fill={win}/><Path d="M65 108V68Q75 56 85 68V108Z" fill="#2b303b"/><Circle cx="75" cy="31" r="6" fill="#c7d3e2" opacity=".7"/></Svg>;
  if(visualId==='market') return <Svg {...p} viewBox="0 0 150 125"><Path d="M13 48Q27 18 41 48Q55 18 69 48Q83 18 97 48Q111 18 137 48Z" fill="#b34f3d"/><Path d="M15 48H135V104H15Z" fill="#714037"/><Path d="M22 63H128M22 79H128" stroke="#d49366" strokeWidth="3" opacity=".45"/><Path d="M33 104V49M117 104V49" stroke="#312523" strokeWidth="5"/><Circle cx="28" cy="37" r="6" fill={win}/><Circle cx="122" cy="37" r="6" fill={win}/><Circle cx="75" cy="76" r="8" fill="#e0a85b" opacity=".65"/></Svg>;
  if(visualId==='garden') return <Svg {...p} viewBox="0 0 150 125"><Path d="M15 103Q35 45 55 103M40 103Q62 30 80 103M69 103Q90 43 108 103M95 103Q119 49 137 103" stroke="#2f6749" strokeWidth="12" fill="none" strokeLinecap="round"/><Path d="M17 105Q75 70 135 105" stroke="#b0a078" strokeWidth="8" fill="none"/><Circle cx="75" cy="87" r="14" fill="#6e7a7c"/><Circle cx="75" cy="87" r="8" fill="#b9e2d8"/><Circle cx="44" cy="75" r="4" fill="#f2c4cf"/><Circle cx="106" cy="70" r="4" fill="#f2c4cf"/></Svg>;
  return <Svg {...p} viewBox="0 0 150 125"><Polygon points="24,58 75,20 126,58" fill="#314d43"/><Path d="M28 57H122V108H28Z" fill="#52695e"/><Path d="M62 108V73Q75 62 88 73V108Z" fill="#2d3a35"/><Rect x="69" y="59" width="12" height="9" fill={win}/><Circle cx="75" cy="38" r="8" fill="#b8d9c8" opacity=".65"/></Svg>;
}

const styles=StyleSheet.create({root:{...StyleSheet.absoluteFillObject,overflow:'hidden'},ground:{...StyleSheet.absoluteFillObject}});
