import { getLocationGameplay } from './livingWorldGameplay';
import { getWorldInfrastructure } from './livingWorldInfrastructure';
import { getWorldVehicles } from './livingWorldVehicles';
import { getLivingWorldTransport } from './livingWorldTransport';
import { getLivingLocationTemplate } from './livingWorldCatalog';
import { getWorldCharacters } from './livingWorldCharacters';
import { getWorldEntrances } from './livingWorldEntrances';
import type { WorldObjectDefinition } from './livingWorldObjects';

/** Converts existing catalogs into one canonical object stream without duplicating their source data. */
export function getLocationWorldObjects(locationId: string): WorldObjectDefinition[] {
  const location = getLivingLocationTemplate(locationId);
  const objects: WorldObjectDefinition[] = [];

  for (const building of location.buildings) objects.push({
    id: building.id, category: 'building', type: building.type,
    transform: { x: building.x, y: building.y, scale: building.scale },
    visual: { theme: location.theme },
    collision: { enabled: true, width: building.collisionWidth, height: building.collisionHeight, solid: true },
    interaction: { enabled: true, radius: building.interactionRadius },
    metadata: { label: building.label ?? building.id },
  });

  for (const prop of location.props) objects.push({
    id: prop.id, category: prop.type === 'tree' || prop.type === 'flower' ? 'nature' : 'prop', type: prop.type,
    transform: { x: prop.x, y: prop.y, scale: prop.scale }, visual: { theme: location.theme },
    collision: { enabled: prop.type === 'tree' || prop.type === 'rock' || prop.type === 'fence', solid: true },
    interaction: { enabled: prop.type === 'tree' || prop.type === 'rock' || prop.type === 'bench' || prop.type === 'flower' || prop.type === 'sign' },
  });

  for (const item of getWorldInfrastructure(locationId)) objects.push({
    id: item.id, category: 'infrastructure', type: item.kind,
    transform: { x: item.x, y: item.y, scale: item.scale, rotation: item.rotation, layer: item.zIndex },
    visual: { theme: item.theme ?? location.theme, variant: item.variant },
    interaction: { enabled: item.interactive === true, radius: 7 },
    metadata: { label: item.label ?? item.id },
  });

  for (const network of getLivingWorldTransport(locationId)) for (const feature of network.features) objects.push({
    id: feature.id, category: 'transport', type: network.kind,
    transform: { x: 0, y: 0, layer: feature.zIndex }, visual: { theme: network.theme, opacity: feature.opacity },
    interaction: { enabled: false },
    metadata: { featureKind: feature.kind, path: feature.path, width: feature.width },
  });

  for (const vehicle of getWorldVehicles(locationId)) objects.push({
    id: vehicle.id, category: 'vehicle', type: vehicle.kind,
    transform: { x: vehicle.x, y: vehicle.y, scale: vehicle.scale, rotation: vehicle.rotation },
    visual: { theme: vehicle.theme }, interaction: { enabled: vehicle.interactive === true, radius: 8 },
    behavior: { enabled: vehicle.moving === true, routeId: vehicle.routeId, speed: vehicle.speed },
    metadata: { label: vehicle.label ?? vehicle.id },
  });

  for (const item of getLocationGameplay(locationId)) objects.push({
    id: item.id, category: 'gameplay', type: item.kind,
    transform: { x: item.x, y: item.y, scale: item.scale }, visual: { theme: item.theme },
    interaction: { enabled: item.interactive === true, radius: item.radius, targetId: item.targetId },
    state: { active: true }, tags: item.tags, metadata: { label: item.label ?? item.id },
  });

  for (const character of getWorldCharacters(locationId)) objects.push({
    id: character.id, category: 'character', type: character.role,
    transform: { x: character.x, y: character.y, scale: character.scale },
    visual: { theme: character.theme ?? location.theme },
    interaction: { enabled: character.interactive === true, radius: character.interactionRadius ?? 8 },
    behavior: { enabled: Boolean(character.scheduleId), behaviorId: character.scheduleId },
    tags: character.tags, metadata: { label: character.label ?? character.name ?? character.id, dialogueId: character.dialogueId },
  });

  for (const entrance of getWorldEntrances(locationId)) objects.push({
    id: entrance.id, category: 'gameplay', type: entrance.kind,
    transform: { x: entrance.x, y: entrance.y, scale: entrance.scale, rotation: entrance.rotation },
    visual: { theme: entrance.theme ?? location.theme },
    interaction: { enabled: entrance.interactive === true, radius: 7, targetId: entrance.targetId },
    state: { active: true, unlocked: entrance.locked !== true },
    tags: entrance.tags, metadata: { label: entrance.label ?? entrance.id, targetType: entrance.targetType },
  });

  return objects;
}

export function getWorldObject(locationId: string, objectId: string): WorldObjectDefinition | null {
  return getLocationWorldObjects(locationId).find(object => object.id === objectId) ?? null;
}
