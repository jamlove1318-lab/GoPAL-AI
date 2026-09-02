import { buildWorldLocations } from './livingWorldLocationFactory';
import type { WorldLocationDefinition } from './livingWorldLocationSchema';

export const GO_PAL_WORLD_IDS = [
  'emerald-village',
  'learning-campus',
  'coastal-town',
  'mountain-village',
  'fantasy-kingdom',
  'scifi-outpost',
  'game-arena',
] as const;

export type GoPalWorldId = typeof GO_PAL_WORLD_IDS[number];

export type GoPalWorldManifestEntry = {
  id: GoPalWorldId;
  displayName: string;
  purpose: 'home' | 'learning' | 'travel' | 'nature' | 'fantasy' | 'scifi' | 'games';
  tags: string[];
};

export const GO_PAL_WORLD_MANIFEST: GoPalWorldManifestEntry[] = [
  { id: 'emerald-village', displayName: 'Emerald Valley', purpose: 'home', tags: ['home', 'community', 'living-world'] },
  { id: 'learning-campus', displayName: 'Learning Campus', purpose: 'learning', tags: ['school', 'lessons', 'learning'] },
  { id: 'coastal-town', displayName: 'Azure Coast', purpose: 'travel', tags: ['coast', 'harbor', 'culture'] },
  { id: 'mountain-village', displayName: 'Cloudpine Village', purpose: 'nature', tags: ['mountain', 'trails', 'discovery'] },
  { id: 'fantasy-kingdom', displayName: 'Moonveil Kingdom', purpose: 'fantasy', tags: ['fantasy', 'magic', 'story'] },
  { id: 'scifi-outpost', displayName: 'Nova Outpost', purpose: 'scifi', tags: ['scifi', 'science', 'space'] },
  { id: 'game-arena', displayName: 'Chaos Arena', purpose: 'games', tags: ['games', 'challenges', 'replay'] },
];

export function getGoPalWorld(id: GoPalWorldId) {
  return GO_PAL_WORLD_MANIFEST.find(world => world.id === id) ?? GO_PAL_WORLD_MANIFEST[0];
}

export function buildAllGoPalWorlds(): WorldLocationDefinition[] {
  return buildWorldLocations([...GO_PAL_WORLD_IDS]);
}

export function isGoPalWorldId(id: string): id is GoPalWorldId {
  return (GO_PAL_WORLD_IDS as readonly string[]).includes(id);
}
