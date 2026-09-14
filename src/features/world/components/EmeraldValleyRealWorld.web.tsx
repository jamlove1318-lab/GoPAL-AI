import React, { Suspense, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Web/Metro asset requires must be passed to Three as URL strings.
// Keep this adapter independent from expo-asset so Expo Web never receives
// an Asset object/number where a URL is expected.
const COUNTRY_STATION = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/starter/starter-country-station.glb') as string;
const EXPRESS_PACIFIC = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/models/steam-era-railway-and-rolling-stock-express-pacific-4--e04974dc.glb') as string;
const MOUNTAINSIDE = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/model/mountainside.gltf') as string;
const MOUNTAINSIDE_BIN = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/model/mountainside.bin') as string;
const MOUNTAINSIDE_NORMAL = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/textures/mountainside_nor_gl_4k.jpg') as string;
const MOUNTAINSIDE_DIFFUSE = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/textures/mountainside_diff_4k.jpg') as string;
const MOUNTAINSIDE_ARM = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/textures/mountainside_arm_4k.jpg') as string;

function webAssetUrl(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'uri' in value && typeof (value as { uri?: unknown }).uri === 'string') {
    return (value as { uri: string }).uri;
  }
  throw new Error(`Emerald Valley web asset did not resolve to a URL: ${String(value)}`);
}

const COUNTRY_STATION_URL = webAssetUrl(COUNTRY_STATION);
const EXPRESS_PACIFIC_URL = webAssetUrl(EXPRESS_PACIFIC);
const MOUNTAINSIDE_URL = webAssetUrl(MOUNTAINSIDE);
const MOUNTAINSIDE_BIN_URL = webAssetUrl(MOUNTAINSIDE_BIN);
const MOUNTAINSIDE_NORMAL_URL = webAssetUrl(MOUNTAINSIDE_NORMAL);
const MOUNTAINSIDE_DIFFUSE_URL = webAssetUrl(MOUNTAINSIDE_DIFFUSE);
const MOUNTAINSIDE_ARM_URL = webAssetUrl(MOUNTAINSIDE_ARM);

type Point = [number, number, number];

const mountainDependencies = new Map<string, string>([
  ['mountainside.bin', MOUNTAINSIDE_BIN_URL],
  ['mountainside_nor_gl_4k.jpg', MOUNTAINSIDE_NORMAL_URL],
  ['mountainside_diff_4k.jpg', MOUNTAINSIDE_DIFFUSE_URL],
  ['mountainside_arm_4k.jpg', MOUNTAINSIDE_ARM_URL],
]);

function configureMountainLoader(loader: GLTFLoader) {
  loader.manager.setURLModifier((url: string) => {
    const clean = url.split('?')[0].split('#')[0];
    const filename = clean.slice(clean.lastIndexOf('/') + 1);
    return mountainDependencies.get(filename) ?? url;
  });
}

function Mountains() {
  const gltf = useLoader(GLTFLoader, MOUNTAINSIDE_URL, configureMountainLoader);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const positions = useMemo(() => [
    [-20, 4.5, -55, 0.075], [12, 4.2, -62, 0.082], [36, 3.5, -50, 0.058],
    [-38, 3.2, -43, 0.055], [-4, 4.0, -42, 0.09],
  ] as Array<[number, number, number, number]>, []);
  return <group>{positions.map(([x, y, z, scale], i) => <primitive key={i} object={scene.clone(true)} position={[x, y, z]} rotation={[0, Math.PI, 0]} scale={scale} />)}</group>;
}

function Ground() {
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 8]} receiveShadow>
      <planeGeometry args={[130, 155]} />
      <meshStandardMaterial color="#567153" roughness={0.98} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.53, 19]}>
      <planeGeometry args={[38, 118]} />
      <meshStandardMaterial color="#788d61" roughness={1} />
    </mesh>
  </group>;
}

function ValleyWater() {
  const streams = useMemo(() => [
    [[-7, -0.15, -25], [-5, -0.1, -17], [-3, -0.08, -9], [-1, -0.15, 0], [2, -0.27, 10], [5, -0.32, 21], [8, -0.35, 39]] as Point[],
    [[-26, -0.2, 4], [-18, -0.22, 8], [-11, -0.25, 12], [-5, -0.29, 16], [2, -0.32, 21]] as Point[],
  ], []);
  return <group>{streams.map((points, i) => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.65);
    return <mesh key={i} geometry={new THREE.TubeGeometry(curve, 72, i === 0 ? 1.0 : 0.58, 10, false)}>
      <meshPhysicalMaterial color="#4b9fbe" roughness={0.16} metalness={0.02} transparent opacity={0.9} />
    </mesh>;
  })}</group>;
}

function Trees() {
  const trees = useMemo(() => [
    [-25, 18, 2.2], [-21, 6, 1.8], [-17, -5, 2.5], [-29, -15, 2.0],
    [23, 19, 2.2], [28, 6, 2.7], [20, -10, 2.0], [31, -20, 2.4],
  ] as Array<[number, number, number]>, []);
  return <group>{trees.map(([x, z, s], i) => <group key={i} position={[x, 0, z]} scale={s}>
    <mesh position={[0, 1.1, 0]} castShadow><cylinderGeometry args={[0.16, 0.24, 2.2, 6]} /><meshStandardMaterial color="#5a4536" /></mesh>
    <mesh position={[0, 2.7, 0]} castShadow><coneGeometry args={[1.25, 3.2, 7]} /><meshStandardMaterial color={i % 2 ? '#416f4b' : '#355f43'} roughness={0.95} /></mesh>
  </group>)}</group>;
}

function Railway() {
  const station = useLoader(GLTFLoader, COUNTRY_STATION_URL);
  const train = useLoader(GLTFLoader, EXPRESS_PACIFIC_URL);
  const movingTrain = useRef<THREE.Group>(null);
  const stationScene = useMemo(() => station.scene.clone(true), [station.scene]);
  const trainScene = useMemo(() => train.scene.clone(true), [train.scene]);
  useFrame(({ clock }) => {
    if (!movingTrain.current) return;
    const t = clock.elapsedTime * 0.035;
    movingTrain.current.position.x = 8 + Math.sin(t) * 1.8;
    movingTrain.current.position.z = 23 + Math.cos(t) * 0.4;
  });
  return <group>
    <primitive object={stationScene} position={[8, -0.15, 28]} scale={1.05} />
    <group ref={movingTrain} position={[8, 0.05, 23]} rotation={[0, Math.PI * 0.5, 0]}><primitive object={trainScene} scale={0.92} /></group>
  </group>;
}

function Scene() {
  return <>
    <color attach="background" args={['#9fcbd7']} />
    <fog attach="fog" args={['#a9c8bf', 36, 125]} />
    <ambientLight intensity={0.82} />
    <hemisphereLight args={['#dcebe2', '#304b3d', 1.35]} />
    <directionalLight position={[12, 24, 10]} intensity={2.2} castShadow />
    <Ground />
    <ValleyWater />
    <Trees />
    <Suspense fallback={null}><Mountains /><Railway /></Suspense>
  </>;
}

export function EmeraldValleyRealWorld() {
  return <View pointerEvents="none" style={styles.root}>
    <Canvas
      dpr={[1, 1.5]}
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [17, 10.5, 22], fov: 40, near: 0.1, far: 170 }}
      style={styles.canvas}
    >
      <Scene />
    </Canvas>
    <View pointerEvents="none" style={styles.skyOverlay}>
      <View style={[styles.cloud, { top: '8%', left: '5%', width: 180, height: 38, opacity: 0.78 }]} />
      <View style={[styles.cloud, { top: '17%', left: '55%', width: 245, height: 48, opacity: 0.62 }]} />
      <View style={[styles.cloud, { top: '28%', left: '24%', width: 155, height: 32, opacity: 0.45 }]} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', backgroundColor: '#9fcbd7' },
  canvas: { flex: 1, width: '100%', height: '100%' },
  skyOverlay: { ...StyleSheet.absoluteFillObject },
  cloud: { position: 'absolute', borderRadius: 999, backgroundColor: '#f4fbf7', shadowColor: '#ffffff', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 4 } },
});
