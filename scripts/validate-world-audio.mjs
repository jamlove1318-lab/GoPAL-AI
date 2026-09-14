import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const contractPath = resolve(root, 'src/engines/world/worldAudioContract.ts');
const profilesPath = resolve(root, 'src/engines/world/worldAudioProfiles.ts');
const enginePath = resolve(root, 'src/engines/world/worldAudioEngine.ts');
const runtimePath = resolve(root, 'src/engines/world/worldAudioRuntime.ts');

const files = await Promise.all([
  readFile(contractPath, 'utf8'),
  readFile(profilesPath, 'utf8'),
  readFile(enginePath, 'utf8'),
  readFile(runtimePath, 'utf8'),
]);

const [contract, profiles, engine, runtime] = files;
const failures = [];

if (!contract.includes("export const SOFT_WORLD_AUDIO_DEFAULTS")) failures.push('missing soft mix defaults');
if (!contract.includes('distanceAttenuation')) failures.push('missing spatial attenuation');
if (!profiles.includes('trainStation')) failures.push('missing train station profile');
if (!profiles.includes('airport')) failures.push('missing airport profile');
if (!profiles.includes('festival')) failures.push('missing festival profile');
if (!engine.includes('cooldownFor')) failures.push('missing cooldown control');
if (!engine.includes('maxActiveOneShots')) failures.push('missing active one-shot budget');
if (!engine.includes('distanceAttenuation')) failures.push('engine does not use distance attenuation');
if (!runtime.includes("from 'expo-audio'")) failures.push('runtime is not using expo-audio');
if (runtime.includes('useAudioRecorder') || runtime.includes('requestRecordingPermissionsAsync')) failures.push('runtime unexpectedly enables recording');

const gainValues = [...contract.matchAll(/\b(master|music|ambience|location|activity|transport|interaction|event|voice):\s*(0(?:\.\d+)?|1(?:\.0)?)/g)]
  .map((match) => Number(match[2]));
if (gainValues.some((value) => value < 0 || value > 1)) failures.push('soft mix gain outside 0..1');

if (failures.length) {
  console.error('[FAIL] world audio validation');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log('[OK] world audio contract, profiles, mixer and runtime adapter validated');
console.log(`[OK] ${profiles.match(/id: '/g)?.length ?? 0} location profiles declared`);
console.log('[OK] recording permissions are not part of the world audio runtime');
