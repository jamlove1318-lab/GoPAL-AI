import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'assets', 'world', 'mini-game-asset-manifest.json');
const planPath = path.join(root, 'assets', 'world', 'mini-game-acquisition-plan.json');

const fail = (message) => {
  console.error(`[FAIL] ${message}`);
  process.exitCode = 1;
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

if (!fs.existsSync(manifestPath)) fail(`missing manifest: ${manifestPath}`);
if (!fs.existsSync(planPath)) fail(`missing acquisition plan: ${planPath}`);
if (process.exitCode) process.exit();

const manifest = readJson(manifestPath);
const plan = readJson(planPath);
const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
const planAssets = Array.isArray(plan.assets) ? plan.assets : [];

if (manifest.policy?.noWeaponContent !== true) fail('manifest must enforce noWeaponContent=true');
if (manifest.policy?.noDuplicateLibraries !== true) fail('manifest must enforce noDuplicateLibraries=true');
if (manifest.policy?.sourceOnlyUntilValidated !== true) fail('manifest must remain source-only until validation');
if (manifest.policy?.sharedRuntimeBrain !== true) fail('manifest must use the shared runtime brain');

const ids = new Set();
const sourcePages = new Set();
const familiesByProvider = new Map();

for (const asset of assets) {
  if (!asset?.id || !asset.provider || !asset.sourcePage) {
    fail(`asset has incomplete identity/source metadata: ${JSON.stringify(asset)}`);
    continue;
  }
  if (ids.has(asset.id)) fail(`duplicate asset id: ${asset.id}`);
  ids.add(asset.id);

  if (sourcePages.has(asset.sourcePage)) fail(`duplicate source page: ${asset.sourcePage}`);
  sourcePages.add(asset.sourcePage);

  if (!['kenney', 'quaternius', 'polyhaven'].includes(asset.provider)) {
    fail(`unsupported provider: ${asset.provider} (${asset.id})`);
  }

  if (!asset.license) fail(`missing license: ${asset.id}`);
  if (asset.status !== 'approved-source' && asset.status !== 'validated-runtime') {
    fail(`unsupported status for source catalog: ${asset.id} -> ${asset.status}`);
  }
  if (!Array.isArray(asset.families) || asset.families.length === 0) {
    fail(`missing asset families: ${asset.id}`);
  }
  if (!Array.isArray(asset.usedBy) || asset.usedBy.length === 0) {
    fail(`asset must declare reuse targets: ${asset.id}`);
  }

  const familyKey = `${asset.provider}:${asset.representation}`;
  const current = familiesByProvider.get(familyKey) ?? [];
  current.push(asset.id);
  familiesByProvider.set(familyKey, current);
}

const planIds = new Set();
for (const item of planAssets) {
  if (!item?.id || !item.sourcePage || !Array.isArray(item.allowedHosts) || item.allowedHosts.length === 0) {
    fail(`acquisition plan item is incomplete: ${JSON.stringify(item)}`);
    continue;
  }
  if (planIds.has(item.id)) fail(`duplicate acquisition plan id: ${item.id}`);
  planIds.add(item.id);
  if (!ids.has(item.id)) fail(`acquisition plan references unknown asset: ${item.id}`);
  const url = new URL(item.sourcePage);
  if (!item.allowedHosts.includes(url.hostname)) {
    fail(`source host is not allowlisted: ${item.id} -> ${url.hostname}`);
  }
}

for (const asset of assets) {
  if (!planIds.has(asset.id)) {
    console.warn(`[WARN] catalog asset has no acquisition-plan entry yet: ${asset.id}`);
  }
}

const vehicleCandidates = assets.filter((asset) => asset.families?.includes('vehicles'));
if (vehicleCandidates.length > 1) {
  const providers = new Set(vehicleCandidates.map((asset) => asset.provider));
  console.log(`[INFO] vehicle candidates=${vehicleCandidates.length}; normalization must choose one canonical runtime family (${[...providers].join(', ')})`);
}

console.log(`[OK] mini-game manifest validated: ${assets.length} assets`);
console.log(`[OK] acquisition plan validated: ${planAssets.length} entries`);
console.log(`[OK] unique source pages: ${sourcePages.size}`);
console.log(`[OK] provider/representation groups: ${familiesByProvider.size}`);
console.log('[OK] no duplicate asset IDs');
console.log('[OK] shared-runtime/no-weapon/source-only policies enforced');

if (process.exitCode) process.exit(1);
