#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const outputPath = path.join(ROOT, 'artifacts/external-world/asset-pipeline-report.json');

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
const stages = [
  'source', 'license', 'provenance', 'acquisition', 'normalization', 'optimization',
  'runtimeExport', 'visualBinding', 'animationBinding', 'mobileValidation',
  'humanVisualApproval', 'runtimePromotion',
];

const stageValue = (asset, stage) => {
  if (stage === 'source') return Boolean(asset.sourcePage || asset.provider);
  if (stage === 'license') return Boolean(asset.license);
  if (stage === 'provenance') return Boolean(asset.sourcePage);
  if (stage === 'acquisition') return Boolean(asset.runtimePath || asset.sourcePath || asset.status === 'approved-source');
  if (stage === 'normalization') return Boolean(asset.geometryReview?.passed || asset.normalization?.passed);
  if (stage === 'optimization') return Boolean(asset.materialReview?.passed || asset.optimization?.passed);
  if (stage === 'runtimeExport') return Boolean(asset.runtimePath && asset.runtimeFormat);
  if (stage === 'visualBinding') return Array.isArray(asset.variants) && asset.variants.some(variant => variant.runtimePath || variant.representation);
  if (stage === 'animationBinding') return Array.isArray(asset.animationActions) && asset.animationActions.length > 0;
  if (stage === 'mobileValidation') return asset.mobileValidation?.passed === true;
  if (stage === 'humanVisualApproval') return Boolean(asset.visualApproval?.approvedByHuman && asset.visualApproval?.approvedAt);
  if (stage === 'runtimePromotion') return asset.status === 'validated-runtime';
  return false;
};

const rows = assets.map(asset => ({
  id: asset.id,
  provider: asset.provider,
  status: asset.status,
  stages: Object.fromEntries(stages.map(stage => [stage, stageValue(asset, stage)])),
}));

const promoted = rows.filter(row => row.status === 'validated-runtime').length;
const report = {
  generatedAt: new Date().toISOString(),
  policy: 'fail-closed',
  sourceManifest: 'assets/world/external-asset-manifest.json',
  stageOrder: stages,
  assetCount: rows.length,
  promotedCount: promoted,
  candidateCount: rows.filter(row => row.status === 'candidate').length,
  approvedSourceCount: rows.filter(row => row.status === 'approved-source').length,
  assets: rows,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`[OK] wrote ${path.relative(ROOT, outputPath)}`);
console.log(`[OK] inventoried ${rows.length} asset record(s); ${promoted} validated-runtime`);
if (promoted === 0) console.log('[INFO] no asset is promoted yet; the pipeline remains fail-closed until evidence exists');
