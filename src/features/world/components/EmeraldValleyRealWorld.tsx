import React, { Suspense, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const COUNTRY_STATION = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/starter/starter-country-station.glb');
const EXPRESS_PACIFIC = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/models/steam-era-railway-and-rolling-stock-express-pacific-4--e04974dc.glb');
const MOUNTAINSIDE = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/model/mountainside.gltf');

type Point = [number, number, number];
type MeadowPatch = { x: number; z: number; sx: number; sz: number; rotation: number };
type Rock = { x: number; y: number; z: number; sx: number; sy: number; sz: number; rotation: number };

/** Emerald Valley: the visible world is the product. */
function MountainBackdrop() {
  const mountain = useLoader(GLTFLoader, MOUNTAINSIDE);
  const scene = useMemo(() => mountain.scene.clone(true), [mountain.scene]);
  const ridges = useMemo(() => [
    { position: [-18, 7.0, -62] as Point, scale: 0.062, rotation: -0.18 },
    { position: [16, 6.3, -69] as Point, scale: 0.073, rotation: 0.2 },
    { position: [34, 4.5, -53] as Point, scale: 0.052, rotation: -0.34 },
    { position: [-34, 4.1, -46] as Point, scale: 0.05, rotation: 0.28 },
    { position: [-20, 3.1, -27] as Point, scale: 0.045, rotation: -0.12 },
  ], []);
  return <group>
    {ridges.map((ridge, index) => <primitive key={index} object={scene.clone(true)} position={ridge.position} rotation={[0, Math.PI + ridge.rotation, 0]} scale={ridge.scale} />)}
    <primitive object={scene.clone(true)} position={[-5, 5.4, -43]} rotation={[0, Math.PI, 0]} scale={0.08} />
  </group>;
}

function ValleyGround() {
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 4]} receiveShadow><planeGeometry args={[124, 148]} /><meshStandardMaterial color="#526d4f" roughness={0.98} /></mesh>
    <mesh position={[-28, 1.8, 7]} rotation={[0, 0, -0.24]}><planeGeometry args={[34, 118]} /><meshStandardMaterial color="#405c49" roughness={1} side={THREE.DoubleSide} /></mesh>
    <mesh position={[28, 2.1, 10]} rotation={[0, 0, 0.25]}><planeGeometry args={[36, 122]} /><meshStandardMaterial color="#3f5947" roughness={1} side={THREE.DoubleSide} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.43, 17]} receiveShadow><planeGeometry args={[34, 112]} /><meshStandardMaterial color="#6f815b" roughness={1} /></mesh>
  </group>;
}

function ValleyTrails() {
  const trails = useMemo(() => [
    { points: [[-16, -0.31, 40], [-11, -0.28, 33], [-8, -0.25, 27], [-4, -0.27, 20], [-1, -0.28, 14]] as Point[], width: 0.62 },
    { points: [[-1, -0.27, 14], [1, -0.25, 8], [3, -0.23, 2], [5, -0.17, -5], [7, -0.1, -12]] as Point[], width: 0.48 },
    { points: [[-12, -0.3, 8], [-8, -0.28, 13], [-3, -0.27, 17], [2, -0.25, 20]] as Point[], width: 0.38 },
  ], []);
  return <group>{trails.map((trail, index) => {
    const curve = new THREE.CatmullRomCurve3(trail.points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.55);
    return <mesh key={index} geometry={new THREE.TubeGeometry(curve, 36, trail.width, 7, false)} receiveShadow>
      <meshStandardMaterial color="#9a805c" roughness={1} />
    </mesh>;
  })}</group>;
}

function ForegroundRocks() {
  const rocks = useMemo<Rock[]>(() => [
    { x: -15, y: 0.05, z: 37, sx: 1.7, sy: 0.8, sz: 1.25, rotation: 0.2 },
    { x: -12.8, y: 0.02, z: 30.5, sx: 0.9, sy: 0.55, sz: 0.7, rotation: -0.4 },
    { x: 13.5, y: 0.08, z: 15, sx: 1.4, sy: 0.72, sz: 1.0, rotation: 0.7 },
    { x: 11.8, y: 0.03, z: 7, sx: 0.72, sy: 0.46, sz: 0.58, rotation: -0.3 },
    { x: -5.5, y: 0.02, z: -22, sx: 1.05, sy: 0.55, sz: 0.8, rotation: 0.25 },
    { x: 9.8, y: 0.04, z: -16, sx: 1.2, sy: 0.62, sz: 0.9, rotation: -0.6 },
  ], []);
  return <group>{rocks.map((rock, index) => <mesh key={index} position={[rock.x, rock.y, rock.z]} scale={[rock.sx, rock.sy, rock.sz]} rotation={[0, rock.rotation, 0]} castShadow receiveShadow>
    <icosahedronGeometry args={[1, 2]} />
    <meshStandardMaterial color={index % 2 ? '#687068' : '#77776c'} roughness={0.94} />
  </mesh>)}</group>;
}

function Stream({ points, width = 0.7 }: { points: Point[]; width?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)), false, 'catmullrom', 0.5), [points]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 72, width, 8, false), [curve, width]);
  return <mesh geometry={geometry} receiveShadow><meshPhysicalMaterial color="#5b9eaa" roughness={0.1} metalness={0.02} transmission={0.12} transparent opacity={0.8} /></mesh>;
}

function Waterfall({ position, scale = 1 }: { position: Point; scale?: number }) {
  const mist = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mist.current) return;
    const pulse = Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
    mist.current.scale.set(1 + pulse, 1, 1 - pulse * 0.5);
    mist.current.position.y = -2.15 + Math.sin(state.clock.elapsedTime * 1.1) * 0.025;
  });
  return <group position={position} scale={scale}>
    <mesh position={[0, -0.7, 0]}><planeGeometry args={[1.15, 3.5]} /><meshPhysicalMaterial color="#a9dce0" roughness={0.06} transparent opacity={0.65} side={THREE.DoubleSide} /></mesh>
    <mesh ref={mist} position={[0, -2.15, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.05, 28]} /><meshStandardMaterial color="#e5f2ef" transparent opacity={0.16} depthWrite={false} /></mesh>
  </group>;
}

function LivingWater() {
  const water = useRef<THREE.Group>(null);
  useFrame((state) => { if (water.current) water.current.position.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.018; });
  return <group ref={water}>
    <Stream width={0.25} points={[[-9, 2.1, -52], [-7.4, 1.25, -46], [-5.7, 0.55, -40], [-4.8, 0.05, -34]]} />
    <Waterfall position={[-4.9, 1.15, -35]} scale={0.9} />
    <Stream width={0.36} points={[[-4.7, -0.04, -34], [-6.1, -0.08, -28], [-7.8, -0.12, -21], [-8.5, -0.16, -14], [-7.3, -0.19, -7], [-8.2, -0.22, 1]]} />
    {/* Reserved crossing: intentionally empty for the future premium bridge. */}
    <Stream width={0.42} points={[[-8.2, -0.22, 1], [-6.4, -0.25, 8], [-4.2, -0.27, 15], [-1.2, -0.29, 20]]} />
    <Stream width={0.58} points={[[4.5, -0.05, -33], [2.5, -0.1, -27], [4.1, -0.14, -20], [2.0, -0.18, -13], [3.8, -0.21, -5], [1.0, -0.24, 3], [2.8, -0.27, 11], [0.3, -0.29, 18], [-2.6, -0.31, 25], [-5.4, -0.33, 34], [-3.2, -0.35, 44]]} />
    <Stream width={0.3} points={[[10.2, -0.08, -11], [8.8, -0.13, -5], [9.4, -0.18, 2], [7.6, -0.22, 10], [8.8, -0.26, 17]]} />
    <mesh position={[-8.2, -0.2, 28]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.7, 40]} /><meshPhysicalMaterial color="#589ca7" roughness={0.13} metalness={0.02} transparent opacity={0.78} /></mesh>
  </group>;
}

function MeadowPatches() {
  const patches = useMemo<MeadowPatch[]>(() => [
    { x: -10, z: -18, sx: 2.4, sz: 1.2, rotation: -0.18 }, { x: 10, z: -9, sx: 1.8, sz: 1.0, rotation: 0.26 },
    { x: -12, z: 8, sx: 2.6, sz: 1.35, rotation: 0.12 }, { x: 12, z: 19, sx: 2.2, sz: 1.3, rotation: -0.2 },
    { x: -5, z: 31, sx: 2.8, sz: 1.5, rotation: 0.15 }, { x: 7, z: 42, sx: 2.4, sz: 1.2, rotation: -0.12 },
  ], []);
  return <group>{patches.map((patch, index) => <mesh key={index} position={[patch.x, -0.06, patch.z]} rotation={[-Math.PI / 2, 0, patch.rotation]} scale={[patch.sx, patch.sz, 1]}><circleGeometry args={[1, 24]} /><meshStandardMaterial color={index % 2 ? '#78935e' : '#6f8957'} roughness={1} transparent opacity={0.8} /></mesh>)}</group>;
}

function RailwayScene() {
  const station = useLoader(GLTFLoader, COUNTRY_STATION);
  const express = useLoader(GLTFLoader, EXPRESS_PACIFIC);
  const train = useRef<THREE.Group>(null);
  const stationScene = useMemo(() => station.scene.clone(true), [station.scene]);
  const trainScene = useMemo(() => express.scene.clone(true), [express.scene]);
  useFrame((state) => {
    if (!train.current) return;
    const phase = state.clock.elapsedTime * 0.038;
    train.current.position.x = 7 + Math.sin(phase) * 1.8;
    train.current.position.z = 23 + Math.cos(phase) * 0.45;
  });
  return <group><primitive object={stationScene} position={[7, -0.15, 28]} scale={1.05} /><group ref={train} position={[7, 0.05, 23]} rotation={[0, Math.PI * 0.5, 0]}><primitive object={trainScene} scale={0.92} /></group></group>;
}

function ValleyAtmosphere() {
  return <><color attach="background" args={['#9fcbd7']} /><ambientLight intensity={0.78} /><hemisphereLight args={['#dcebe2', '#304b3d', 1.42]} /><directionalLight position={[12, 24, 10]} intensity={2.25} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} /><fog attach="fog" args={['#a9c8bf', 34, 122]} /></>;
}

function SkyAndClouds() {
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <View style={[styles.cloud, { top: '8%', left: '5%', width: 180, height: 38, opacity: 0.78 }]} />
    <View style={[styles.cloud, { top: '17%', left: '55%', width: 245, height: 48, opacity: 0.62 }]} />
    <View style={[styles.cloud, { top: '28%', left: '24%', width: 155, height: 32, opacity: 0.45 }]} />
    <View style={[styles.cloud, { top: '35%', left: '76%', width: 125, height: 28, opacity: 0.34 }]} />
    <View style={[styles.sunGlow, { top: '7%', left: '66%' }]} />
  </View>;
}

export function EmeraldValleyRealWorld() {
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Canvas dpr={[1, 1.5]} shadows gl={{ antialias: true, powerPreference: 'high-performance' }} camera={{ position: [17, 10.5, 22], fov: 40, near: 0.1, far: 170 }} style={styles.canvas}>
      <ValleyAtmosphere />
      <Suspense fallback={null}><MountainBackdrop /></Suspense>
      <ValleyGround />
      <MeadowPatches />
      <ValleyTrails />
      <ForegroundRocks />
      <LivingWater />
      <Suspense fallback={null}><RailwayScene /></Suspense>
    </Canvas>
    {/* Deliberately above the Canvas: sky dressing is player-visible, not hidden behind it. */}
    <SkyAndClouds />
  </View>;
}

const styles = StyleSheet.create({
  canvas: { flex: 1 },
  sunGlow: { position: 'absolute', width: 210, height: 210, borderRadius: 105, backgroundColor: '#f4e5b5', opacity: 0.26 },
  cloud: { position: 'absolute', borderRadius: 34, backgroundColor: '#f4f7f3' },
});
