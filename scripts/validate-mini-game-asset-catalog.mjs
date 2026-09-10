#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'assets/world/mini-game-asset-manifest.json');
const acquisitionPath = path.join(root, 'assets/world/mini-game-acquisition-plan.json');

function readJson(file) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${path.relative(root, file)}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const manifest = readJson(manifestPath);
const acquisition = readJson(acquisitionPath);
const errors = [];
const warnings = [];

if (manifest.schemaVersion < 4) errors.push('mini-game manifest schema must be v4+');
if (manifest.policy?.noWeaponContent !== true) errors.push('manifest must keep noWeaponContent=true');
if (manifest.policy?.sharedRuntimeBrain !== true) errors.push('manifest must require sharedRuntimeBrain=true');
if (manifest.policy?.sourceOnlyUntilValidated !== true) errors.push('manifest must remain source-only until validation');
if (acquisition.policy?.noWeaponContent !== true) errors.push('acquisition plan must keep noWeaponContent=true');
if (acquisition.policy?.onlyOfficialSourcePages !== true) errors.push('acquisition plan must use official source pages only');

const manifestIds = new Set();
const acquisitionIds = new Set();
const riskyMetadata = /weapon|firearm|gun|knife|sword|combat|ammunition|explosive/i;
const allowedProviders = new Set(['kenney', 'quaternius']);
const allowedRepresentations = new Set(['2d', '2.5d', '3d']);

for (const asset of manifest.assets ?? []) {
  if (!asset?.id) errors.push('manifest asset missing id');
  if (manifestIds.has(asset.id)) errors.push(`duplicate manifest asset: ${asset.id}`);
  manifestIds.add(asset.id);
  if (!allowedProviders.has(asset.provider)) errors.push(`unsupported provider for ${asset.id}: ${asset.provider}`);
  if (!allowedRepresentations.has(asset.representation)) errors.push(`unsupported representation for ${asset.id}: ${asset.representation}`);
  if (asset.license === 'unknown') errors.push(`unknown license: ${asset.id}`);
  const metadata = JSON.stringify(asset);
  if (riskyMetadata.test(metadata)) errors.push(`unsafe content metadata detected: ${asset.id}`);
  if (asset.status === 'validated-runtime' && !asset.runtimePath) errors.push(`validated runtime missing runtimePath: ${asset.id}`);
}

for (const asset of acquisition.assets ?? []) {
  if (!asset?.id) errors.push('acquisition entry missing id');
  if (acquisitionIds.has(asset.id)) errors.push(`duplicate acquisition asset: ${asset.id}`);
  acquisitionIds.add(asset.id);
  if (!manifestIds.has(asset.id)) errors.push(`acquisition entry missing from manifest: ${asset.id}`);
  if (!asset.sourcePage?.startsWith('https://')) errors.push(`source page must be HTTPS: ${asset.id}`);
  if (!Array.isArray(asset.allowedHosts) || asset.allowedHosts.length === 0) errors.push(`missing allowlist for ${asset.id}`);
  if (riskyMetadata.test(JSON.stringify(asset))) errors.push(`unsafe acquisition metadata detected: ${asset.id}`);
}

for (const id of manifestIds) {
  if (!acquisitionIds.has(id)) warnings.push(`manifest source not yet in acquisition batch: ${id}`);
}

if (errors.length) {
  console.error('[FAIL] Mini-game asset catalog validation');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('[OK] Mini-game asset catalog validation');
console.log(`  manifest assets: ${manifestIds.size}`);
console.log(`  acquisition entries: ${acquisitionIds.size}`);
console.log(`  representations: ${[...new Set((manifest.assets ?? []).map((a) => a.representation))].join(', ')}`);
console.log(`  warnings: ${warnings.length}`);
for (const warning of warnings) console.warn(`  - ${warning}`);
