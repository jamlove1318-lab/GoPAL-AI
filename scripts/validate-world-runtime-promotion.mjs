#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const errors = [];
const warnings = [];

const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);
const exists = async (relativePath) => {
  if (!relativePath || typeof relativePath !== 'string') return false;
  try { await access(path.join(ROOT, relativePath)); return true; } catch { return false; }
};

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
const assets = Array.isArray(manifest.assets) ? manifest.assets : [];

for (const asset of assets) {
  if (asset.status !== 'validated-runtime') continue;

  if (!asset.runtimePath) {
    fail(`${asset.id}: validated-runtime requires runtimePath`);
    continue;
  }

  if (!await exists(asset.runtimePath)) {
    fail(`${asset.id}: runtimePath does not exist in repository: ${asset.runtimePath}`);
  }

  if (!asset.runtimeFormat || !['glb', 'gltf', 'png', 'webp', 'riv', 'skel'].includes(asset.runtimeFormat)) {
    fail(`${asset.id}: validated-runtime requires a supported runtimeFormat`);
  }

  if (!asset.sha256 || !/^[a-f0-9]{64}$/i.test(asset.sha256)) {
    fail(`${asset.id}: validated-runtime requires a 64-character SHA-256 checksum`);
  }

  if (!asset.license || !['CC0', 'clearly-commercial-safe'].includes(asset.license)) {
    fail(`${asset.id}: validated-runtime requires an explicitly verified supported license`);
  }

  if (!asset.sourcePage || typeof asset.sourcePage !== 'string') {
    fail(`${asset.id}: validated-runtime requires exact source provenance`);
  }

  if (!asset.mobileValidation?.passed) {
    fail(`${asset.id}: mobileValidation.passed must be true before runtime promotion`);
  }

  if (!asset.visualApproval?.approvedByHuman || !asset.visualApproval?.approvedAt) {
    fail(`${asset.id}: human visual approval is required before runtime promotion`);
  }

  if (!asset.geometryReview?.passed) {
    fail(`${asset.id}: geometryReview.passed must be true before runtime promotion`);
  }

  if (!asset.materialReview?.passed) {
    fail(`${asset.id}: materialReview.passed must be true before runtime promotion`);
  }

  const variants = asset.variants ?? [];
  if (!Array.isArray(variants) || variants.length === 0) {
    fail(`${asset.id}: validated-runtime must expose at least one visual variant`);
  } else if (!variants.some((variant) => variant.runtimePath)) {
    fail(`${asset.id}: at least one validated visual variant must expose runtimePath`);
  }
}

const promoted = assets.filter((asset) => asset.status === 'validated-runtime');
if (promoted.length === 0) {
  warn('No external asset has been promoted to validated-runtime yet; source/candidate assets remain fail-closed.');
}

for (const message of warnings) console.warn(`[WARN] ${message}`);
for (const message of errors) console.error(`[FAIL] ${message}`);

if (errors.length) {
  console.error(`[ABORT] ${errors.length} runtime promotion gate error(s)`);
  process.exit(1);
}

console.log(`[OK] runtime promotion gate inspected ${promoted.length} validated-runtime asset(s)`);
console.log('[OK] runtime promotion requires artifact, provenance/license, checksum, geometry/material review, mobile validation, and human visual approval');
