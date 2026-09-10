#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const OUT = path.join(ROOT, 'artifacts/external-world');
const USER_AGENT = 'GoPAL-AI-world-asset-acquirer/2.0';

// Curated, mobile-minded first wave. We deliberately keep the source tier broad,
// but the runtime tier is still gated by Blender validation + LOD generation.
const wantedPolyHaven = [
  { id: 'meadow', kind: 'hdri', role: 'lighting', resolutions: ['2k', '1k'] },
  { id: 'grass_medium_01', kind: 'model', role: 'ground-cover', resolutions: ['2k', '1k'] },
  { id: 'tree_small_02', kind: 'model', role: 'tree', resolutions: ['2k', '1k'] },
  { id: 'pine_tree_01', kind: 'model', role: 'tree', resolutions: ['2k', '1k'] },
  { id: 'tree_stump_01', kind: 'model', role: 'prop', resolutions: ['2k', '1k'] },
  { id: 'covered_car', kind: 'model', role: 'vehicle:car', resolutions: ['2k', '1k'] },
  { id: 'sofa_02', kind: 'model', role: 'furniture:sofa', resolutions: ['2k', '1k'] },
  { id: 'shelf_01', kind: 'model', role: 'furniture:shelf', resolutions: ['2k', '1k'] },
  { id: 'side_table_01', kind: 'model', role: 'furniture:table', resolutions: ['2k', '1k'] },
  { id: 'woodentable_01', kind: 'model', role: 'furniture:table', resolutions: ['2k', '1k'] },
  { id: 'classicnightstand_01', kind: 'model', role: 'furniture:nightstand', resolutions: ['2k', '1k'] },
  { id: 'modular_urban_apartments_facade', kind: 'model', role: 'building:residential', resolutions: ['2k', '1k'] },
  { id: 'modular_factory_facade', kind: 'model', role: 'building:industrial', resolutions: ['2k', '1k'] },
  { id: 'modular_fire_escape', kind: 'model', role: 'building:detail', resolutions: ['2k', '1k'] },
  { id: 'ladder_sectioned_01', kind: 'model', role: 'prop:utility', resolutions: ['2k', '1k'] },
];

async function getJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

function firstPresent(...values) {
  return values.find((value) => value && typeof value === 'object' && value.url);
}

function selectModelPackage(files, resolutions) {
  for (const resolution of resolutions) {
    const gltfEntry = files?.gltf?.[resolution];
    const gltfFile = firstPresent(gltfEntry?.gltf, gltfEntry?.glb, gltfEntry);
    if (gltfFile?.url && gltfFile?.md5) return { resolution, format: 'gltf', file: gltfFile };
  }
  throw new Error('no checksum-backed glTF/GLB model package found');
}

function selectHdri(files, resolutions) {
  for (const resolution of resolutions) {
    const hdr = firstPresent(
      files?.hdri?.[resolution]?.hdr,
      files?.hdri?.[resolution],
    );
    if (hdr?.url && hdr?.md5) return { resolution, format: 'hdr', file: hdr };
  }
  throw new Error('no checksum-backed HDR file found');
}

async function downloadFile(file, destination) {
  const response = await fetch(file.url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${file.url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (file.size && bytes.length !== file.size) {
    throw new Error(`size mismatch for ${destination}: expected ${file.size}, got ${bytes.length}`);
  }
  const md5 = createHash('md5').update(bytes).digest('hex');
  if (file.md5 && md5 !== file.md5) {
    throw new Error(`checksum mismatch for ${destination}: expected ${file.md5}, got ${md5}`);
  }
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return { bytes: bytes.length, md5 };
}

function safeRelativePath(value) {
  const normalized = String(value || 'dependency.bin').replaceAll('\\', '/');
  const safe = path.posix.normalize(normalized).replace(/^\/+/, '');
  if (safe.startsWith('../') || safe === '..') return `dependency-${Date.now()}.bin`;
  return safe;
}

async function acquireFileTree(node, destination, records = []) {
  if (!node || typeof node !== 'object') return records;
  if (node.url) {
    const result = await downloadFile(node, destination);
    records.push({
      path: path.relative(ROOT, destination),
      url: node.url,
      md5: result.md5,
      sourceMd5: node.md5 ?? null,
      bytes: result.bytes,
    });
  }

  if (node.include && typeof node.include === 'object') {
    for (const [relativeName, child] of Object.entries(node.include)) {
      await acquireFileTree(child, path.join(path.dirname(destination), safeRelativePath(relativeName)), records);
    }
  }
  return records;
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

    const extension = selected.format === 'gltf' ? 'gltf' : 'hdr';
    const destination = path.join(OUT, `${asset.id}-${selected.resolution}.${extension}`);
    const records = await acquireFileTree(selected.file, destination);

    acquired.push({
      id: `polyhaven:${asset.id}`,
      role: asset.role,
      source: `https://polyhaven.com/a/${asset.id}`,
      license: 'CC0',
      resolution: selected.resolution,
      format: selected.format,
      files: records,
      sourceFileTree: `https://api.polyhaven.com/files/${asset.id}`,
    });
    console.log(`[OK] ${asset.id} -> ${records.length} file(s)`);
  } catch (error) {
    failures.push({ id: asset.id, error: error instanceof Error ? error.message : String(error) });
    console.error(`[FAIL] ${asset.id}: ${failures.at(-1).error}`);
  }
}

const report = {
  schemaVersion: 4,
  generatedAt: new Date().toISOString(),
  sourcePolicy: manifest.policy,
  acquired,
  failures,
  manualCandidates: manifest.assets.filter((asset) => asset.status === 'candidate'),
  nextStep: 'Validate source packages in Blender, generate mobile LODs/material atlases, review visually, then promote only approved runtime-ready assets.',
};

await writeFile(path.join(OUT, 'acquisition-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`[OK] wrote ${path.relative(ROOT, path.join(OUT, 'acquisition-report.json'))}`);
if (failures.length) process.exitCode = 1;
