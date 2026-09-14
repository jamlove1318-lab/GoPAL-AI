#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const miniGameManifestPath = path.join(ROOT, 'assets/world/mini-game-asset-manifest.json');
const outputPath = path.join(ROOT, 'artifacts/external-world/asset-pipeline-report.json');

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const miniGameManifest = JSON.parse(await readFile(miniGameManifestPath, 'utf8'));
const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
const miniGameAssets = Array.isArray(miniGameManifest.assets) ? miniGameManifest.assets : [];
const stages = [
  'source', 'license', 'provenance', 'acquisition', 'normalization', 'optimization',
  'runtimeExport', 'visualBinding', 'animationBinding', 'mobileValidation',
  'humanVisualApproval', 'runtimePromotion',
];

const stageEvidence = (asset, stage) => {
  switch (stage) {
    case 'source':
      return asset.sourcePage || asset.provider ? { state: 'metadata', basis: asset.sourcePage ? 'sourcePage' : 'provider' } : { state: 'missing' };
    case 'license':
      return asset.license ? { state: 'metadata', basis: 'license' } : { state: 'missing' };
    case 'provenance':
      return asset.sourcePage ? { state: 'metadata', basis: 'sourcePage' } : { state: 'missing' };
    case 'acquisition':
      return asset.runtimePath || asset.sourcePath
        ? { state: 'observed', basis: asset.runtimePath ? 'runtimePath' : 'sourcePath' }
        : asset.status === 'approved-source'
          ? { state: 'declared', basis: 'approved-source' }
          : { state: 'missing' };
    case 'normalization':
      return asset.normalization?.evidencePath
        ? { state: 'observed', basis: 'normalization.evidencePath' }
        : asset.geometryReview?.passed || asset.normalization?.passed
          ? { state: 'declared', basis: 'geometryReview/normalization' }
          : { state: 'missing' };
    case 'optimization':
      return asset.optimization?.evidencePath
        ? { state: 'observed', basis: 'optimization.evidencePath' }
        : asset.materialReview?.passed || asset.optimization?.passed
          ? { state: 'declared', basis: 'materialReview/optimization' }
          : { state: 'missing' };
    case 'runtimeExport':
      return asset.runtimePath && asset.runtimeFormat
        ? { state: 'observed', basis: 'runtimePath + runtimeFormat' }
        : { state: 'missing' };
    case 'visualBinding':
      return Array.isArray(asset.variants) && asset.variants.some((variant) => variant.runtimePath || variant.representation)
        ? { state: 'declared', basis: 'variants' }
        : { state: 'missing' };
    case 'animationBinding':
      return Array.isArray(asset.animationActions) && asset.animationActions.length > 0
        ? { state: 'declared', basis: 'animationActions' }
        : { state: 'missing' };
    case 'mobileValidation':
      return asset.mobileValidation?.evidencePath
        ? { state: 'observed', basis: 'mobileValidation.evidencePath' }
        : asset.mobileValidation?.passed === true
          ? { state: 'declared', basis: 'mobileValidation.passed' }
          : { state: 'missing' };
    case 'humanVisualApproval':
      return asset.visualApproval?.evidencePath
        ? { state: 'observed', basis: 'visualApproval.evidencePath' }
        : asset.visualApproval?.approvedByHuman && asset.visualApproval?.approvedAt
          ? { state: 'declared', basis: 'visualApproval' }
          : { state: 'missing' };
    case 'runtimePromotion':
      return asset.status === 'validated-runtime'
        ? { state: 'declared', basis: 'status=validated-runtime' }
        : { state: 'missing' };
    default:
      return { state: 'missing' };
  }
};

const toRow = (asset, scope) => {
  const evidence = Object.fromEntries(stages.map((stage) => [stage, stageEvidence(asset, stage)]));
  const observedStages = stages.filter((stage) => evidence[stage].state === 'observed').length;
  const declaredStages = stages.filter((stage) => evidence[stage].state === 'declared').length;
  const metadataStages = stages.filter((stage) => evidence[stage].state === 'metadata').length;
  return {
    scope,
    id: asset.id,
    provider: asset.provider,
    status: asset.status,
    evidenceSummary: { observedStages, declaredStages, metadataStages, totalStages: stages.length },
    stages: Object.fromEntries(stages.map((stage) => [stage, evidence[stage].state !== 'missing'])),
    evidence,
  };
};

const rows = assets.map((asset) => toRow(asset, 'world'));
const miniGameRows = miniGameAssets.map((asset) => ({
  ...toRow(asset, 'mini-games'),
  assetType: asset.assetType,
  representation: asset.representation,
  families: asset.families,
  usedBy: asset.usedBy,
}));

const promoted = rows.filter((row) => row.status === 'validated-runtime').length;
const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  policy: 'fail-closed',
  evidencePolicy: 'metadata-never-equals-observed',
  sourceManifest: 'assets/world/external-asset-manifest.json',
  miniGameSourceManifest: 'assets/world/mini-game-asset-manifest.json',
  stageOrder: stages,
  stageStates: ['missing', 'metadata', 'declared', 'observed'],
  assetCount: rows.length,
  promotedCount: promoted,
  candidateCount: rows.filter((row) => row.status === 'candidate').length,
  approvedSourceCount: rows.filter((row) => row.status === 'approved-source').length,
  miniGameAssetCount: miniGameRows.length,
  miniGameApprovedSourceCount: miniGameRows.filter((row) => row.status === 'approved-source').length,
  miniGameRuntimePromotionCount: 0,
  acquisitionStrategy: 'one-batch-world-and-mini-game-inventory',
  assets: [...rows, ...miniGameRows],
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`[OK] wrote ${path.relative(ROOT, outputPath)}`);
console.log(`[OK] inventoried ${rows.length} world asset record(s) + ${miniGameRows.length} mini-game source(s)`);
console.log(`[OK] ${promoted} world asset(s) currently validated-runtime`);
console.log('[OK] evidence states distinguish metadata, declared, and observed pipeline work');
if (promoted === 0) console.log('[INFO] no world asset is promoted yet; promotion remains fail-closed until runtime evidence and human approval exist');
