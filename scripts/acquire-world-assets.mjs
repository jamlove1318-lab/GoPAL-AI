#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const OUT = path.join(ROOT, 'artifacts/external-world');
const USER_AGENT = 'GoPAL-AI-world-asset-acquirer/1.1';

const wantedPolyHaven = [
  { id: 'meadow', kind: 'hdri', role: 'lighting', resolutions: ['2k', '1k'] },
  { id: 'grass_medium_01', kind: 'model', role: 'ground-cover', resolutions: ['2k', '1k'] },
  { id: 'tree_small_02', kind: 'model', role: 'tree', resolutions: ['2k', '1k'] },
  { id: 'pine_tree_01', kind: 'model', role: 'tree', resolutions: ['2k', '1k'] },
  { id: 'tree_stump_01', kind: 'model', role: 'prop', resolutions: ['2k', '1k'] },
];

async function getJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

function selectModelPackage(files, resolutions) {
  for (const resolution of resolutions) {
    const candidate = files?.gltf?.[resolution];
    if (!candidate) continue;
    const glb = candidate.glb ?? candidate.gltf;
    if (glb?.url) return { resolution, format: glb === candidate.glb ? 'glb' : 'gltf', ...glb };
  }
  return null;
}

function selectHdri(files, resolutions) {
  for (const resolution of resolutions) {
    const candidate = files?.hdri?.[resolution]?.hdr;
    if (candidate?.url) return { resolution, format: 'hdr', ...candidate };
  }
  return null;
}

async function download(url, destination, expectedMd5) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (expectedMd5) {
    const md5 = createHash('md5').update(bytes).digest('hex');
    if (md5 !== expectedMd5) {
      throw new Error(`checksum mismatch for ${destination}: expected ${expectedMd5}, got ${md5}`);
    }
  }
  await writeFile(destination, bytes);
  return bytes.length;
}

await mkdir(OUT, { recursive: true });
const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
const acquired = [];
const failures = [];

for (const asset of wantedPolyHaven) {
  try {
    const info = await getJson(`https://api.polyhaven.com/info/${asset.id}`);
    const expectedType = asset.kind === 'model' ? 2 : 0;
    if (info.type !== expectedType) throw new Error(`unexpected Poly Haven type: ${info.type}`);

    const files = await getJson(`https://api.polyhaven.com/files/${asset.id}`);
    const selected = asset.kind === 'model'
      ? selectModelPackage(files, asset.resolutions)
      : selectHdri(files, asset.resolutions);
    if (!selected) throw new Error('no suitable complete runtime file found');

    const extension = selected.format;
    const destination = path.join(OUT, `${asset.id}.${extension}`);
    const size = await download(selected.url, destination, selected.md5);
    acquired.push({
      id: `polyhaven:${asset.id}`,
      role: asset.role,
      source: `https://polyhaven.com/a/${asset.id}`,
      license: 'CC0',
      resolution: selected.resolution,
      format: selected.format,
      path: path.relative(ROOT, destination),
      bytes: size,
      md5: selected.md5 ?? null,
    });
    console.log(`[OK] ${asset.id} -> ${path.relative(ROOT, destination)}`);
  } catch (error) {
    failures.push({ id: asset.id, error: error instanceof Error ? error.message : String(error) });
    console.error(`[FAIL] ${asset.id}: ${failures.at(-1).error}`);
  }
}

const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  sourcePolicy: manifest.policy,
  acquired,
  failures,
  manualCandidates: manifest.assets.filter(asset => asset.status === 'candidate'),
  nextStep: 'Validate acquired sources in Blender, generate mobile LODs, and export only approved runtime-ready assets. Do not commit large source downloads by default.',
};

await writeFile(path.join(OUT, 'acquisition-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`[OK] wrote ${path.relative(ROOT, path.join(OUT, 'acquisition-report.json'))}`);
if (failures.length) process.exitCode = 1;
