import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { getWorldInfrastructure, getWorldInfrastructureNetworks, WorldInfrastructureDefinition } from '../data/livingWorldInfrastructure';

function networkPath(points: {x:number;y:number}[]) {
  return points.map((p,i) => `${i ? 'L' : 'M'} ${p.x * 4} ${p.y * 8}`).join(' ');
}

export function LivingInfrastructureLayer({ locationId = 'emerald-village' }: { locationId?: string }) {
  const networks = getWorldInfrastructureNetworks(locationId);
  const objects = getWorldInfrastructure(locationId);
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="none">
      {networks.map(network => <React.Fragment key={network.id}>
        <Path d={networkPath(network.points)} fill="none" stroke="#343b3b" strokeWidth={network.width} strokeLinecap="round" strokeLinejoin="round" opacity={.9} />
        <Path d={networkPath(network.points)} fill="none" stroke={network.kind === 'sidewalk' ? '#b9b39e' : '#5d6260'} strokeWidth={Math.max(3, network.width - 5)} strokeLinecap="round" strokeLinejoin="round" />
        {network.kind === 'road' && <Path d={networkPath(network.points)} fill="none" stroke="#e3d69d" strokeWidth={1.4} strokeDasharray="10 8" strokeLinecap="round" opacity={.8} />}
      </React.Fragment>)}
      {objects.map(renderInfrastructure)}
    </Svg>
  </View>;
}

function renderInfrastructure(item: WorldInfrastructureDefinition) {
  const x = item.x * 4, y = item.y * 8, s = item.scale ?? 1;
  switch (item.kind) {
    case 'bus-stop':
      return <React.Fragment key={item.id}><Rect x={x-18*s} y={y-13*s} width={36*s} height={26*s} rx={5*s} fill="#4b5655" stroke="#26302e" strokeWidth={2}/><Rect x={x-13*s} y={y-9*s} width={26*s} height={14*s} rx={2*s} fill="#9fc8c3" opacity={.7}/><Rect x={x-15*s} y={y-15*s} width={30*s} height={3*s} rx={1} fill="#d2bd75"/>{item.label && <SvgText x={x} y={y+28*s} fill="#e8e2cc" fontSize={7*s} textAnchor="middle">{item.label}</SvgText>}</React.Fragment>;
    case 'railway-crossing':
      return <React.Fragment key={item.id}><Line x1={x-16*s} y1={y-10*s} x2={x+16*s} y2={y+10*s} stroke="#c7c0af" strokeWidth={5*s}/><Line x1={x-16*s} y1={y+10*s} x2={x+16*s} y2={y-10*s} stroke="#c7c0af" strokeWidth={5*s}/><Circle cx={x-20*s} cy={y-13*s} r={4*s} fill="#b84f45"/><Circle cx={x+20*s} cy={y+13*s} r={4*s} fill="#b84f45"/></React.Fragment>;
    case 'bridge':
      return <React.Fragment key={item.id}><Rect x={x-42*s} y={y-14*s} width={84*s} height={28*s} rx={7*s} fill="#74695c" stroke="#403b36" strokeWidth={3} transform={`rotate(${item.rotation ?? 0} ${x} ${y})`}/><Line x1={x-35*s} y1={y-5*s} x2={x+35*s} y2={y-5*s} stroke="#b9a98d" strokeWidth={3*s} transform={`rotate(${item.rotation ?? 0} ${x} ${y})`}/></React.Fragment>;
    case 'parking':
      return <React.Fragment key={item.id}><Rect x={x-36*s} y={y-22*s} width={72*s} height={44*s} rx={3*s} fill="#555b5a"/><Path d={`M${x-24*s} ${y-16*s}L${x-24*s} ${y+16*s}M${x-8*s} ${y-16*s}L${x-8*s} ${y+16*s}M${x+8*s} ${y-16*s}L${x+8*s} ${y+16*s}M${x+24*s} ${y-16*s}L${x+24*s} ${y+16*s}`} stroke="#d8d0b4" strokeWidth={1}/></React.Fragment>;
    case 'helipad':
      return <React.Fragment key={item.id}><Circle cx={x} cy={y} r={28*s} fill="#58605e" stroke="#343b39" strokeWidth={3}/><SvgText x={x} y={y+8*s} fill="#e7dfc1" fontSize={24*s} fontWeight="bold" textAnchor="middle">H</SvgText></React.Fragment>;
    case 'street-light':
      return <React.Fragment key={item.id}><Line x1={x} y1={y+18*s} x2={x} y2={y-14*s} stroke="#303635" strokeWidth={3*s}/><Path d={`M${x} ${y-14*s}Q${x+8*s} ${y-20*s} ${x+10*s} ${y-12*s}`} fill="none" stroke="#303635" strokeWidth={2*s}/><Circle cx={x+10*s} cy={y-11*s} r={4*s} fill="#f2d47c" opacity={.85}/></React.Fragment>;
    default: return null;
  }
}
