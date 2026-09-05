import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import type { StyleProp, ViewStyle } from 'react-native';
import type { CassidyVisualCommand } from './cassidyVisualResolver';
import {
  CASSIDY_RUNTIME_MORPHS,
  validateCassidyRuntimeModel,
} from './cassidyRuntimeModelContract';

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

  const runtimeValidation = useMemo(() => {
    const nodeNames: string[] = [];
    const morphNames: string[] = [];

    root.traverse(object => {
      nodeNames.push(object.name);
      const mesh = object as THREE.Mesh;
      if (!mesh.morphTargetDictionary) return;
      morphNames.push(...Object.keys(mesh.morphTargetDictionary));
    });

    return validateCassidyRuntimeModel({
      animationNames: gltf.animations.map(clip => clip.name),
      morphNames,
      nodeNames,
    });
  }, [gltf.animations, root]);

  useEffect(() => {
    mixerRef.current = new THREE.AnimationMixer(root);

    return () => {
      mixerRef.current?.stopAllAction();
      mixerRef.current?.uncacheRoot(root);
      mixerRef.current = null;
      actionRef.current = null;
    };
  }, [root]);

  useEffect(() => {
    if (!runtimeValidation.valid) return;

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
  }, [clipsByName, command.animation, runtimeValidation.valid]);

  useEffect(() => {
    if (!runtimeValidation.valid) return;

    root.traverse(object => {
      if (!(object instanceof THREE.Mesh) || !object.morphTargetDictionary || !object.morphTargetInfluences) {
        return;
      }

      const activeMorph = CASSIDY_RUNTIME_MORPHS[command.expression];
      for (const [name, index] of Object.entries(object.morphTargetDictionary)) {
        object.morphTargetInfluences[index] = name === activeMorph ? 1 : 0;
      }
    });
  }, [command.expression, root, runtimeValidation.valid]);

  useFrame((_, delta) => {
    if (runtimeValidation.valid) mixerRef.current?.update(delta);
  });

  // Fail closed: a malformed production GLB never becomes visible as Cassidy.
  if (!runtimeValidation.valid) return null;

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
 * The resolver decides whether production rendering is allowed. Once a real
 * model is supplied, the loaded GLB is independently checked against the
 * stable runtime contract before any geometry, animation, or expressions are
 * presented. Invalid production assets fail closed and leave the fallback
 * presentation responsible for the character.
 */
export function Cassidy3DScene({
  command,
  style,
  cameraPosition = [0, 1.45, 3.2],
  cameraFov = 32,
}: Cassidy3DSceneProps) {
  const canRenderProduction =
    command.assetTier !== 'fallback' &&
    Boolean(command.model3dUri) &&
    command.visible;

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
