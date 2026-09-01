import type { WorldObjectDefinition } from './livingWorldObjects';
import { getWorldEntrances } from './livingWorldEntrances';
import { getLivingLocationTemplate } from './livingWorldCatalog';

/** Adapts entrance definitions into the canonical object model. */
export function getLocationEntranceObjects(locationId: string): WorldObjectDefinition[] {
  const location = getLivingLocationTemplate(locationId);
  return getWorldEntrances(location.id).map(entrance => ({
    id: entrance.id,
    category: 'gameplay',
    type: entrance.kind,
    transform: { x: entrance.x, y: entrance.y, scale: entrance.scale, rotation: entrance.rotation },
    visual: { theme: entrance.theme ?? location.theme },
    collision: { enabled: false },
    interaction: { enabled: entrance.interactive === true, actions: ['enter'], radius: 8, targetId: entrance.targetId },
    state: { active: true, unlocked: entrance.locked !== true },
    tags: entrance.tags,
    metadata: { targetType: entrance.targetType, width: entrance.width, label: entrance.label },
  }));
}
