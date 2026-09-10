#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const REPORT_PATH = path.join(ROOT, 'artifacts/external-world/acquisition-report.json');

const fail = (message) => {
  console.error(`[FAIL] ${message}`);
  process.exitCode = 1;
};

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
const ids = new Set();
const allowedLicenses = new Set(['CC0', 'clearly-commercial-safe']);
const allowedStatuses = new Set(['approved-source', 'candidate', 'validated-runtime']);

if (manifest.policy?.runtimeBrains !== 1) fail('external asset policy must declare exactly one runtime brain');
if (manifest.policy?.redistributableStandaloneAssets !== false) fail('external source policy must default to non-redistributable standalone assets');
if (!Array.isArray(manifest.assets) || manifest.assets.length === 0) fail('asset manifest is empty');

for (const asset of manifest.assets) {
  if (!asset.id || ids.has(asset.id)) fail(`duplicate or missing asset id: ${asset.id ?? '<missing>'}`);
  ids.add(asset.id);
  if (!allowedLicenses.has(asset.license)) fail(`${asset.id}: unsupported license ${asset.license}`);
  if (!allowedStatuses.has(asset.status)) fail(`${asset.id}: unsupported status ${asset.status}`);
  if (!asset.sourcePage?.startsWith('https://')) fail(`${asset.id}: sourcePage must be HTTPS`);
}

const treeRoles = manifest.assets.filter((asset) => asset.role === 'environment:tree');
if (treeRoles.length < 2) fail('world needs at least two approved tree sources for visual variation');
if (!manifest.assets.some((asset) => asset.role === 'environment:ground-cover')) fail('world needs an environment ground-cover source');
if (!manifest.assets.some((asset) => asset.role === 'environment:lighting')) fail('world needs an environment lighting source');
if (!manifest.assets.some((asset) => asset.role === 'character:temporary-cassidy-candidate')) fail('temporary Cassidy candidate must remain explicitly replaceable');

try {
  const report = JSON.parse(await readFile(REPORT_PATH, 'utf8'));
  if (report.schemaVersion < 3) fail('acquisition report is from an older schema; reacquire before validation');
  for (const item of report.acquired ?? []) {
    if (!item.path || item.path.includes('http')) fail(`${item.id}: runtime/source report path must be local`);
    if (item.license !== 'CC0') fail(`${item.id}: acquired Poly Haven assets must record CC0`);
  }
  for (const item of report.failures ?? []) {
    console.warn(`[WARN] acquisition failure recorded for ${item.id}: ${item.error}`);
  }
} catch {
  console.warn('[WARN] no acquisition report yet; run npm run acquire:world-assets before source validation');
}

for (const sourcePage of manifest.assets.map((asset) => asset.sourcePage)) {
  if (sourcePage.includes('api.polyhaven.com')) fail(`runtime manifest must not point at Poly Haven API: ${sourcePage}`);
}

if (process.exitCode) {
  console.error('[ABORT] external world asset policy validation failed');
} else {
  console.log(`[OK] validated ${manifest.assets.length} external asset entries`);
  console.log('[OK] one-runtime-brain policy preserved');
  console.log('[OK] external sources remain replaceable and provenance-tracked');
}
