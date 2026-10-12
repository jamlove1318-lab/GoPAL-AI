#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_ROOT = 'https://3dassets.dev/api/v1';
const CDN_HOSTS = new Set(['cdn.3dassets.dev']);
const SOURCE_HOSTS = new Set(['3dassets.dev', 'www.3dassets.dev']);
const USER_AGENT = 'GoPAL-AI-world-asset-acquirer/3.0';
const MAX_SOURCE_BYTES = Number(process.env.GOPAL_ASSET_MAX_BYTES ?? 250_000_000);

function assertHost(url, hosts) {
  const hostname = new URL(url).hostname.toLowerCase();
  if (![...hosts].some((host) => hostname === host)) {
    throw new Error(`unexpected 3DAssets.dev host: ${hostname}`);
  }
}

async function getJson(url) {
  assertHost(url, SOURCE_HOSTS);
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

function firstString(...values) {
  return values.find((value) => typeof value === 'string' && value.length > 0) ?? null;
}

function normalizeFiles(manifest) {
  const candidates = manifest.files ?? manifest.assets ?? manifest.models ?? [];
  if (!Array.isArray(candidates)) throw new Error('3DAssets.dev pack manifest has no file list');
  return candidates.map((file, index) => {
    const url = firstString(file.cdnUrl, file.downloadUrl, file.url);
    const name = firstString(file.filename, file.fileName, file.name, file.path, `asset-${index + 1}.glb`);
    if (!url) throw new Error(`pack file ${index + 1} has no CDN/download URL`);
    assertHost(url, CDN_HOSTS);
    if (!new URL(url).pathname.toLowerCase().endsWith('.glb')) throw new Error(`non-GLB pack member rejected: ${url}`);
    const size = Number(file.size ?? file.bytes ?? 0);
    if (size > MAX_SOURCE_BYTES) throw new Error(`pack member exceeds ${MAX_SOURCE_BYTES} byte safety limit: ${name}`);
    return { name: name.replaceAll('\\', '/').replace(/^\/+/, ''), url, size: size || null, sha256: file.sha256 ?? null };
  });
}

async function download(url, destination, expectedSize = null) {
  assertHost(url, CDN_HOSTS);
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_SOURCE_BYTES) throw new Error(`download exceeds ${MAX_SOURCE_BYTES} byte safety limit`);
  if (expectedSize !== null && bytes.length !== expectedSize) throw new Error(`size mismatch: expected ${expectedSize}, got ${bytes.length}`);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (expectedSize !== null && !Number.isFinite(expectedSize)) throw new Error('invalid expected size');
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return { bytes: bytes.length, sha256 };
}

function safeRelative(value, fallback) {
  const normalized = path.posix.normalize(String(value || fallback).replaceAll('\\', '/')).replace(/^\/+/, '');
  if (normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) return fallback;
  return normalized.endsWith('.glb') ? normalized : `${normalized}.glb`;
}

export async function acquire3DAssetsPacks({ root, plan }) {
  const outRoot = path.join(root, 'artifacts/external-world/3dassets-dev');
  const acquired = [];
  const failures = [];
  const packs = Array.isArray(plan?.scenarioPacks) ? plan.scenarioPacks : [];

  for (const entry of packs) {
    try {
      if (!entry?.slug || !entry?.id) throw new Error('scenario pack requires id and slug');
      const manifestUrl = `${API_ROOT}/packs/${encodeURIComponent(entry.slug)}`;
      const manifest = await getJson(manifestUrl);
      const license = firstString(manifest.license?.id, manifest.license?.spdx, manifest.license, entry.license);
      if (license && license !== 'CC0' && license !== 'cc0-1.0' && license !== 'CC0 1.0 Universal') {
        throw new Error(`pack is not verified CC0: ${license}`);
      }
      const files = normalizeFiles(manifest);
      const packRoot = path.join(outRoot, entry.id);
      const fileRecords = [];
      for (const file of files) {
        const destination = path.join(packRoot, safeRelative(file.name, `${fileRecords.length + 1}.glb`));
        const result = await download(file.url, destination, file.size);
        if (file.sha256 && file.sha256 !== result.sha256) throw new Error(`SHA-256 mismatch for ${file.name}: expected ${file.sha256}, got ${result.sha256}`);
        fileRecords.push({
          name: file.name,
          path: path.relative(root, destination),
          url: file.url,
          bytes: result.bytes,
          sha256: result.sha256,
          sourceSha256: file.sha256 ?? null,
        });
      }
      const record = {
        id: entry.id,
        slug: entry.slug,
        priority: entry.priority ?? 'P1',
        families: entry.families ?? [],
        sourcePage: entry.sourcePage ?? `https://3dassets.dev/packs/${entry.slug}`,
        manifestUrl,
        license: license ?? 'CC0 1.0 Universal',
        packName: manifest.name ?? manifest.title ?? entry.slug,
        fileCount: fileRecords.length,
        bytes: fileRecords.reduce((sum, file) => sum + file.bytes, 0),
        files: fileRecords,
      };
      acquired.push(record);
      console.log(`[OK] 3DAssets.dev ${entry.id} -> ${fileRecords.length} GLB(s)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ id: entry?.id ?? 'unknown', slug: entry?.slug ?? null, error: message });
      console.error(`[FAIL] 3DAssets.dev ${entry?.id ?? 'unknown'} -> ${message}`);
    }
  }

  return {
    provider: '3dassets-dev',
    status: failures.length ? (acquired.length ? 'partial-failure' : 'failure') : 'acquired',
    plannedCount: packs.length,
    acquiredCount: acquired.length,
    failedCount: failures.length,
    acquired,
    failures,
    nextStep: 'Validate each downloaded GLB with Khronos, normalize through the existing Blender pipeline, then complete geometry/material/mobile/human-visual gates before runtime promotion.',
  };
}
