#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import validator from 'gltf-validator';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('[FAIL] Expected at least one .glb path');
  process.exit(2);
}

const failures = [];

for (const input of args) {
  const assetPath = path.resolve(ROOT, input);
  try {
    const bytes = await readFile(assetPath);
    const report = await validator.validateBytes(new Uint8Array(bytes), {
      uri: path.relative(ROOT, assetPath),
      format: 'glb',
      writeTimestamp: false,
      maxIssues: 0,
    });

    const reportPath = `${assetPath}.gltf-validator.json`;
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    const issues = report.issues ?? {};
    const errors = Number(issues.numErrors ?? 0);
    const warnings = Number(issues.numWarnings ?? 0);
    const infos = Number(issues.numInfos ?? 0);
    const hints = Number(issues.numHints ?? 0);

    console.log(`[INFO] ${path.relative(ROOT, assetPath)}: errors=${errors} warnings=${warnings} infos=${infos} hints=${hints}`);
    console.log(`[OK] validator report: ${path.relative(ROOT, reportPath)}`);

    if (errors > 0) failures.push(assetPath);
  } catch (error) {
    console.error(`[FAIL] ${path.relative(ROOT, assetPath)}: ${error instanceof Error ? error.message : String(error)}`);
    failures.push(assetPath);
  }
}

if (failures.length > 0) {
  console.error(`[FAIL] ${failures.length} GLB asset(s) failed independent glTF validation`);
  process.exit(1);
}

console.log(`[OK] independently validated ${args.length} GLB asset(s)`);
