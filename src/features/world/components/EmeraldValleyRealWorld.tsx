import React, { Suspense, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const COUNTRY_STATION = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/starter/starter-country-station.glb');
const EXPRESS_PACIFIC = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/models/steam-era-railway-and-rolling-stock-express-pacific-4--e04974dc.glb');
const MOUNTAINSIDE = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/model/mountainside.gltf');

type Point = [number, number, number];

function MountainBackdrop() {
  const mountain = useLoader(GLTFLoader, MOUNTAINSIDE);
  const scene = useMemo(() => mountain.scene.clone(true), [mountain.scene]);

  return (
    <group position={[0, 4.5, -31]} rotation={[0, Math.PI, 0]} scale={0.075}>
      <primitive object={scene} />
    </group>
  );
}

function DistantRidges() {
  const ridges = useMemo(() => {
    const groups = [
      { z: -52, y: 4.5, scale: 1.0, color: '#557565' },
      { z: -43, y: 3.4, scale: 0.82, color: '#486958' },
      { z: -36, y: 2.5, scale: 0.66, color: '#3e5d4e' },
    ];
    return groups.map((item, index) => ({ ...item, index }));
  }, []);

  return (
    <>
      {ridges.map((ridge) => (
        <group key={ridge.index} position={[0, ridge.y, ridge.z]} scale={[ridge.scale, ridge.scale, ridge.scale]}>
          <mesh rotation={[0, 0, Math.PI * 0.04]}>
            <coneGeometry args={[18, 15, 7]} />
            <meshStandardMaterial color={ridge.color} roughness={1} flatShading />
          </mesh>
          <mesh position={[-15, -1, 1]} rotation={[0, 0, -Math.PI * 0.08]}>
            <coneGeometry args={[13, 11, 7]} />
            <meshStandardMaterial color={ridge.color} roughness={1} flatShading />
          </mesh>
          <mesh position={[15, -1, 2]} rotation={[0, 0, Math.PI * 0.08]}>
            <coneGeometry args={[13, 11, 7]} />
            <meshStandardMaterial color={ridge.color} roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
}

function ValleyForest() {
  const trees = useMemo(() => {
    const values: Array<{ x: number; z: number; s: number }> = [];
    for (let i = 0; i < 30; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const depth = -20 + (i % 10) * 3.1;
      values.push({ x: side * (7 + (i % 5) * 1.8), z: depth, s: 0.75 + (i % 4) * 0.12 });
    }
    return values;
  }, []);

  return (
    <group>
      {trees.map((tree, index) => (
        <group key={index} position={[tree.x, 1.1 * tree.s, tree.z]} scale={tree.s}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.18, 0.25, 1.8, 7]} />
            <meshStandardMaterial color="#5a4736" roughness={1} />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <coneGeometry args={[1.15, 2.9, 7]} />
            <meshStandardMaterial color="#2e5540" roughness={1} flatShading />
          </mesh>
          <mesh position={[0, 2.8, 0]} scale={0.78}>
            <coneGeometry args={[1.05, 2.2, 7]} />
            <meshStandardMaterial color="#3b674a" roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Stream({ points, width = 0.7 }: { points: Point[]; width?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), [points]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 28, width, 5, false), [curve, width]);

  return (
    <mesh geometry={geometry} rotation={[0, 0, 0]}>
      <meshStandardMaterial color="#4c9eae" roughness={0.18} metalness={0.05} transparent opacity={0.88} />
    </mesh>
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
      <Stream width={0.46} points={[[4, 0, -28], [2.8, -0.05, -21], [3.5, -0.08, -14], [1.5, -0.1, -7], [0.2, -0.12, 0], [-1.7, -0.13, 7], [-4, -0.14, 17]]} />
      <Stream width={0.8} points={[[4, -0.01, -28], [4.5, -0.08, -21], [5.2, -0.11, -14], [4.1, -0.13, -7], [3.2, -0.15, 0], [1.5, -0.16, 8], [-0.5, -0.17, 19]]} />
      <mesh position={[2.4, -0.02, -18]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.4, 24]} />
        <meshStandardMaterial color="#5eacb8" roughness={0.2} metalness={0.08} transparent opacity={0.82} />
      </mesh>
    </group>
  );
}

function ValleyLighting() {
  return (
    <>
      <ambientLight intensity={1.05} />
      <hemisphereLight args={['#dbe9d4', '#385443', 1.55]} />
      <directionalLight position={[10, 18, 8]} intensity={3.0} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <fog attach="fog" args={['#a8c7bd', 28, 78]} />
    </>
  );
}

function ValleyGround() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]} receiveShadow>
        <planeGeometry args={[90, 100, 1, 1]} />
        <meshStandardMaterial color="#557958" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.255, 3]} receiveShadow>
        <planeGeometry args={[20, 82, 1, 1]} />
        <meshStandardMaterial color="#718060" roughness={0.98} />
      </mesh>
    </>
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
    train.current.position.z = Math.cos(state.clock.elapsedTime * 0.045) * 0.8;
  });

  return (
    <>
      <primitive object={stationScene} position={[0, -0.15, 8]} scale={1.05} />
      <group ref={train} position={[0, 0.05, 4.5]} rotation={[0, Math.PI * 0.5, 0]}>
        <primitive object={trainScene} scale={0.92} />
      </group>
    </>
  );
}

function SkyAndClouds() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.skyBand, { top: 0, height: '42%', opacity: 1 }]} />
      <View style={[styles.skyGlow, { top: '15%', left: '58%' }]} />
      <View style={[styles.cloud, { top: '12%', left: '8%', width: 150, height: 42 }]} />
      <View style={[styles.cloud, { top: '23%', left: '62%', width: 190, height: 52, opacity: 0.65 }]} />
      <View style={[styles.cloud, { top: '33%', left: '32%', width: 120, height: 34, opacity: 0.45 }]} />
      <View style={[styles.haze, { top: '34%' }]} />
    </View>
  );
}

export function EmeraldValleyRealWorld() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <SkyAndClouds />
      <Canvas dpr={[1, 1.5]} shadows gl={{ antialias: true, powerPreference: 'high-performance' }} camera={{ position: [15, 10, 17], fov: 38, near: 0.1, far: 140 }} style={styles.canvas}>
        <ValleyLighting />
        <DistantRidges />
        <Suspense fallback={null}>
          <MountainBackdrop />
        </Suspense>
        <ValleyForest />
        <ValleyGround />
        <LivingWater />
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
  skyGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#f5e5b1', opacity: 0.32 },
  cloud: { position: 'absolute', borderRadius: 32, backgroundColor: '#f3f6f2', opacity: 0.78 },
  haze: { position: 'absolute', left: 0, right: 0, height: 180, backgroundColor: '#b9d0c8', opacity: 0.35 },
});
