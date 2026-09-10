#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const MINI_GAME_MANIFEST = path.join(ROOT, 'assets/world/mini-game-asset-manifest.json');
const OUT = path.join(ROOT, 'artifacts/external-world');
const USER_AGENT = 'GoPAL-AI-world-asset-acquirer/2.2';
const MAX_SOURCE_BYTES = Number(process.env.GOPAL_ASSET_MAX_BYTES ?? 250_000_000);

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
    const entry = files?.gltf?.[resolution];
    const file = firstPresent(entry?.gltf, entry?.glb, entry);
    if (file?.url && file?.md5) return { resolution, format: entry?.glb?.url ? 'glb' : 'gltf', file };
  }
  throw new Error('no checksum-backed glTF/GLB model package found');
}

function selectHdri(files, resolutions) {
  for (const resolution of resolutions) {
    const file = firstPresent(files?.hdri?.[resolution]?.hdr, files?.hdri?.[resolution]);
    if (file?.url && file?.md5) return { resolution, format: 'hdr', file };
  }
  throw new Error('no checksum-backed HDR file found');
}

async function downloadFile(file, destination) {
  if (file.size && file.size > MAX_SOURCE_BYTES) throw new Error(`source file exceeds ${MAX_SOURCE_BYTES} byte safety limit: ${file.size}`);
  const response = await fetch(file.url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${file.url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_SOURCE_BYTES) throw new Error(`download exceeds ${MAX_SOURCE_BYTES} byte safety limit`);
  if (file.size && bytes.length !== file.size) throw new Error(`size mismatch for ${destination}: expected ${file.size}, got ${bytes.length}`);
  const md5 = createHash('md5').update(bytes).digest('hex');
  if (file.md5 && md5 !== file.md5) throw new Error(`checksum mismatch for ${destination}: expected ${file.md5}, got ${md5}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return { bytes: bytes.length, md5 };
}

function safeRelativePath(value, fallback = 'dependency.bin') {
  const normalized = String(value || fallback).replaceAll('\\', '/');
  const safe = path.posix.normalize(normalized).replace(/^\/+/, '');
  if (safe.startsWith('../') || safe === '..' || safe.includes('/../')) return fallback;
  return safe;
}

async function acquireFileTree(node, destination, records = []) {
  if (!node || typeof node !== 'object') return records;
  if (node.url) {
    const result = await downloadFile(node, destination);
    records.push({ path: path.relative(ROOT, destination), url: node.url, md5: result.md5, sourceMd5: node.md5 ?? null, bytes: result.bytes });
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
const miniGameManifest = JSON.parse(await readFile(MINI_GAME_MANIFEST, 'utf8'));
const acquired = [];
const failures = [];

for (const asset of wantedPolyHaven) {
  try {
    const info = await getJson(`https://api.polyhaven.com/info/${asset.id}`);
    const expectedType = asset.kind === 'model' ? 2 : 0;
    if (info.type !== expectedType) throw new Error(`unexpected Poly Haven type: ${info.type}`);
    const files = await getJson(`https://api.polyhaven.com/files/${asset.id}`);
    const selected = asset.kind === 'model' ? selectModelPackage(files, asset.resolutions) : selectHdri(files, asset.resolutions);
    const extension = selected.format === 'hdr' ? 'hdr' : selected.format;
    const destination = path.join(OUT, asset.id, `${asset.id}-${selected.resolution}.${extension}`);
    const records = await acquireFileTree(selected.file, destination);
    acquired.push({ id: `polyhaven:${asset.id}`, role: asset.role, source: `https://polyhaven.com/a/${asset.id}`, license: 'CC0', resolution: selected.resolution, format: selected.format, filesHash: info.files_hash ?? null, polycount: info.polycount ?? null, dimensions: info.dimensions ?? null, hasLods: info.lods ?? false, files: records, sourceFileTree: `https://api.polyhaven.com/files/${asset.id}` });
    console.log(`[OK] ${asset.id} -> ${records.length} file(s)`);
  } catch (error) {
    failures.push({ id: asset.id, error: error instanceof Error ? error.message : String(error) });
    console.error(`[FAIL] ${asset.id} -> ${failures.at(-1).error}`);
  }
}

const miniGameSources = miniGameManifest.assets.map((asset) => ({
  id: asset.id,
  provider: asset.provider,
  sourcePage: asset.sourcePage,
  license: asset.license,
  status: asset.status,
  assetType: asset.assetType,
  representation: asset.representation,
  families: asset.families,
  usedBy: asset.usedBy,
  downloadStrategy: asset.downloadStrategy,
  acquiredAutomatically: false,
}));

const report = {
  schemaVersion: 6,
  generatedAt: new Date().toISOString(),
  sourcePolicy: manifest.policy,
  maxSourceBytes: MAX_SOURCE_BYTES,
  acquired,
  failures,
  miniGameSources,
  miniGameAcquisition: {
    mode: 'single-batch-manifest',
    status: 'planned',
    reason: 'Mini-game sources intentionally remain on official source pages until their downloadable package URL and checksum are captured. This prevents scraping or silently trusting mutable third-party download endpoints.',
    nextStep: 'Capture verified download URLs/checksums for approved mini-game sources, then acquire them in this same command and report.',
  },
  manualCandidates: manifest.assets.filter((asset) => asset.status === 'candidate'),
  nextStep: 'Validate source packages in Blender, generate mobile LODs/material atlases, review visually, then promote only approved runtime-ready assets.',
};

await writeFile(path.join(OUT, 'acquisition-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`[OK] wrote ${path.relative(ROOT, path.join(OUT, 'acquisition-report.json'))}`);
console.log(`[OK] inventoried ${miniGameSources.length} mini-game asset source(s) in the same batch report`);
if (failures.length) process.exitCode = 1;
