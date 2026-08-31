import { LocalStore } from '../../lib/localStore';
import { destinationExperienceEngine, type WorldArea } from './destinationExperienceEngine';
import { resolveLanguageWorld, type LanguageWorldId } from './languageWorldEngine';
import { getWorldLearningScenarios, type WorldLearningScenario } from '../learning/worldLearningScenarioEngine';

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

interface DiscoveryProgress {
  completed: string[];
  discovered: string[];
}

const KEY = 'world_discovery_progress_v1';

async function readProgress(): Promise<DiscoveryProgress> {
  return LocalStore.get<DiscoveryProgress>(KEY, { completed: [], discovered: [] });
}

async function writeProgress(progress: DiscoveryProgress) {
  await LocalStore.set(KEY, progress);
}

export function buildWorldDiscovery(worldId: LanguageWorldId): WorldDiscoveryNode[] {
  const world = resolveLanguageWorld(worldId);
  return world.places.map((place, index) => {
    const areas = destinationExperienceEngine.getAreas(place.id);
    const area = areas[0] ?? destinationExperienceEngine.createMoment(worldId, place.id).area;
    const scenarios = getWorldLearningScenarios(worldId, place.id);
    const previous = world.places[index - 1];
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
      scenarioIds: scenarios.map((scenario) => scenario.id),
      landmark: place.landmarks.length > 0,
      hiddenGem: place.hiddenGems.length > 0,
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
    completed: discovery.find((node) => node.id === nodeId) ?? null,
    next: discovery.find((node) => node.status === 'available' && node.id !== nodeId) ?? null,
    discovery,
  };
}

export async function canEnterPlace(worldId: LanguageWorldId, placeId: string): Promise<boolean> {
  const discovery = await getWorldDiscovery(worldId);
  return discovery.some((node) => node.placeId === placeId && node.status !== 'locked');
}

export const worldDiscoveryProgressionEngine = {
  build: buildWorldDiscovery,
  get: getWorldDiscovery,
  complete: completeWorldDiscovery,
  canEnter: canEnterPlace,
};
