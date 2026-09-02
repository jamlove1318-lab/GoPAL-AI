import type { WorldActionId } from './livingWorldActionSystem';
import type { WorldEvent, WorldEventBus } from './livingWorldEvents';
import type { WorldObjectDefinition } from './livingWorldObjects';

export type WorldLearningKind = 'lesson' | 'vocabulary' | 'grammar' | 'conversation' | 'discovery' | 'quest' | 'school' | 'library' | 'market' | 'cafe';
export type WorldLearningActivity = {
  id: string;
  kind: WorldLearningKind;
  locationId: string;
  objectId: string;
  title: string;
  description: string;
  xp: number;
  tags: string[];
  prerequisiteIds: string[];
  context: { objectType?: string; characterRole?: string; language?: string; locale?: string };
};
export type WorldLearningState = { activityId: string; started: boolean; completed: boolean; completionCount: number; lastEventAt?: number };

const XP: Record<WorldLearningKind, number> = { lesson: 20, vocabulary: 10, grammar: 15, conversation: 20, discovery: 8, quest: 25, school: 20, library: 15, market: 12, cafe: 15 };

function activityForObject(locationId: string, object: WorldObjectDefinition): WorldLearningActivity | null {
  const type = String(object.type ?? '').toLowerCase();
  const tags = new Set((object.tags ?? []).map(String));
  let kind: WorldLearningKind | null = null;
  if (type === 'school' || type === 'academy' || tags.has('school')) kind = 'school';
  else if (type === 'library' || tags.has('library')) kind = 'library';
  else if (type === 'market' || type === 'shop' || tags.has('market')) kind = 'market';
  else if (type === 'cafe' || type === 'restaurant' || tags.has('conversation')) kind = 'cafe';
  else if (type === 'lesson-point' || tags.has('lesson')) kind = 'lesson';
  else if (type === 'dialogue-point' || tags.has('conversation')) kind = 'conversation';
  else if (type === 'quest-marker' || tags.has('quest')) kind = 'quest';
  else if (type === 'landmark' || tags.has('discovery')) kind = 'discovery';
  else if (tags.has('grammar')) kind = 'grammar';
  else if (tags.has('vocabulary')) kind = 'vocabulary';
  if (!kind) return null;
  const language = typeof object.metadata?.language === 'string' ? object.metadata.language : undefined;
  const locale = typeof object.metadata?.locale === 'string' ? object.metadata.locale : undefined;
  return { id: `learning:${locationId}:${object.id}:${kind}`, kind, locationId, objectId: object.id, title: object.name ?? object.type, description: `Learn through ${String(object.name ?? object.type).toLowerCase()} in the living world.`, xp: XP[kind], tags: [...(object.tags ?? []), kind], prerequisiteIds: [], context: { objectType: type, language, locale } };
}

export function getWorldLearningActivities(locationId: string, objects: WorldObjectDefinition[]): WorldLearningActivity[] { return objects.map(object => activityForObject(locationId, object)).filter((item): item is WorldLearningActivity => !!item); }

export class LivingWorldLearningEngine {
  private readonly activities: WorldLearningActivity[];
  private readonly states = new Map<string, WorldLearningState>();
  constructor(private readonly events: WorldEventBus, private readonly locationId: string, objects: WorldObjectDefinition[]) {
    this.activities = getWorldLearningActivities(locationId, objects);
    for (const activity of this.activities) this.states.set(activity.id, { activityId: activity.id, started: false, completed: false, completionCount: 0 });
  }
  getActivities() { return [...this.activities]; }
  getState(activityId: string) { return this.states.get(activityId) ?? null; }
  getAllStates() { return [...this.states.values()]; }
  findForObject(objectId: string) { return this.activities.filter(activity => activity.objectId === objectId); }
  start(activityId: string, actorId = 'player') {
    const activity = this.activities.find(item => item.id === activityId);
    if (!activity) return null;
    const state = this.states.get(activityId) ?? { activityId, started: false, completed: false, completionCount: 0 };
    state.started = true;
    this.states.set(activityId, state);
    this.events.emit({ id: `learning-start-${Date.now()}-${activityId}`, type: 'activity-started', timestamp: Date.now(), locationId: this.locationId, objectId: activity.objectId, actorId, payload: { activityId, kind: activity.kind, xp: activity.xp } });
    return { activity, state };
  }
  complete(activityId: string, actorId = 'player', success = true) {
    const activity = this.activities.find(item => item.id === activityId);
    if (!activity || !success) return null;
    const state = this.states.get(activityId) ?? { activityId, started: false, completed: false, completionCount: 0 };
    state.started = true;
    state.completed = true;
    state.completionCount += 1;
    state.lastEventAt = Date.now();
    this.states.set(activityId, state);
    this.events.emit({ id: `learning-complete-${Date.now()}-${activityId}`, type: 'activity-completed', timestamp: Date.now(), locationId: this.locationId, objectId: activity.objectId, actorId, action: 'learn' as WorldActionId, payload: { activityId, kind: activity.kind, xp: activity.xp, completionCount: state.completionCount } });
    this.events.emit({ id: `learning-learned-${Date.now()}-${activityId}`, type: 'learned', timestamp: Date.now(), locationId: this.locationId, objectId: activity.objectId, actorId, action: 'learn' as WorldActionId, payload: { activityId, kind: activity.kind, xp: activity.xp } });
    return { activity, state, xp: activity.xp };
  }
  handleEvent(event: WorldEvent) {
    if (event.locationId !== this.locationId || !event.objectId) return null;
    const activity = this.activities.find(item => item.objectId === event.objectId);
    if (!activity) return null;
    if (event.type === 'dialogue-started' || event.action === 'learn') return this.start(activity.id, event.actorId);
    return null;
  }
}
