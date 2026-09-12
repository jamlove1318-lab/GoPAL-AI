import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import type { WorldAnimationAction } from '../../../engines/world/worldAnimationContract';
import type { WorldVisualRuntimeBinding } from '../../../engines/world/worldVisualRuntimeContract';
import { resolveWorldAnimationClip } from '../../../engines/world/worldAssetAnimationRouter';

export interface WorldVisualRuntimeHostProps {
  binding?: WorldVisualRuntimeBinding;
  animation?: WorldAnimationAction;
  width: number;
  height: number;
  scale?: number;
}

function RuntimeModel({ binding, animation, scale }: { binding: WorldVisualRuntimeBinding; animation: WorldAnimationAction; scale: number }) {
  const gltf = useLoader(GLTFLoader, binding.assetUri);
  const root = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const action = useRef<THREE.AnimationAction | null>(null);
  const clip = useMemo(
    () => resolveWorldAnimationClip(animation, gltf.animations.map(item => item.name)),
    [animation, gltf.animations],
  );

  useEffect(() => {
    const nextMixer = new THREE.AnimationMixer(root);
    mixer.current = nextMixer;
    return () => {
      nextMixer.stopAllAction();
      nextMixer.uncacheRoot(root);
      if (mixer.current === nextMixer) mixer.current = null;
      action.current = null;
    };
  }, [root]);

  useEffect(() => {
    if (!mixer.current || !clip) return undefined;
    const resolvedClip = gltf.animations.find(item => item.name === clip);
    if (!resolvedClip) return undefined;
    const next = mixer.current.clipAction(resolvedClip);
    next.reset().fadeIn(0.16).play();
    action.current?.fadeOut(0.16);
    action.current = next;
    return () => {
      next.fadeOut(0.12);
    };
  }, [clip, gltf.animations]);

  useFrame((_, delta) => mixer.current?.update(delta));

  return <primitive object={root} scale={scale} />;
}

function RuntimeScene({ binding, animation, scale }: { binding: WorldVisualRuntimeBinding; animation: WorldAnimationAction; scale: number }) {
  return <Canvas camera={{ position: [0, 1.1, 3.2], fov: 32 }} frameloop="always">
    <ambientLight intensity={1.35} />
    <directionalLight position={[2, 4, 3]} intensity={1.5} />
    <Suspense fallback={null}>
      <RuntimeModel binding={binding} animation={animation} scale={scale} />
    </Suspense>
  </Canvas>;
}

export function WorldVisualRuntimeHost({ binding, animation = 'idle', width, height, scale = 1 }: WorldVisualRuntimeHostProps) {
  if (!binding?.assetUri || binding.source === 'native') return null;

  if (binding.representation === '2d') {
    return <Image source={{ uri: binding.assetUri }} resizeMode="contain" style={[styles.image, { width, height }]} />;
  }

  if (binding.channel === '3d' || binding.channel === '2.5d') {
    return <View pointerEvents="none" style={{ width, height }}>
      <RuntimeScene binding={binding} animation={animation} scale={scale} />
    </View>;
  }

  return null;
}

const styles = StyleSheet.create({ image: { position: 'absolute' } });
