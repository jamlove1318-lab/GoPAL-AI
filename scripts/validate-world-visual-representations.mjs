#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const errors = [];

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
const allowedRepresentations = new Set(['2d', '2.5d', '3d']);
const allowedSources = new Set(['blender', 'spine', 'rive', 'godot', 'native']);
const allowedPurposes = new Set(['hero', 'interactive', 'near', 'mid', 'far', 'background', 'map', 'portrait', 'effect']);

for (const asset of manifest.assets ?? []) {
  const variants = asset.variants ?? asset.representations ?? [];
  if (!Array.isArray(variants) || variants.length === 0) {
    errors.push(`${asset.id}: reusable asset must declare at least one visual variant`);
    continue;
  }

  const seen = new Set();
  for (const variant of variants) {
    const key = `${variant.representation}:${variant.source}:${variant.purpose}`;
    if (seen.has(key)) errors.push(`${asset.id}: duplicate visual variant ${key}`);
    seen.add(key);

    if (!allowedRepresentations.has(variant.representation)) {
      errors.push(`${asset.id}: unsupported representation ${variant.representation}`);
    }
    if (!allowedSources.has(variant.source)) {
      errors.push(`${asset.id}: unsupported visual source ${variant.source}`);
    }
    if (!allowedPurposes.has(variant.purpose)) {
      errors.push(`${asset.id}: unsupported visual purpose ${variant.purpose}`);
    }
    if (variant.validated && !variant.assetUri) {
      errors.push(`${asset.id}: validated variant ${key} has no runtime assetUri`);
    }
    if (variant.minDistance !== undefined && variant.maxDistance !== undefined && variant.minDistance > variant.maxDistance) {
      errors.push(`${asset.id}: invalid distance range for ${key}`);
    }
    if (variant.maxScreenPixels !== undefined && variant.maxScreenPixels <= 0) {
      errors.push(`${asset.id}: maxScreenPixels must be positive for ${key}`);
    }
  }

  const representations = new Set(variants.map(variant => variant.representation));
  if (asset.heroAllowed && !representations.has('3d')) {
    errors.push(`${asset.id}: heroAllowed asset must expose a 3d representation`);
  }
  if (asset.kind === 'character' && !variants.some(variant => variant.interactive === true)) {
    console.warn(`[WARN] ${asset.id}: character has no interactive visual variant yet`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`[FAIL] ${error}`);
  console.error(`[ABORT] ${errors.length} world visual representation error(s)`);
  process.exit(1);
}

console.log(`[OK] validated visual representation contracts for ${manifest.assets?.length ?? 0} world assets`);
console.log('[OK] validated assets are fail-closed until runtime paths exist');
console.log('[OK] 2D / 2.5D / 3D remain interchangeable representations of one world identity');
