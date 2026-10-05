#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import process from 'node:process';

const REQUIRED_LAYERS = [
  'head','ears','neck','eyes','eyelids','eyebrows','nose','mouth',
  'hair-back','hair-side','hair-front','braid','torso','blouse','vest','hood',
  'left-arm','right-arm','left-hand','right-hand','belt','pouches','satchel',
  'left-leg','right-leg','left-boot','right-boot','charm-chain','charm','charm-glow',
];
const REQUIRED_EXPRESSIONS = ['neutral','happy','curious','excited','surprised','thoughtful','playful','concerned','gentle'];
const REQUIRED_ANIMATIONS = ['idle-breath','walk','run','talk','think','celebrate','greeting','explaining','listening','encouraging'];
const REQUIRED_CHARM_STATES = ['normal','curious','learning','discovery','important','celebration','memory'];

const file = process.argv[2];
if (!file) {
  console.error('FAIL: provide a manifest path.');
  process.exit(2);
}

let manifest;
try {
  manifest = JSON.parse(await readFile(file, 'utf8'));
} catch (error) {
  console.error(`FAIL: unable to read/parse ${file}: ${error.message}`);
  process.exit(1);
}

const failures = [];
const requireEqual = (key, expected) => {
  if (manifest[key] !== expected) failures.push(`${key} must be ${JSON.stringify(expected)}`);
};
const requireAll = (key, required) => {
  const actual = Array.isArray(manifest[key]) ? manifest[key] : [];
  for (const value of required) if (!actual.includes(value)) failures.push(`${key} missing ${value}`);
};

requireEqual('packId', 'cassidy-canonical-2d');
requireEqual('contractVersion', '1.0.0');
requireEqual('identityVersion', 'canonical-v1');
requireEqual('sourceReference', 'cassidy-character-reference.md');
requireEqual('humanApproved', true);
if (!['spine','live2d','rive','custom'].includes(manifest.runtimeFormat)) failures.push('runtimeFormat is invalid');
if (typeof manifest.runtimeAssetVersion !== 'string' || !manifest.runtimeAssetVersion.trim()) failures.push('runtimeAssetVersion is required');
if (typeof manifest.sourceLicenseRecord !== 'string' || !manifest.sourceLicenseRecord.trim()) failures.push('sourceLicenseRecord is required');
if (typeof manifest.rendererAdapterVersion !== 'string' || !manifest.rendererAdapterVersion.trim()) failures.push('rendererAdapterVersion is required');
if (!manifest.masterResolution || manifest.masterResolution.width < 2000 || manifest.masterResolution.height < 3000) failures.push('masterResolution must be at least 2000x3000');
requireAll('layers', REQUIRED_LAYERS);
requireAll('expressions', REQUIRED_EXPRESSIONS);
requireAll('animations', REQUIRED_ANIMATIONS);
requireAll('charmStates', REQUIRED_CHARM_STATES);

if (failures.length) {
  console.error(`FAIL: ${file}`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`OK: Cassidy 2D production manifest accepted: ${file}`);
console.log(`- pack: ${manifest.packId}`);
console.log(`- runtime: ${manifest.runtimeFormat} ${manifest.runtimeAssetVersion}`);
console.log(`- master: ${manifest.masterResolution.width}x${manifest.masterResolution.height}`);
console.log('- human approval: confirmed');
