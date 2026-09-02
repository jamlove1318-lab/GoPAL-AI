import { LocalStore } from '../../lib/localStore';
import { destinationExperienceEngine, type WorldArea } from './destinationExperienceEngine';
import { resolveLanguageWorld, type LanguageWorldId } from './languageWorldEngine';
import { getLanguageWorldLocation, getLanguageWorldLocations } from '../../features/world/data/livingLanguageWorldLocations';
import { getWorldLearningScenarios } from '../learning/worldLearningScenarioEngine';

export type DiscoveryStatus = 'locked' | 'available' | 'completed' | 'secret' | 'event';

export interface WorldDiscoveryNode {
  id: string;
  worldId: LanguageWorldId;
  placeId: string;
  name: string;
  city: string;
  realWorldLocation: string;
  area: WorldArea;
  status: DiscoveryStatus;
  prerequisiteId?: string;
  scenarioIds: string[];
  landmark: boolean;
  hiddenGem: boolean;
}

interface DiscoveryProgress { completed: string[]; discovered: string[]; }
const KEY = 'world_discovery_progress_v1';

async function readProgress(): Promise<DiscoveryProgress> {
  return LocalStore.get<DiscoveryProgress>(KEY, { completed: [], discovered: [] });
}
async function writeProgress(progress: DiscoveryProgress) { await LocalStore.set(KEY, progress); }

/** Canonical physical-language locations are authoritative for Japanese/French. */
function getDiscoveryPlaces(worldId: LanguageWorldId) {
  const canonicalWorldId = worldId === 'ja' ? 'japanese' : worldId === 'fr' ? 'french' : null;
  if (!canonicalWorldId) return resolveLanguageWorld(worldId).places;
  return getLanguageWorldLocations(canonicalWorldId).map(location => ({
    id: location.id,
    name: location.name,
    city: location.city ?? location.country,
    country: location.country,
    realWorldLocation: [location.city, location.country].filter(Boolean).join(', '),
    purpose: location.description,
    landmarks: location.kind === 'real' ? ['Real-world location'] : ['Fictional learning location'],
    hiddenGems: location.experiences.includes('quest') ? ['Contextual learning encounter'] : [],
  }));
}

/** Keep the existing learning catalog authoritative while exposing canonical physical IDs. */
function legacyLearningPlaceId(worldId: LanguageWorldId, placeId: string) {
  const aliases: Record<string, string> = {
    'jp-tokyo-shibuya': 'tokyo-shibuya',
    'jp-tokyo-cafe': 'tokyo-komorebi-cafe',
    'jp-kyoto-gion': 'kyoto-gion',
    'jp-kyoto-whispering-garden': 'kyoto-whispering-garden',
    'jp-osaka-dotonbori': 'osaka-dotonbori',
    'jp-osaka-night-market': 'osaka-lantern-market',
    'jp-kanazawa': 'kanazawa',
    'jp-kanazawa-craft-house': 'kanazawa-craft-house',
    'jp-fukuoka-hakata': 'fukuoka-hakata',
    'jp-fukuoka-yatai-alley': 'fukuoka-yatai-alley',
    'fr-paris-montmartre': 'paris-montmartre',
    'fr-paris-bakery': 'paris-lune-bakery',
    'fr-lyon-old-town': 'lyon',
    'fr-lyon-story-square': 'lyon-story-square',
    'fr-strasbourg': 'strasbourg',
    'fr-strasbourg-christmas-quarter': 'strasbourg-market-quarter',
    'fr-nice': 'nice',
    'fr-nice-promenade-studio': 'nice-promenade-studio',
  };
  return worldId === 'ja' || worldId === 'fr' ? (aliases[placeId] ?? placeId) : placeId;
}

export function buildWorldDiscovery(worldId: LanguageWorldId): WorldDiscoveryNode[] {
  const places = getDiscoveryPlaces(worldId);
  return places.map((place, index) => {
    const canonicalLocation = getLanguageWorldLocation(place.id);
    const learningPlaceId = legacyLearningPlaceId(worldId, place.id);
    const areas = destinationExperienceEngine.getAreas(learningPlaceId);
    const area = areas[0] ?? destinationExperienceEngine.createMoment(worldId, learningPlaceId).area;
    const scenarios = getWorldLearningScenarios(worldId, learningPlaceId);
    const previous = places[index - 1];
    return {
      id: `place:${worldId}:${place.id}`,
      worldId,
      placeId: place.id,
      name: place.name,
      city: place.city,
      realWorldLocation: place.realWorldLocation,
      area,
      status: index === 0 ? 'available' : 'locked',
      prerequisiteId: previous ? `place:${worldId}:${previous.id}` : undefined,
      scenarioIds: scenarios.map(scenario => scenario.id),
      landmark: canonicalLocation?.kind === 'real' || place.landmarks.length > 0,
      hiddenGem: canonicalLocation?.kind === 'fictional' || place.hiddenGems.length > 0,
    };
  });
}

export async function getWorldDiscovery(worldId: LanguageWorldId): Promise<WorldDiscoveryNode[]> {
  const nodes = buildWorldDiscovery(worldId);
  const progress = await readProgress();
  const completed = new Set(progress.completed);
  return nodes.map((node, index) => {
    if (completed.has(node.id)) return { ...node, status: 'completed' };
    if (index === 0 || (node.prerequisiteId && completed.has(node.prerequisiteId))) return { ...node, status: 'available' };
    return node;
  });
}

export async function completeWorldDiscovery(worldId: LanguageWorldId, placeId: string, scenarioId?: string) {
  const progress = await readProgress();
  const nodeId = `place:${worldId}:${placeId}`;
  if (!progress.completed.includes(nodeId)) progress.completed.push(nodeId);
  if (!progress.discovered.includes(nodeId)) progress.discovered.push(nodeId);
  await writeProgress(progress);
  const discovery = await getWorldDiscovery(worldId);
  return {
    completedNodeId: nodeId,
    scenarioId,
    completed: discovery.find(node => node.id === nodeId) ?? null,
    next: discovery.find(node => node.status === 'available' && node.id !== nodeId) ?? null,
    discovery,
  };
}

export async function canEnterPlace(worldId: LanguageWorldId, placeId: string): Promise<boolean> {
  const discovery = await getWorldDiscovery(worldId);
  return discovery.some(node => node.placeId === placeId && node.status !== 'locked');
}

export const worldDiscoveryProgressionEngine = {
  build: buildWorldDiscovery,
  get: getWorldDiscovery,
  complete: completeWorldDiscovery,
  canEnter: canEnterPlace,
};
