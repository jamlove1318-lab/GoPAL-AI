#!/usr/bin/env node

import { access, readFile, stat } from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import validator from 'gltf-validator';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORLD_MANIFEST = path.join(ROOT, 'assets/world/external-asset-manifest.json');
const MINI_MANIFEST = path.join(ROOT, 'assets/world/mini-game-asset-manifest.json');
const REPORT_DIR = path.join(ROOT, 'artifacts/external-world');
const REPORT_PATH = path.join(REPORT_DIR, 'world-pipeline-validation.json');
const VALID_REPRESENTATIONS = new Set(['2d', '2.5d', '3d']);
const VALID_PROVIDERS = new Set(['polyhaven', 'quaternius', 'kenney']);
const VALID_STATUSES = new Set(['candidate', 'approved-source', 'validated-runtime']);
const GLB_EXTENSIONS = new Set(['.glb']);

const failures = [];
const warnings = [];
const checks = [];
const recordCheck = (name, passed, detail = '') => {
  checks.push({ name, passed, detail });
  if (!passed) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
};
const warn = (name, detail) => warnings.push({ name, detail });
const exists = async (file) => {
  try { await access(file); return true; } catch { return false; }
};
const sha256 = async (file) => {
  const hash = crypto.createHash('sha256');
  const bytes = await readFile(file);
  hash.update(bytes);
  return hash.digest('hex');
};
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const resolveRoot = (value) => path.resolve(ROOT, value);

const world = await readJson(WORLD_MANIFEST);
const mini = await readJson(MINI_MANIFEST);
const worldAssets = Array.isArray(world.assets) ? world.assets : [];
const miniAssets = Array.isArray(mini.assets) ? mini.assets : [];

recordCheck('world manifest is valid JSON/object', Boolean(world && typeof world === 'object'));
recordCheck('mini-game manifest is valid JSON/object', Boolean(mini && typeof mini === 'object'));
recordCheck('world manifest schemaVersion >= 3', Number(world.schemaVersion) >= 3);
recordCheck('mini-game manifest schemaVersion >= 4', Number(mini.schemaVersion) >= 4);
recordCheck('world policy is fail-closed', world.policy?.sourceOnlyUntilValidated === true);
recordCheck('world has exactly one runtime brain', world.policy?.runtimeBrains === 1);
recordCheck('mini-game policy is fail-closed', mini.policy?.sourceOnlyUntilValidated === true);
recordCheck('mini-game duplicate-library protection enabled', mini.policy?.noDuplicateLibraries === true);

const ids = new Map();
const validateAssetRecord = (asset, scope) => {
  const prefix = `${scope}:${asset?.id ?? '<missing-id>'}`;
  recordCheck(`${prefix} has id`, typeof asset?.id === 'string' && asset.id.length > 0);
  if (asset?.id) {
    if (ids.has(asset.id)) recordCheck(`${prefix} id is globally unique`, false, `duplicates ${ids.get(asset.id)}`);
    else ids.set(asset.id, prefix);
  }
  recordCheck(`${prefix} provider is allowlisted`, VALID_PROVIDERS.has(asset?.provider), String(asset?.provider));
  recordCheck(`${prefix} status is valid`, VALID_STATUSES.has(asset?.status), String(asset?.status));
  recordCheck(`${prefix} source page exists`, typeof asset?.sourcePage === 'string' && /^https?:\/\//.test(asset.sourcePage));
  recordCheck(`${prefix} license is declared`, typeof asset?.license === 'string' && asset.license.length > 0);
  if (scope === 'world') recordCheck(`${prefix} representation is valid`, VALID_REPRESENTATIONS.has(asset?.representation), String(asset?.representation));
  if (scope === 'mini-games') recordCheck(`${prefix} families are non-empty`, Array.isArray(asset?.families) && asset.families.length > 0);

  if (asset?.status !== 'validated-runtime') return;

  const runtimePath = asset.runtimePath ? resolveRoot(asset.runtimePath) : null;
  recordCheck(`${prefix} promoted asset declares runtimePath`, Boolean(runtimePath));
  if (!runtimePath) return;
  recordCheck(`${prefix} runtimePath uses GLB`, GLB_EXTENSIONS.has(path.extname(runtimePath).toLowerCase()), runtimePath);
  recordCheck(`${prefix} runtime artifact exists`, false, 'checked asynchronously below');
};

worldAssets.forEach((asset) => validateAssetRecord(asset, 'world'));
miniAssets.forEach((asset) => validateAssetRecord(asset, 'mini-games'));

const promoted = [...worldAssets.map((asset) => ({ asset, scope: 'world' })), ...miniAssets.map((asset) => ({ asset, scope: 'mini-games' }))]
  .filter(({ asset }) => asset.status === 'validated-runtime');

for (const { asset, scope } of promoted) {
  const prefix = `${scope}:${asset.id}`;
  const runtime = resolveRoot(asset.runtimePath);
  const runtimeExists = await exists(runtime);
  checks.pop(); // remove the placeholder check inserted above
  recordCheck(`${prefix} runtime artifact exists`, runtimeExists, runtimeExists ? '' : runtime);
  if (!runtimeExists) continue;

  const digest = await sha256(runtime);
  recordCheck(`${prefix} runtime SHA-256 is declared`, typeof asset.runtimeSha256 === 'string' && /^[a-f0-9]{64}$/i.test(asset.runtimeSha256));
  if (asset.runtimeSha256) recordCheck(`${prefix} runtime SHA-256 matches artifact`, digest === asset.runtimeSha256.toLowerCase(), `actual=${digest}`);

  const normalizationPath = `${runtime}.normalization.json`;
  const validatorPath = `${runtime}.gltf-validator.json`;
  const optimizationPath = `${runtime}.optimization.json`;
  const mobilePath = `${runtime}.mobile.json`;
  const approvalPath = `${runtime}.visual-approval.json`;

  for (const [label, file] of [
    ['normalization evidence', normalizationPath],
    ['glTF validator evidence', validatorPath],
    ['optimization evidence', optimizationPath],
    ['mobile validation evidence', mobilePath],
    ['human visual approval evidence', approvalPath],
  ]) {
    recordCheck(`${prefix} has ${label}`, await exists(file), file);
  }

  if (await exists(normalizationPath)) {
    const evidence = await readJson(normalizationPath);
    recordCheck(`${prefix} normalization evidence is observed`, evidence.observed?.outputArtifact === true && evidence.observed?.geometry === true && evidence.normalized === true);
    recordCheck(`${prefix} normalization evidence checksum matches runtime`, evidence.outputSha256 === digest, 'normalization evidence must describe this exact GLB');
    recordCheck(`${prefix} normalization geometry is non-empty`, Number(evidence.stats?.meshObjects) > 0 && Number(evidence.stats?.vertices) > 0 && Number(evidence.stats?.trianglesEstimated) > 0);
    recordCheck(`${prefix} normalization dimensions are finite`, Array.isArray(evidence.stats?.dimensions) && evidence.stats.dimensions.length === 3 && evidence.stats.dimensions.every(Number.isFinite));
  }

  if (await exists(validatorPath)) {
    const evidence = await readJson(validatorPath);
    recordCheck(`${prefix} glTF validator evidence has zero errors`, Number(evidence.issues?.numErrors ?? -1) === 0);
    recordCheck(`${prefix} glTF validator evidence is for GLB`, evidence.info?.version !== undefined || evidence.asset !== undefined || evidence.issues !== undefined);
  }

  if (await exists(optimizationPath)) {
    const evidence = await readJson(optimizationPath);
    recordCheck(`${prefix} optimization evidence is observed`, evidence.observed === true || evidence.status === 'observed');
    recordCheck(`${prefix} optimization evidence references exact runtime`, evidence.outputSha256 === digest || evidence.runtimeSha256 === digest);
    if (Number.isFinite(evidence.triangles)) warn(`${prefix} optimization budget`, `triangles=${evidence.triangles}`);
    if (Number.isFinite(evidence.textureBytes)) warn(`${prefix} optimization texture budget`, `textureBytes=${evidence.textureBytes}`);
  }

  if (await exists(mobilePath)) {
    const evidence = await readJson(mobilePath);
    recordCheck(`${prefix} mobile validation passed`, evidence.passed === true);
    recordCheck(`${prefix} mobile validation references exact runtime`, evidence.outputSha256 === digest || evidence.runtimeSha256 === digest);
  }

  if (await exists(approvalPath)) {
    const evidence = await readJson(approvalPath);
    recordCheck(`${prefix} human approval is explicit`, evidence.approvedByHuman === true && typeof evidence.approvedAt === 'string' && evidence.approvedAt.length > 0);
    recordCheck(`${prefix} human approval references exact runtime`, evidence.outputSha256 === digest || evidence.runtimeSha256 === digest);
  }

  const bytes = (await stat(runtime)).size;
  recordCheck(`${prefix} runtime artifact is non-empty`, bytes > 0, `bytes=${bytes}`);
}

// Source-only records are intentionally allowed to remain incomplete; that is the point of the pipeline.
const sourceOnlyCount = [...worldAssets, ...miniAssets].filter((asset) => asset.status !== 'validated-runtime').length;
if (sourceOnlyCount > 0) warn('source-only inventory', `${sourceOnlyCount} asset records remain intentionally unpromoted until evidence exists`);
if (promoted.length === 0) warn('runtime promotion', 'no assets are currently validated-runtime; fail-closed state is healthy');

await (await import('node:fs/promises')).mkdir(REPORT_DIR, { recursive: true });
await (await import('node:fs/promises')).writeFile(REPORT_PATH, `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  policy: 'fail-closed',
  worldAssetCount: worldAssets.length,
  miniGameAssetCount: miniAssets.length,
  promotedCount: promoted.length,
  sourceOnlyCount,
  failureCount: failures.length,
  warningCount: warnings.length,
  checks,
  warnings,
  failures,
}, null, 2)}\n`, 'utf8');

console.log(`[INFO] world assets: ${worldAssets.length}`);
console.log(`[INFO] mini-game assets: ${miniAssets.length}`);
console.log(`[INFO] validated-runtime assets: ${promoted.length}`);
console.log(`[INFO] checks: ${checks.length}; failures: ${failures.length}; warnings: ${warnings.length}`);
console.log(`[OK] wrote ${path.relative(ROOT, REPORT_PATH)}`);

if (failures.length) {
  for (const failure of failures) console.error(`[FAIL] ${failure}`);
  process.exit(1);
}
for (const item of warnings) console.log(`[WARN] ${item.name}: ${item.detail}`);
console.log('[OK] complete world asset pipeline gate passed');
