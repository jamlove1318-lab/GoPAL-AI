import React, { Suspense, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const COUNTRY_STATION = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/starter/starter-country-station.glb');
const EXPRESS_PACIFIC = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/models/steam-era-railway-and-rolling-stock-express-pacific-4--e04974dc.glb');

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
      <primitive object={stationScene} position={[0, -0.15, 0]} scale={1.05} />
      <group ref={train} position={[0, 0.05, -3.4]} rotation={[0, Math.PI * 0.5, 0]}>
        <primitive object={trainScene} scale={0.92} />
      </group>
    </>
  );
}

function ValleyLighting() {
  return (
    <>
      <ambientLight intensity={1.35} />
      <hemisphereLight args={['#dbe9d4', '#385443', 1.7]} />
      <directionalLight
        position={[10, 16, 8]}
        intensity={3.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <fog attach="fog" args={['#a8c7bd', 24, 62]} />
    </>
  );
}

function ValleyGround() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]} receiveShadow>
        <planeGeometry args={[80, 80, 1, 1]} />
        <meshStandardMaterial color="#4f744f" roughness={1} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.265, 0]} receiveShadow>
        <planeGeometry args={[18, 80, 1, 1]} />
        <meshStandardMaterial color="#7c7358" roughness={0.96} metalness={0} />
      </mesh>
    </>
  );
}

export function EmeraldValleyRealWorld() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Canvas
        dpr={[1, 1.5]}
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [15, 10, 17], fov: 38, near: 0.1, far: 120 }}
        style={styles.canvas}
      >
        <ValleyLighting />
        <ValleyGround />
        <Suspense fallback={null}>
          <RailwayScene />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: '#9fbdb0',
  },
});
