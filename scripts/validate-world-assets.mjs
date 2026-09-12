#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const MINI_GAME_MANIFEST_PATH = path.join(ROOT, 'assets/world/mini-game-asset-manifest.json');
const REPORT_PATH = path.join(ROOT, 'artifacts/external-world/acquisition-report.json');

const fail = (message) => {
  console.error(`[FAIL] ${message}`);
  process.exitCode = 1;
};

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
const miniGameManifest = JSON.parse(await readFile(MINI_GAME_MANIFEST_PATH, 'utf8'));
const worldIds = new Set();
const miniGameIds = new Set();
const allowedLicenses = new Set(['CC0', 'clearly-commercial-safe']);
const allowedStatuses = new Set(['approved-source', 'candidate', 'validated-runtime']);
const allowedRepresentations = new Set(['2d', '2.5d', '3d']);
const allowedProviders = new Set(['polyhaven', 'quaternius', 'kenney', 'sketchfab', 'opengameart']);

if (manifest.schemaVersion < 3) fail('asset manifest is from an older schema');
if (manifest.policy?.runtimeBrains !== 1) fail('external asset policy must declare exactly one runtime brain');
if (manifest.policy?.redistributableStandaloneAssets !== false) fail('external source policy must default to non-redistributable standalone assets');
if (manifest.policy?.representationStrategy !== 'best-fit-per-scene') fail('representation strategy must remain best-fit-per-scene');
if (!Array.isArray(manifest.policy?.allowedRepresentations) || manifest.policy.allowedRepresentations.length !== 3) fail('manifest must allow 2d, 2.5d and 3d representations');
if (!Array.isArray(manifest.assets) || manifest.assets.length === 0) fail('asset manifest is empty');

for (const asset of manifest.assets) {
  if (!asset.id || worldIds.has(asset.id)) fail(`duplicate or missing world asset id: ${asset.id ?? '<missing>'}`);
  worldIds.add(asset.id);
  if (!allowedLicenses.has(asset.license)) fail(`${asset.id}: unsupported license ${asset.license}`);
  if (!allowedStatuses.has(asset.status)) fail(`${asset.id}: unsupported status ${asset.status}`);
  if (!allowedProviders.has(asset.provider)) fail(`${asset.id}: unsupported provider ${asset.provider}`);
  if (!asset.sourcePage?.startsWith('https://')) fail(`${asset.id}: sourcePage must be HTTPS`);

  const variants = asset.variants ?? asset.representations;
  if (variants !== undefined) {
    if (!Array.isArray(variants) || variants.length === 0) fail(`${asset.id}: variants must be a non-empty array`);
    for (const variant of variants ?? []) {
      if (!allowedRepresentations.has(variant.representation)) fail(`${asset.id}: invalid representation ${variant.representation}`);
      if (variant.minDistance !== undefined && variant.maxDistance !== undefined && variant.minDistance > variant.maxDistance) fail(`${asset.id}: invalid visual distance range`);
    }
  } else if (!allowedRepresentations.has(asset.representation)) {
    fail(`${asset.id}: invalid representation ${asset.representation}`);
  }

  if (asset.status === 'validated-runtime' && !asset.runtimePath) fail(`${asset.id}: validated-runtime requires runtimePath`);
  if ((asset.provider === 'sketchfab' || asset.provider === 'opengameart') && asset.status === 'approved-source') {
    if (!asset.sourceAssetId || !asset.licenseVerifiedAt) fail(`${asset.id}: discovery provider requires exact asset id and license verification timestamp`);
  }
}

if (miniGameManifest.schemaVersion < 1) fail('mini-game asset manifest is from an older schema');
if (miniGameManifest.policy?.sharedRuntimeBrain !== true) fail('mini-game assets must use the shared world/game runtime brain');
if (miniGameManifest.policy?.sourceOnlyUntilValidated !== true) fail('mini-game assets must remain source-only until validated');
if (miniGameManifest.policy?.noWeaponContent !== true) fail('mini-game asset policy must exclude weapon content');
if (!Array.isArray(miniGameManifest.assets) || miniGameManifest.assets.length === 0) fail('mini-game asset manifest is empty');

for (const asset of miniGameManifest.assets) {
  if (!asset.id || miniGameIds.has(asset.id)) fail(`duplicate or missing mini-game asset id: ${asset.id ?? '<missing>'}`);
  miniGameIds.add(asset.id);
  if (!allowedLicenses.has(asset.license)) fail(`${asset.id}: unsupported license ${asset.license}`);
  if (!allowedStatuses.has(asset.status)) fail(`${asset.id}: unsupported status ${asset.status}`);
  if (!allowedProviders.has(asset.provider)) fail(`${asset.id}: unsupported provider ${asset.provider}`);
  if (!asset.sourcePage?.startsWith('https://')) fail(`${asset.id}: sourcePage must be HTTPS`);
  if (!['visual', 'audio', 'font', 'data'].includes(asset.assetType)) fail(`${asset.id}: unsupported assetType ${asset.assetType}`);
  if (!allowedRepresentations.has(asset.representation)) fail(`${asset.id}: invalid representation ${asset.representation}`);
  if (!Array.isArray(asset.roles) || asset.roles.length === 0) fail(`${asset.id}: roles must be non-empty`);
  if (!Array.isArray(asset.families) || asset.families.length === 0) fail(`${asset.id}: families must be non-empty`);
  if (!Array.isArray(asset.usedBy) || asset.usedBy.length === 0) fail(`${asset.id}: usedBy must be non-empty`);
  if (asset.downloadStrategy !== 'official-page') fail(`${asset.id}: acquisition must use an official source page`);
  if ((asset.provider === 'sketchfab' || asset.provider === 'opengameart') && asset.status === 'approved-source') {
    if (!asset.sourceAssetId || !asset.licenseVerifiedAt) fail(`${asset.id}: discovery provider requires exact asset id and license verification timestamp`);
  }
}

const treeRoles = manifest.assets.filter((asset) => asset.role === 'environment:tree');
if (treeRoles.length < 2) fail('world needs at least two approved tree sources for visual variation');
if (!manifest.assets.some((asset) => asset.role === 'environment:ground-cover')) fail('world needs an environment ground-cover source');
if (!manifest.assets.some((asset) => asset.role === 'environment:lighting')) fail('world needs an environment lighting source');
if (!manifest.assets.some((asset) => asset.role === 'character:temporary-cassidy-candidate')) fail('temporary Cassidy candidate must remain explicitly replaceable');

try {
  const report = JSON.parse(await readFile(REPORT_PATH, 'utf8'));
  if (report.schemaVersion < 5) fail('acquisition report is from an older schema; reacquire before validation');
  for (const item of report.acquired ?? []) {
    if (!item.id || !item.source?.startsWith('https://')) fail('acquired source must retain provenance');
    if (item.license !== 'CC0') fail(`${item.id}: acquired Poly Haven assets must record CC0`);
    if (!item.filesHash) fail(`${item.id}: missing Poly Haven files_hash provenance`);
    if (!Array.isArray(item.files) || item.files.length === 0) fail(`${item.id}: acquired package has no files`);
    for (const file of item.files) {
      if (!file.path || file.path.includes('http')) fail(`${item.id}: file path must remain local`);
      if (!file.md5 || !file.sourceMd5) fail(`${item.id}: acquired file is missing checksum provenance`);
    }
  }
  for (const item of report.failures ?? []) console.warn(`[WARN] acquisition failure recorded for ${item.id}: ${item.error}`);
} catch {
  console.warn('[WARN] no acquisition report yet; run npm run acquire:world-assets before source validation');
}

for (const sourcePage of manifest.assets.map((asset) => asset.sourcePage)) {
  if (sourcePage.includes('api.polyhaven.com')) fail(`runtime manifest must not point at Poly Haven API: ${sourcePage}`);
}

if (process.exitCode) {
  console.error('[ABORT] external world + mini-game asset policy validation failed');
} else {
  console.log(`[OK] validated ${manifest.assets.length} external world asset entries`);
  console.log(`[OK] validated ${miniGameManifest.assets.length} mini-game asset sources`);
  console.log(`[OK] world namespace=${worldIds.size}; mini-game namespace=${miniGameIds.size}`);
  console.log('[OK] 2D / 2.5D / 3D best-fit representation policy preserved');
  console.log('[OK] one-runtime-brain policy preserved across world and mini-games');
  console.log('[OK] discovery-only providers remain fail-closed until exact license provenance is recorded');
}
