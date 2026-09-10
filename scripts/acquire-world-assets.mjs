#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const MINI_GAME_MANIFEST = path.join(ROOT, 'assets/world/mini-game-asset-manifest.json');
const MINI_GAME_PLAN = path.join(ROOT, 'assets/world/mini-game-acquisition-plan.json');
const OUT = path.join(ROOT, 'artifacts/external-world');
const USER_AGENT = 'GoPAL-AI-world-asset-acquirer/2.3';
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

async function getText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
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
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return { bytes: bytes.length, md5, sha256 };
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
    records.push({ path: path.relative(ROOT, destination), url: node.url, md5: result.md5, sha256: result.sha256, sourceMd5: node.md5 ?? null, bytes: result.bytes });
  }
  if (node.include && typeof node.include === 'object') {
    for (const [relativeName, child] of Object.entries(node.include)) {
      await acquireFileTree(child, path.join(path.dirname(destination), safeRelativePath(relativeName)), records);
    }
  }
  return records;
}

function extractZipLinks(html, pageUrl) {
  const links = new Set();
  const pattern = /(?:href|data-download-url)=["']([^"']+\.zip(?:\?[^"']*)?)["']/gi;
  for (const match of html.matchAll(pattern)) {
    try {
      links.add(new URL(match[1], pageUrl).toString());
    } catch {
      // Ignore malformed links; acquisition remains fail-closed.
    }
  }
  return [...links];
}

function assertAllowedHost(url, allowedHosts) {
  const hostname = new URL(url).hostname.toLowerCase();
  return allowedHosts.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`));
}

async function resolveOfficialPackage(planEntry) {
  const html = await getText(planEntry.sourcePage);
  const candidates = extractZipLinks(html, planEntry.sourcePage)
    .filter((url) => assertAllowedHost(url, planEntry.allowedHosts))
    .filter((url) => new URL(url).pathname.toLowerCase().endsWith('.zip'))
    .filter((url) => new URL(url).pathname.toLowerCase().includes(planEntry.filenameContains.toLowerCase()));
  if (!candidates.length) {
    throw new Error(`no allowlisted ZIP matching ${planEntry.filenameContains} was discoverable from ${planEntry.sourcePage}`);
  }
  return candidates[0];
}

async function acquireMiniGamePackage(planEntry) {
  const url = await resolveOfficialPackage(planEntry);
  const fileName = path.basename(new URL(url).pathname);
  const destination = path.join(OUT, 'mini-games', planEntry.id.replace(':', '__'), fileName);
  const result = await downloadFile({ url }, destination);
  return {
    id: planEntry.id,
    priority: planEntry.priority,
    sourcePage: planEntry.sourcePage,
    resolvedUrl: url,
    fileName,
    bytes: result.bytes,
    sha256: result.sha256,
  };
}

await mkdir(OUT, { recursive: true });
const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
const miniGameManifest = JSON.parse(await readFile(MINI_GAME_MANIFEST, 'utf8'));
const miniGamePlan = JSON.parse(await readFile(MINI_GAME_PLAN, 'utf8'));
const acquired = [];
const failures = [];
const miniGameAcquired = [];
const miniGameFailures = [];

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

for (const planEntry of miniGamePlan.assets) {
  try {
    const catalogEntry = miniGameManifest.assets.find((asset) => asset.id === planEntry.id);
    if (!catalogEntry) throw new Error('acquisition plan references an asset missing from mini-game manifest');
    if (catalogEntry.license !== 'CC0') throw new Error(`catalog license is not CC0: ${catalogEntry.license}`);
    const result = await acquireMiniGamePackage(planEntry);
    miniGameAcquired.push(result);
    console.log(`[OK] mini-game ${planEntry.id} -> ${result.fileName} (${result.sha256.slice(0, 12)}…)`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    miniGameFailures.push({ id: planEntry.id, priority: planEntry.priority, error: message });
    console.error(`[FAIL] mini-game ${planEntry.id} -> ${message}`);
  }
}

const plannedIds = new Set(miniGamePlan.assets.map((asset) => asset.id));
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
  acquisitionPlanned: plannedIds.has(asset.id),
  acquiredAutomatically: miniGameAcquired.some((item) => item.id === asset.id),
}));

const report = {
  schemaVersion: 7,
  generatedAt: new Date().toISOString(),
  sourcePolicy: manifest.policy,
  maxSourceBytes: MAX_SOURCE_BYTES,
  acquired,
  failures,
  miniGameSources,
  miniGameAcquisition: {
    mode: miniGamePlan.mode,
    status: miniGameFailures.length ? 'partial-failure' : 'acquired',
    policy: miniGamePlan.policy,
    planCount: miniGamePlan.assets.length,
    acquiredCount: miniGameAcquired.length,
    failedCount: miniGameFailures.length,
    acquired: miniGameAcquired,
    failures: miniGameFailures,
    remainingApprovedSources: miniGameSources.filter((asset) => asset.status === 'approved-source' && !plannedIds.has(asset.id)).map((asset) => asset.id),
    nextStep: 'Validate acquired archives, normalize selected runtime assets, perform mobile validation and human visual approval, then promote only validated-runtime assets.',
  },
  manualCandidates: manifest.assets.filter((asset) => asset.status === 'candidate'),
  nextStep: 'Validate source packages in Blender, generate mobile LODs/material atlases, review visually, then promote only approved runtime-ready assets.',
};

await writeFile(path.join(OUT, 'acquisition-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`[OK] wrote ${path.relative(ROOT, path.join(OUT, 'acquisition-report.json'))}`);
console.log(`[OK] acquired ${miniGameAcquired.length}/${miniGamePlan.assets.length} selected mini-game package(s)`);
if (failures.length || miniGameFailures.length) process.exitCode = 1;
