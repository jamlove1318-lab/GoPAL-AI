#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const OUT = path.join(ROOT, 'artifacts/external-world');
const USER_AGENT = 'GoPAL-AI-world-asset-acquirer/1.0';

const wantedPolyHaven = [
  { id: 'meadow', kind: 'hdri', role: 'lighting' },
  { id: 'grass_medium_01', kind: 'model', role: 'ground-cover' },
  { id: 'tree_small_02', kind: 'model', role: 'tree' },
  { id: 'pine_tree_01', kind: 'model', role: 'tree' },
  { id: 'tree_stump_01', kind: 'model', role: 'prop' },
];

async function getJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

function findGltfFile(tree) {
  const preferred = ['2k', '1k', '4k'];
  for (const resolution of preferred) {
    const candidate = tree?.gltf?.[resolution]?.gltf;
    if (candidate?.url) return { resolution, ...candidate };
  }
  return null;
}

function findHdriFile(tree) {
  for (const resolution of ['4k', '2k', '1k']) {
    const candidate = tree?.hdri?.[resolution]?.hdr;
    if (candidate?.url) return { resolution, ...candidate };
  }
  return null;
}

async function download(url, destination, expectedMd5) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (expectedMd5) {
    const md5 = createHash('md5').update(bytes).digest('hex');
    if (md5 !== expectedMd5) throw new Error(`checksum mismatch for ${destination}: expected ${expectedMd5}, got ${md5}`);
  }
  await writeFile(destination, bytes);
  return bytes.length;
}

await mkdir(OUT, { recursive: true });
const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
const acquired = [];

for (const asset of wantedPolyHaven) {
  const info = await getJson(`https://api.polyhaven.com/info/${asset.id}`);
  if (info.type !== (asset.kind === 'model' ? 2 : 0)) {
    throw new Error(`unexpected Poly Haven type for ${asset.id}`);
  }

  const files = await getJson(`https://api.polyhaven.com/files/${asset.id}`);
  const selected = asset.kind === 'model' ? findGltfFile(files) : findHdriFile(files);
  if (!selected) throw new Error(`no suitable runtime file found for ${asset.id}`);

  const extension = asset.kind === 'model' ? 'gltf' : 'hdr';
  const destination = path.join(OUT, `${asset.id}.${extension}`);
  const size = await download(selected.url, destination, selected.md5);
  acquired.push({
    id: `polyhaven:${asset.id}`,
    role: asset.role,
    source: `https://polyhaven.com/a/${asset.id}`,
    license: 'CC0',
    resolution: selected.resolution,
    path: path.relative(ROOT, destination),
    bytes: size,
    md5: selected.md5,
  });
  console.log(`[OK] ${asset.id} -> ${path.relative(ROOT, destination)}`);
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sourcePolicy: manifest.policy,
  acquired,
  manualCandidates: manifest.assets.filter(asset => asset.status === 'candidate'),
  nextStep: 'Open downloaded sources in Blender, validate geometry/materials/LODs, then export approved runtime-ready assets into the app asset pipeline. Do not commit large source downloads by default.',
};

await writeFile(path.join(OUT, 'acquisition-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`[OK] wrote ${path.relative(ROOT, path.join(OUT, 'acquisition-report.json'))}`);
console.log('[NOTE] Quaternius character/animation packs remain candidate sources because their public download flow is separate; validate and acquire them through the official pack page before runtime integration.');
