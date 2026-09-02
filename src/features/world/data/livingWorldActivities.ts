import type { WorldCharacterDefinition } from './livingWorldCharacters';
import type { WorldObjectDefinition } from './livingWorldObjects';

export type WorldActivityKind = 'idle' | 'work' | 'learn' | 'shop' | 'guide' | 'travel' | 'quest' | 'discover' | 'social' | 'play';
export type WorldActivityDefinition = {
  id: string;
  kind: WorldActivityKind;
  destinationTags?: string[];
  destinationIds?: string[];
  durationMs?: number;
  action?: string;
};

const ACTIVITY_RULES: Record<string, WorldActivityDefinition[]> = {
  teacher: [{ id: 'teacher-learn', kind: 'learn', destinationTags: ['school', 'academy', 'learning'], durationMs: 9000, action: 'learn' }],
  merchant: [{ id: 'merchant-work', kind: 'work', destinationTags: ['market', 'shop', 'merchant'], durationMs: 9000, action: 'work' }],
  guide: [{ id: 'guide-social', kind: 'guide', destinationTags: ['landmark', 'station', 'airport', 'harbor'], durationMs: 7000, action: 'discover' }],
  'quest-giver': [{ id: 'quest-work', kind: 'quest', destinationTags: ['quest', 'building'], durationMs: 9000, action: 'quest' }],
  resident: [{ id: 'resident-social', kind: 'social', destinationTags: ['cafe', 'market', 'bench'], durationMs: 7000, action: 'talk' }],
  student: [{ id: 'student-learn', kind: 'learn', destinationTags: ['school', 'academy', 'library'], durationMs: 9000, action: 'learn' }],
  traveler: [{ id: 'traveler-travel', kind: 'travel', destinationTags: ['station', 'bus-stop', 'airport', 'harbor'], durationMs: 5000, action: 'travel' }],
};

export function getActivitiesForCharacter(character: WorldCharacterDefinition): WorldActivityDefinition[] {
  return ACTIVITY_RULES[character.role] ?? ACTIVITY_RULES.resident;
}

export function findActivityDestination(activity: WorldActivityDefinition, objects: WorldObjectDefinition[], fallback: { x: number; y: number }) {
  const explicit = activity.destinationIds?.map(id => objects.find(object => object.id === id)).find(Boolean);
  if (explicit) return { x: explicit.transform.x, y: explicit.transform.y, objectId: explicit.id };
  const tagged = objects.find(object => {
    const tags = new Set([...(object.tags ?? []), ...(object.metadata?.tags as string[] ?? []), object.type, object.category]);
    return activity.destinationTags?.some(tag => tags.has(tag));
  });
  return tagged ? { x: tagged.transform.x, y: tagged.transform.y, objectId: tagged.id } : fallback;
}
