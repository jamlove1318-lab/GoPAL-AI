#!/usr/bin/env node

import { access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('[FAIL] usage: npm run normalize:world-asset -- <source.blend|source.glb|source.gltf> <output.glb>');
  process.exit(2);
}

const [source, output] = args.map(value => path.resolve(process.cwd(), value));
try { await access(source); } catch { console.error(`[FAIL] source does not exist: ${source}`); process.exit(1); }
if (path.extname(output).toLowerCase() !== '.glb') {
  console.error('[FAIL] output must use .glb');
  process.exit(2);
}

const candidates = [
  process.env.BLENDER_BIN,
  process.env.BLENDER_ROOT ? path.join(process.env.BLENDER_ROOT, 'blender') : undefined,
  '/usr/bin/blender',
  'blender',
].filter(Boolean);
const script = path.join(ROOT, 'tools/blender/normalize_world_asset.py');

function run(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, ['--background', '--factory-startup', '--python', script, '--', source, output], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => resolve(code ?? 1));
  });
}

for (const command of candidates) {
  try {
    const code = await run(command);
    if (code === 0) process.exit(0);
  } catch {}
}

console.error('[ABORT] no usable Blender executable completed normalization');
process.exit(1);
