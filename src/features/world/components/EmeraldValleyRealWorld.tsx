import React, { Suspense, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const COUNTRY_STATION = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/starter/starter-country-station.glb');
const EXPRESS_PACIFIC = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/models/steam-era-railway-and-rolling-stock-express-pacific-4--e04974dc.glb');
const MOUNTAINSIDE = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/model/mountainside.gltf');

type Point = [number, number, number];

type TreeSpec = { x: number; z: number; s: number; rot: number };

function MountainBackdrop() {
  const mountain = useLoader(GLTFLoader, MOUNTAINSIDE);
  const scene = useMemo(() => mountain.scene.clone(true), [mountain.scene]);

  return (
    <group position={[-5, 5.5, -44]} rotation={[0, Math.PI, 0]} scale={0.075}>
      <primitive object={scene} />
    </group>
  );
}

function DistantRidges() {
  const ridges = [
    { z: -70, y: 5.5, scale: 1.35, color: '#6f8d82' },
    { z: -58, y: 4.2, scale: 1.05, color: '#58776b' },
    { z: -47, y: 3.1, scale: 0.82, color: '#466657' },
  ];

  return (
    <>
      {ridges.map((ridge, index) => (
        <group key={index} position={[0, ridge.y, ridge.z]} scale={ridge.scale}>
          <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI * 0.04]}>
            <coneGeometry args={[20, 17, 9]} />
            <meshStandardMaterial color={ridge.color} roughness={1} flatShading />
          </mesh>
          <mesh position={[-19, 0, 1]} rotation={[0, 0, -Math.PI * 0.08]}>
            <coneGeometry args={[14, 12, 9]} />
            <meshStandardMaterial color={ridge.color} roughness={1} flatShading />
          </mesh>
          <mesh position={[20, 0, 2]} rotation={[0, 0, Math.PI * 0.08]}>
            <coneGeometry args={[15, 13, 9]} />
            <meshStandardMaterial color={ridge.color} roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
}

function ValleyForest() {
  const trees = useMemo<TreeSpec[]>(() => {
    const values: TreeSpec[] = [];
    const clusters = [
      { x: -13, z: -31, count: 8, spread: 5 },
      { x: 13, z: -24, count: 7, spread: 5 },
      { x: -15, z: -5, count: 8, spread: 6 },
      { x: 16, z: 4, count: 9, spread: 6 },
      { x: -14, z: 25, count: 7, spread: 6 },
      { x: 14, z: 31, count: 8, spread: 6 },
    ];

    clusters.forEach((cluster, clusterIndex) => {
      for (let i = 0; i < cluster.count; i += 1) {
        const angle = i * 2.399 + clusterIndex * 0.7;
        const radius = cluster.spread * (0.35 + ((i * 17) % 10) / 10);
        values.push({
          x: cluster.x + Math.cos(angle) * radius,
          z: cluster.z + Math.sin(angle) * radius,
          s: 0.7 + ((i + clusterIndex) % 5) * 0.11,
          rot: angle,
        });
      }
    });
    return values;
  }, []);

  return (
    <group>
      {trees.map((tree, index) => (
        <group key={index} position={[tree.x, 0, tree.z]} rotation={[0, tree.rot, 0]} scale={tree.s}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.16, 0.24, 1.7, 7]} />
            <meshStandardMaterial color="#5a4736" roughness={1} />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <coneGeometry args={[1.15, 2.9, 7]} />
            <meshStandardMaterial color="#2f5741" roughness={1} flatShading />
          </mesh>
          <mesh position={[0, 2.75, 0]} scale={0.78}>
            <coneGeometry args={[1.05, 2.2, 7]} />
            <meshStandardMaterial color="#3d6a4d" roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Stream({ points, width = 0.7 }: { points: Point[]; width?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), [points]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 42, width, 6, false), [curve, width]);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial color="#4f9faf" roughness={0.12} metalness={0.04} transmission={0.05} transparent opacity={0.84} />
    </mesh>
  );
}

function Waterfall({ position, rotation = [0, 0, 0] as Point }: { position: Point; rotation?: Point }) {
  const mist = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mist.current) return;
    mist.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.025;
    mist.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 0.7) * 0.025;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, -0.8, 0]}>
        <planeGeometry args={[1.4, 3.2]} />
        <meshPhysicalMaterial color="#8ed1d8" roughness={0.08} transparent opacity={0.72} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={mist} position={[0, -2.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 20]} />
        <meshStandardMaterial color="#d9efeb" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  );
}

function LivingWater() {
  const water = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!water.current) return;
    water.current.position.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.025;
  });

  return (
    <group ref={water} position={[0, -0.03, 0]}>
      {/* Upper mountain feeder */}
      <Stream width={0.32} points={[[-8, 1.8, -51], [-6.5, 1.1, -44], [-4.8, 0.45, -37], [-3.2, 0.1, -30]]} />
      <Waterfall position={[-4.4, 1.1, -35]} rotation={[0, 0.22, 0]} />

      {/* Western creek */}
      <Stream width={0.38} points={[[-4, 0, -34], [-6.2, -0.05, -27], [-7.8, -0.08, -20], [-6.8, -0.12, -13], [-8.2, -0.16, -5], [-6.3, -0.18, 4]]} />

      {/* Main river */}
      <Stream width={0.62} points={[[4.8, 0, -31], [2.4, -0.04, -24], [4.1, -0.07, -17], [2.0, -0.1, -10], [3.2, -0.13, -2], [0.4, -0.15, 6], [-2.0, -0.17, 14], [-5.5, -0.19, 23], [-2.8, -0.21, 34], [-7.2, -0.22, 44]]} />
      <Stream width={0.42} points={[[7.5, -0.01, -12], [8.8, -0.08, -5], [7.6, -0.12, 2], [9.5, -0.16, 10], [8.2, -0.18, 18]]} />

      {/* Quiet oxbow / pond */}
      <mesh position={[-8.2, -0.1, 18]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 32]} />
        <meshPhysicalMaterial color="#579eaa" roughness={0.14} metalness={0.04} transparent opacity={0.82} />
      </mesh>
    </group>
  );
}

function ValleyGround() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]} receiveShadow>
        <planeGeometry args={[120, 130, 1, 1]} />
        <meshStandardMaterial color="#557958" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.255, 7]} receiveShadow>
        <planeGeometry args={[26, 112, 1, 1]} />
        <meshStandardMaterial color="#758665" roughness={0.98} />
      </mesh>
      <mesh position={[-23, 4, -5]} rotation={[0, 0, -0.32]}>
        <boxGeometry args={[14, 10, 70]} />
        <meshStandardMaterial color="#45634f" roughness={1} />
      </mesh>
      <mesh position={[23, 4, 7]} rotation={[0, 0, 0.28]}>
        <boxGeometry args={[14, 10, 72]} />
        <meshStandardMaterial color="#3f5d4b" roughness={1} />
      </mesh>
    </>
  );
}

function Footbridge({ position }: { position: Point }) {
  return (
    <group position={position} rotation={[0, 0.08, 0]}>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[7, 0.22, 0.8]} />
        <meshStandardMaterial color="#745b40" roughness={0.85} />
      </mesh>
      {[-2.7, 2.7].map((x) => (
        <mesh key={x} position={[x, 0.5, 0]}>
          <boxGeometry args={[0.22, 1.1, 0.55]} />
          <meshStandardMaterial color="#644b36" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function RailwayScene() {
  const station = useLoader(GLTFLoader, COUNTRY_STATION);
  const express = useLoader(GLTFLoader, EXPRESS_PACIFIC);
  const train = useRef<THREE.Group>(null);
  const stationScene = useMemo(() => station.scene.clone(true), [station.scene]);
  const trainScene = useMemo(() => express.scene.clone(true), [express.scene]);

  useFrame((state) => {
    if (!train.current) return;
    train.current.position.x = Math.sin(state.clock.elapsedTime * 0.045) * 2.2;
    train.current.position.z = 30 + Math.cos(state.clock.elapsedTime * 0.045) * 0.8;
  });

  return (
    <>
      <primitive object={stationScene} position={[7, -0.15, 28]} scale={1.05} />
      <group ref={train} position={[7, 0.05, 23]} rotation={[0, Math.PI * 0.5, 0]}>
        <primitive object={trainScene} scale={0.92} />
      </group>
      <Footbridge position={[4.5, 0, 14]} />
      <Footbridge position={[-2, 0, 38]} rotation={[0, -0.12, 0]} />
    </>
  );
}

function MeadowDetails() {
  const patches = useMemo(() => [
    [-9, -10, 1.4], [10, -5, 1.1], [-11, 9, 1.8], [11, 16, 1.5], [-4, 29, 1.2], [4, 45, 1.6],
  ] as Array<[number, number, number]>, []);

  return (
    <group>
      {patches.map(([x, z, s], index) => (
        <group key={index} position={[x, -0.08, z]} scale={s}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.4, 10]} />
            <meshStandardMaterial color="#668c57" roughness={1} />
          </mesh>
          <mesh position={[0.35, 0.25, 0.1]} rotation={[0, 0, 0.2]}>
            <coneGeometry args={[0.15, 0.75, 5]} />
            <meshStandardMaterial color="#82965a" roughness={1} />
          </mesh>
          <mesh position={[-0.35, 0.3, -0.2]} rotation={[0, 0, -0.25]}>
            <coneGeometry args={[0.12, 0.9, 5]} />
            <meshStandardMaterial color="#78915a" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ValleyLighting() {
  return (
    <>
      <ambientLight intensity={0.95} />
      <hemisphereLight args={['#dbe9d4', '#385443', 1.5]} />
      <directionalLight position={[10, 20, 8]} intensity={2.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <fog attach="fog" args={['#a8c7bd', 38, 105]} />
    </>
  );
}

function SkyAndClouds() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.skyBand, { top: 0, height: '48%' }]} />
      <View style={[styles.skyGlow, { top: '11%', left: '61%' }]} />
      <View style={[styles.cloud, { top: '10%', left: '7%', width: 180, height: 42 }]} />
      <View style={[styles.cloud, { top: '19%', left: '58%', width: 230, height: 52, opacity: 0.62 }]} />
      <View style={[styles.cloud, { top: '30%', left: '28%', width: 145, height: 36, opacity: 0.46 }]} />
      <View style={[styles.cloud, { top: '38%', left: '72%', width: 120, height: 32, opacity: 0.38 }]} />
      <View style={[styles.haze, { top: '37%' }]} />
    </View>
  );
}

export function EmeraldValleyRealWorld() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <SkyAndClouds />
      <Canvas dpr={[1, 1.5]} shadows gl={{ antialias: true, powerPreference: 'high-performance' }} camera={{ position: [18, 11, 20], fov: 40, near: 0.1, far: 150 }} style={styles.canvas}>
        <ValleyLighting />
        <DistantRidges />
        <Suspense fallback={null}>
          <MountainBackdrop />
        </Suspense>
        <ValleyGround />
        <ValleyForest />
        <LivingWater />
        <MeadowDetails />
        <Suspense fallback={null}>
          <RailwayScene />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: 'transparent' },
  skyBand: { position: 'absolute', left: 0, right: 0, backgroundColor: '#9ec8d6' },
  skyGlow: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: '#f5e5b1', opacity: 0.3 },
  cloud: { position: 'absolute', borderRadius: 32, backgroundColor: '#f3f6f2', opacity: 0.78 },
  haze: { position: 'absolute', left: 0, right: 0, height: 190, backgroundColor: '#b9d0c8', opacity: 0.34 },
});
