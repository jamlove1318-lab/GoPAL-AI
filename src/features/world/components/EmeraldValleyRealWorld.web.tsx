import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Asset } from 'expo-asset';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const COUNTRY_STATION = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/starter/starter-country-station.glb');
const EXPRESS_PACIFIC = require('../../../../assets/world/emerald-valley/railway/steam-era-railway/models/steam-era-railway-and-rolling-stock-express-pacific-4--e04974dc.glb');
const MOUNTAINSIDE = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/model/mountainside.gltf');
const MOUNTAINSIDE_BIN = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/model/mountainside.bin');
const MOUNTAINSIDE_NORMAL = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/textures/mountainside_nor_gl_4k.jpg');
const MOUNTAINSIDE_DIFFUSE = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/textures/mountainside_diff_4k.jpg');
const MOUNTAINSIDE_ARM = require('../../../../assets/world/emerald-valley/landscape/polyhaven-mountainside/textures/mountainside_arm_4k.jpg');

function loadUrl(moduleRef: number | string) {
  return Asset.loadAsync(moduleRef).then(([asset]) => asset.localUri ?? asset.uri);
}

function createScene(urls: Record<string, string>) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9fcbd7');
  scene.fog = new THREE.Fog('#a9c8bf', 36, 125);
  scene.add(new THREE.HemisphereLight('#dcebe2', '#304b3d', 1.35));
  scene.add(new THREE.AmbientLight('#ffffff', 0.82));
  const sun = new THREE.DirectionalLight('#fff4df', 2.2);
  sun.position.set(12, 24, 10);
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(130, 155), new THREE.MeshStandardMaterial({ color: '#567153', roughness: 0.98 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.6, 8);
  scene.add(ground);

  const valleyFloor = new THREE.Mesh(new THREE.PlaneGeometry(38, 118), new THREE.MeshStandardMaterial({ color: '#788d61', roughness: 1 }));
  valleyFloor.rotation.x = -Math.PI / 2;
  valleyFloor.position.set(0, -0.53, 19);
  scene.add(valleyFloor);

  const streams: Array<Array<[number, number, number]>> = [
    [[-7, -0.15, -25], [-5, -0.1, -17], [-3, -0.08, -9], [-1, -0.15, 0], [2, -0.27, 10], [5, -0.32, 21], [8, -0.35, 39]],
    [[-26, -0.2, 4], [-18, -0.22, 8], [-11, -0.25, 12], [-5, -0.29, 16], [2, -0.32, 21]],
  ];
  streams.forEach((points, i) => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.65);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 72, i === 0 ? 1 : 0.58, 10, false), new THREE.MeshPhysicalMaterial({ color: '#4b9fbe', roughness: 0.16, metalness: 0.02, transparent: true, opacity: 0.9 })));
  });

  const treePositions: Array<[number, number, number]> = [
    [-25, 18, 2.2], [-21, 6, 1.8], [-17, -5, 2.5], [-29, -15, 2],
    [23, 19, 2.2], [28, 6, 2.7], [20, -10, 2], [31, -20, 2.4],
  ];
  treePositions.forEach(([x, z, scale], i) => {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.2, 6), new THREE.MeshStandardMaterial({ color: '#5a4536' }));
    trunk.position.y = 1.1;
    tree.add(trunk);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(1.25, 3.2, 7), new THREE.MeshStandardMaterial({ color: i % 2 ? '#416f4b' : '#355f43', roughness: 0.95 }));
    crown.position.y = 2.7;
    tree.add(crown);
    scene.add(tree);
  });

  const loader = new GLTFLoader();
  loader.manager.setURLModifier((url) => {
    const clean = String(url).split('?')[0].split('#')[0];
    const filename = clean.slice(clean.lastIndexOf('/') + 1);
    return urls[filename] ?? url;
  });

  let disposed = false;
  const addGltf = (url: string, position: [number, number, number], scale: number, rotationY = 0) => {
    loader.load(url, (gltf) => {
      if (disposed) return;
      gltf.scene.position.set(...position);
      gltf.scene.rotation.y = rotationY;
      gltf.scene.scale.setScalar(scale);
      scene.add(gltf.scene);
    });
  };

  addGltf(urls['mountainside.gltf'], [-20, 4.5, -55], 0.075, Math.PI);
  addGltf(urls['mountainside.gltf'], [12, 4.2, -62], 0.082, Math.PI);
  addGltf(urls['mountainside.gltf'], [36, 3.5, -50], 0.058, Math.PI);
  addGltf(urls['mountainside.gltf'], [-38, 3.2, -43], 0.055, Math.PI);
  addGltf(urls['mountainside.gltf'], [-4, 4, -42], 0.09, Math.PI);
  addGltf(urls['starter-country-station.glb'], [8, -0.15, 28], 1.05);

  let train: THREE.Object3D | null = null;
  loader.load(urls['express-pacific.glb'], (gltf) => {
    if (disposed) return;
    train = gltf.scene;
    train.position.set(8, 0.05, 23);
    train.rotation.y = Math.PI * 0.5;
    train.scale.setScalar(0.92);
    scene.add(train);
  });

  return {
    scene,
    update(time: number) {
      if (!train) return;
      train.position.x = 8 + Math.sin(time * 0.035) * 1.8;
      train.position.z = 23 + Math.cos(time * 0.035) * 0.4;
    },
    dispose() {
      disposed = true;
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => material.dispose());
      });
    },
  };
}

export function EmeraldValleyRealWorld() {
  const hostRef = useRef<any>(null);

  useEffect(() => {
    const host = hostRef.current as HTMLElement | null;
    if (!host) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrame = 0;
    let world: ReturnType<typeof createScene> | null = null;
    let resize: (() => void) | null = null;
    let cancelled = false;

    const start = async () => {
      const [station, train, mountain, mountainBin, normal, diffuse, arm] = await Promise.all([
        loadUrl(COUNTRY_STATION), loadUrl(EXPRESS_PACIFIC), loadUrl(MOUNTAINSIDE), loadUrl(MOUNTAINSIDE_BIN),
        loadUrl(MOUNTAINSIDE_NORMAL), loadUrl(MOUNTAINSIDE_DIFFUSE), loadUrl(MOUNTAINSIDE_ARM),
      ]);
      if (cancelled) return;

      const urls = {
        'starter-country-station.glb': station,
        'express-pacific.glb': train,
        'mountainside.gltf': mountain,
        'mountainside.bin': mountainBin,
        'mountainside_nor_gl_4k.jpg': normal,
        'mountainside_diff_4k.jpg': diffuse,
        'mountainside_arm_4k.jpg': arm,
      };

      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      host.replaceChildren(canvas);

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      world = createScene(urls);
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 170);
      camera.position.set(17, 10.5, 22);
      camera.lookAt(0, 1.5, 5);

      resize = () => {
        if (!renderer) return;
        const width = Math.max(host.clientWidth || 1280, 1);
        const height = Math.max(host.clientHeight || 720, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', resize);
      resize();

      const clock = new THREE.Clock();
      const render = () => {
        if (cancelled || !renderer || !world) return;
        world.update(clock.getElapsedTime());
        renderer.render(world.scene, camera);
        animationFrame = requestAnimationFrame(render);
      };
      render();
    };

    void start().catch((error) => {
      if (!cancelled) console.error('[Emerald Valley web renderer]', error);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      if (resize) window.removeEventListener('resize', resize);
      world?.dispose();
      renderer?.dispose();
      host.replaceChildren();
    };
  }, []);

  return <View ref={hostRef} pointerEvents="none" style={styles.root} />;
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', backgroundColor: '#9fcbd7', overflow: 'hidden' },
});
