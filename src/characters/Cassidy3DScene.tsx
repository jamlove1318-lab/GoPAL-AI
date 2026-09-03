import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import type { StyleProp, ViewStyle } from 'react-native';
import type { CassidyVisualCommand } from './cassidyVisualResolver';
import { CASSIDY_RUNTIME_MORPHS } from './cassidyRuntimeModelContract';

interface Cassidy3DModelProps {
  command: CassidyVisualCommand;
}

function Cassidy3DModel({ command }: Cassidy3DModelProps) {
  if (!command.model3dUri) return null;

  return <LoadedCassidyModel command={command} />;
}

function LoadedCassidyModel({ command }: Cassidy3DModelProps) {
  const gltf = useLoader(GLTFLoader, command.model3dUri as string);
  const root = gltf.scene;
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);

  const clipsByName = useMemo(
    () => new Map(gltf.animations.map(clip => [clip.name, clip])),
    [gltf.animations],
  );

  useEffect(() => {
    mixerRef.current = new THREE.AnimationMixer(root);

    return () => {
      mixerRef.current?.stopAllAction();
      mixerRef.current?.uncacheRoot(root);
      mixerRef.current = null;
    };
  }, [root]);

  useEffect(() => {
    const mixer = mixerRef.current;
    if (!mixer) return;

    const clip = clipsByName.get(command.animation);
    if (!clip) return;

    const nextAction = mixer.clipAction(clip);
    nextAction.reset().fadeIn(0.16).play();
    actionRef.current?.fadeOut(0.16);
    actionRef.current = nextAction;

    return () => {
      nextAction.fadeOut(0.12);
    };
  }, [clipsByName, command.animation]);

  useEffect(() => {
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh) || !object.morphTargetDictionary || !object.morphTargetInfluences) {
        return;
      }

      const activeMorph = CASSIDY_RUNTIME_MORPHS[command.expression];
      for (const [name, index] of Object.entries(object.morphTargetDictionary)) {
        object.morphTargetInfluences[index] = name === activeMorph ? 1 : 0;
      }
    });
  }, [command.expression, root]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return <primitive object={root} />;
}

export interface Cassidy3DSceneProps {
  command: CassidyVisualCommand;
  style?: StyleProp<ViewStyle>;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
}

/**
 * Reusable presentation surface for a production Cassidy GLB.
 *
 * This host renders only a production model supplied by the visual command.
 * When the registry is still pending, it intentionally renders no fake 3D
 * character; the existing 2D/fallback presentation remains responsible for
 * that state.
 */
export function Cassidy3DScene({
  command,
  style,
  cameraPosition = [0, 1.45, 3.2],
  cameraFov = 32,
}: Cassidy3DSceneProps) {
  const canRenderProduction = command.assetTier !== 'fallback' && Boolean(command.model3dUri);

  return (
    <Canvas
      style={style}
      camera={{ position: cameraPosition, fov: cameraFov, near: 0.05, far: 100 }}
      dpr={1}
      frameloop="always"
    >
      {canRenderProduction ? (
        <Suspense fallback={null}>
          <ambientLight intensity={1.4} />
          <directionalLight position={[2.5, 4, 3]} intensity={2.1} />
          <directionalLight position={[-2, 2, 1]} intensity={0.65} />
          <Cassidy3DModel command={command} />
        </Suspense>
      ) : null}
    </Canvas>
  );
}
