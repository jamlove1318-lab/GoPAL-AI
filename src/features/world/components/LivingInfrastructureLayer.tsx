import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { getWorldInfrastructure, getWorldInfrastructureNetworks, WorldInfrastructureDefinition, WorldInfrastructureNetwork } from '../data/livingWorldInfrastructure';

function networkPath(points: {x:number;y:number}[]) {
  return points.map((p,i) => `${i ? 'L' : 'M'} ${p.x * 4} ${p.y * 8}`).join(' ');
}

export function LivingInfrastructureLayer({ locationId = 'emerald-village' }: { locationId?: string }) {
  const networks = getWorldInfrastructureNetworks(locationId);
  const objects = getWorldInfrastructure(locationId);
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="none">
      {networks.map(renderNetwork)}
      {objects.map(renderInfrastructure)}
    </Svg>
  </View>;
}

function renderNetwork(network: WorldInfrastructureNetwork) {
  const d = networkPath(network.points);
  if (network.kind === 'power-line') return <React.Fragment key={network.id}><Path d={d} fill="none" stroke="#303735" strokeWidth={5} opacity={.45}/><Path d={d} fill="none" stroke="#171d1b" strokeWidth={network.width} strokeDasharray="2 8" opacity={.9}/></React.Fragment>;
  if (network.kind === 'sidewalk') return <React.Fragment key={network.id}><Path d={d} fill="none" stroke="#535651" strokeWidth={network.width + 4} strokeLinecap="round" strokeLinejoin="round" opacity={.8}/><Path d={d} fill="none" stroke="#b9b39e" strokeWidth={network.width} strokeLinecap="round" strokeLinejoin="round"/></React.Fragment>;
  return <React.Fragment key={network.id}>
    <Path d={d} fill="none" stroke="#343b3b" strokeWidth={network.width + 5} strokeLinecap="round" strokeLinejoin="round" opacity={.9}/>
    <Path d={d} fill="none" stroke="#5d6260" strokeWidth={network.width} strokeLinecap="round" strokeLinejoin="round" />
    {network.kind === 'road' && <Path d={d} fill="none" stroke="#e3d69d" strokeWidth={1.4} strokeDasharray="10 8" strokeLinecap="round" opacity={.8} />}
  </React.Fragment>;
}

function renderInfrastructure(item: WorldInfrastructureDefinition) {
  const x = item.x * 4, y = item.y * 8, s = item.scale ?? 1;
  const rotation = item.rotation ?? 0;
  const transform = `rotate(${rotation} ${x} ${y})`;
  switch (item.kind) {
    case 'intersection':
      return <React.Fragment key={item.id}><Rect x={x-34*s} y={y-22*s} width={68*s} height={44*s} rx={5*s} fill="#555b5a" opacity={.95} transform={transform}/><Path d={`M${x-27*s} ${y-14*s}H${x+27*s}M${x-27*s} ${y}H${x+27*s}M${x-27*s} ${y+14*s}H${x+27*s}`} stroke="#d8d0b4" strokeWidth={1.5} strokeDasharray="7 7" transform={transform}/></React.Fragment>;
    case 'tunnel':
      return <React.Fragment key={item.id}><Path d={`M${x-42*s} ${y+16*s}Q${x-42*s} ${y-28*s} ${x} ${y-28*s}Q${x+42*s} ${y-28*s} ${x+42*s} ${y+16*s}Z`} fill="#333c3d" stroke="#1f2828" strokeWidth={4} transform={transform}/><Path d={`M${x-28*s} ${y+16*s}V${y-3*s}Q${x-28*s} ${y-17*s} ${x} ${y-17*s}Q${x+28*s} ${y-17*s} ${x+28*s} ${y-3*s}V${y+16*s}`} fill="#182021" transform={transform}/></React.Fragment>;
    case 'bridge':
      return <React.Fragment key={item.id}><Ellipse cx={x} cy={y+10*s} rx={44*s} ry={11*s} fill="#202827" opacity={.45} transform={transform}/><Rect x={x-42*s} y={y-14*s} width={84*s} height={28*s} rx={7*s} fill="#74695c" stroke="#403b36" strokeWidth={3} transform={transform}/><Line x1={x-35*s} y1={y-5*s} x2={x+35*s} y2={y-5*s} stroke="#b9a98d" strokeWidth={3*s} transform={transform}/><Line x1={x-30*s} y1={y+8*s} x2={x+30*s} y2={y+8*s} stroke="#4d473f" strokeWidth={2*s} transform={transform}/></React.Fragment>;
    case 'railway-crossing':
      return <React.Fragment key={item.id}><Line x1={x-20*s} y1={y-13*s} x2={x+20*s} y2={y+13*s} stroke="#2f3432" strokeWidth={8*s}/><Line x1={x-20*s} y1={y+13*s} x2={x+20*s} y2={y-13*s} stroke="#f0e8cf" strokeWidth={4*s}/><Circle cx={x-23*s} cy={y-16*s} r={5*s} fill="#b84f45"/><Circle cx={x+23*s} cy={y+16*s} r={5*s} fill="#b84f45"/>{item.label && <SvgText x={x} y={y+29*s} fill="#e8e2cc" fontSize={7*s} textAnchor="middle">{item.label}</SvgText>}</React.Fragment>;
    case 'traffic-signal':
      return <React.Fragment key={item.id}><Line x1={x} y1={y+18*s} x2={x} y2={y-19*s} stroke="#303635" strokeWidth={3*s}/><Rect x={x-6*s} y={y-22*s} width={12*s} height={25*s} rx={3*s} fill="#202727"/><Circle cx={x} cy={y-16*s} r={3*s} fill="#c9554c"/><Circle cx={x} cy={y-9*s} r={3*s} fill="#e0b34f"/><Circle cx={x} cy={y-2*s} r={3*s} fill="#5fa36b"/></React.Fragment>;
    case 'street-light':
      return <React.Fragment key={item.id}><Line x1={x} y1={y+18*s} x2={x} y2={y-14*s} stroke="#303635" strokeWidth={3*s}/><Path d={`M${x} ${y-14*s}Q${x+8*s} ${y-20*s} ${x+10*s} ${y-12*s}`} fill="none" stroke="#303635" strokeWidth={2*s}/><Circle cx={x+10*s} cy={y-11*s} r={4*s} fill="#f2d47c" opacity={.85}/></React.Fragment>;
    case 'bus-stop':
      return <React.Fragment key={item.id}><Rect x={x-18*s} y={y-13*s} width={36*s} height={26*s} rx={5*s} fill="#4b5655" stroke="#26302e" strokeWidth={2}/><Rect x={x-13*s} y={y-9*s} width={26*s} height={14*s} rx={2*s} fill="#9fc8c3" opacity={.7}/><Rect x={x-15*s} y={y-15*s} width={30*s} height={3*s} rx={1} fill="#d2bd75"/>{item.label && <SvgText x={x} y={y+28*s} fill="#e8e2cc" fontSize={7*s} textAnchor="middle">{item.label}</SvgText>}</React.Fragment>;
    case 'parking':
      return <React.Fragment key={item.id}><Rect x={x-36*s} y={y-22*s} width={72*s} height={44*s} rx={3*s} fill="#555b5a"/><Path d={`M${x-24*s} ${y-16*s}V${y+16*s}M${x-8*s} ${y-16*s}V${y+16*s}M${x+8*s} ${y-16*s}V${y+16*s}M${x+24*s} ${y-16*s}V${y+16*s}`} stroke="#d8d0b4" strokeWidth={1}/></React.Fragment>;
    case 'dock':
      return <React.Fragment key={item.id}><Rect x={x-38*s} y={y-8*s} width={76*s} height={16*s} rx={3*s} fill="#715844" stroke="#443a31" strokeWidth={2} transform={transform}/><Line x1={x-28*s} y1={y-8*s} x2={x-28*s} y2={y+8*s} stroke="#c39a62" strokeWidth={2} transform={transform}/><Line x1={x} y1={y-8*s} x2={x} y2={y+8*s} stroke="#c39a62" strokeWidth={2} transform={transform}/><Line x1={x+28*s} y1={y-8*s} x2={x+28*s} y2={y+8*s} stroke="#c39a62" strokeWidth={2} transform={transform}/></React.Fragment>;
    case 'pier':
      return <React.Fragment key={item.id}><Rect x={x-10*s} y={y-45*s} width={20*s} height={90*s} rx={3*s} fill="#725943" stroke="#443a31" strokeWidth={2} transform={transform}/>{[-30,-10,10,30].map(offset => <Circle key={offset} cx={x} cy={y+offset*s} r={3*s} fill="#c39a62" transform={transform}/>)}</React.Fragment>;
    case 'harbor':
      return <React.Fragment key={item.id}><Ellipse cx={x} cy={y} rx={46*s} ry={28*s} fill="#557f88" stroke="#2f555e" strokeWidth={3}/><Path d={`M${x-35*s} ${y}Q${x-12*s} ${y-9*s} ${x+10*s} ${y}T${x+35*s} ${y}`} fill="none" stroke="#8fb4b5" strokeWidth={2}/></React.Fragment>;
    case 'runway':
      return <React.Fragment key={item.id}><Rect x={x-16*s} y={y-60*s} width={32*s} height={120*s} rx={5*s} fill="#454b4a" transform={transform}/><Path d={`M${x} ${y-49*s}V${y-25*s}M${x} ${y-10*s}V${y+10*s}M${x} ${y+25*s}V${y+49*s}`} stroke="#eee8cf" strokeWidth={3*s} strokeDasharray="12 8" transform={transform}/><Path d={`M${x-9*s} ${y-51*s}V${y+51*s}M${x+9*s} ${y-51*s}V${y+51*s}`} stroke="#727876" strokeWidth={2*s} transform={transform}/></React.Fragment>;
    case 'taxiway':
      return <Path key={item.id} d={`M${x-34*s} ${y}Q${x} ${y-18*s} ${x+34*s} ${y}`} fill="none" stroke="#4d5553" strokeWidth={18*s} strokeLinecap="round" transform={transform}/>;
    case 'helipad':
      return <React.Fragment key={item.id}><Circle cx={x} cy={y} r={28*s} fill="#58605e" stroke="#343b39" strokeWidth={3}/><SvgText x={x} y={y+8*s} fill="#e7dfc1" fontSize={24*s} fontWeight="bold" textAnchor="middle">H</SvgText></React.Fragment>;
    case 'power-line':
      return <React.Fragment key={item.id}><Line x1={x} y1={y+18*s} x2={x} y2={y-18*s} stroke="#403a30" strokeWidth={3*s}/><Line x1={x-11*s} y1={y-14*s} x2={x+11*s} y2={y-14*s} stroke="#403a30" strokeWidth={2*s}/></React.Fragment>;
    case 'utility':
      return <React.Fragment key={item.id}><Rect x={x-13*s} y={y-17*s} width={26*s} height={34*s} rx={3*s} fill="#4b5754" stroke="#2e3836" strokeWidth={2}/><Rect x={x-8*s} y={y-11*s} width={16*s} height={7*s} fill="#9fc8c3" opacity={.7}/><Line x1={x-8*s} y1={y+5*s} x2={x+8*s} y2={y+5*s} stroke="#c6b87e" strokeWidth={2}/></React.Fragment>;
    default: return null;
  }
}
