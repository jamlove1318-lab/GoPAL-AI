import { buildWorldLocation } from './livingWorldLocationFactory';
import { getLocationGameplay } from './livingWorldGameplay';
import { createLivingWorldNavigation } from './livingWorldNavigation';
import { buildWorldConstructionKit } from './livingWorldConstructionKit';
import { getLocationWorldObjects } from './livingWorldObjectFactory';

export type WorldIntegrityIssue = { code: string; severity: 'error' | 'warning'; message: string; objectId?: string };
export type WorldIntegrityReport = { locationId: string; ok: boolean; objectCount: number; gameplayCount: number; networkCount: number; issues: WorldIntegrityIssue[] };

export function validateWorldLocation(locationId: string): WorldIntegrityReport {
  const issues: WorldIntegrityIssue[] = [];
  let location;
  try { location = buildWorldLocation(locationId); } catch (error) { return { locationId, ok: false, objectCount: 0, gameplayCount: 0, networkCount: 0, issues: [{ code: 'LOCATION_BUILD_FAILED', severity: 'error', message: error instanceof Error ? error.message : String(error) }] }; }
  const seen = new Set<string>();
  for (const object of location.objects) {
    if (seen.has(object.id)) issues.push({ code: 'DUPLICATE_OBJECT_ID', severity: 'error', message: `Duplicate object id: ${object.id}`, objectId: object.id });
    seen.add(object.id);
    const { x, y } = object.transform;
    if (x < 0 || x > 100 || y < 0 || y > 100) issues.push({ code: 'OBJECT_OUT_OF_BOUNDS', severity: 'error', message: `Object is outside normalized world bounds (${x}, ${y}).`, objectId: object.id });
  }
  const gameplay = getLocationGameplay(locationId);
  for (const item of gameplay) {
    if (!seen.has(item.id)) issues.push({ code: 'GAMEPLAY_OBJECT_MISSING', severity: 'warning', message: `Gameplay object ${item.id} is not represented by a canonical world object.`, objectId: item.id });
    if (item.targetId && !seen.has(item.targetId) && !gameplay.some(candidate => candidate.id === item.targetId)) issues.push({ code: 'INVALID_GAMEPLAY_TARGET', severity: 'error', message: `Gameplay target ${item.targetId} does not exist.`, objectId: item.id });
  }
  let networkCount = 0;
  try { networkCount = createLivingWorldNavigation(locationId).getNetworkIds().length; } catch (error) { issues.push({ code: 'NAVIGATION_BUILD_FAILED', severity: 'error', message: error instanceof Error ? error.message : String(error) }); }
  try { buildWorldConstructionKit(locationId); getLocationWorldObjects(locationId); } catch (error) { issues.push({ code: 'CONSTRUCTION_KIT_FAILED', severity: 'error', message: error instanceof Error ? error.message : String(error) }); }
  if (!location.objects.some(object => object.category === 'gameplay' && object.type === 'spawn')) issues.push({ code: 'MISSING_SPAWN', severity: 'warning', message: 'Location has no canonical gameplay spawn object.' });
  return { locationId, ok: issues.every(issue => issue.severity !== 'error'), objectCount: location.objects.length, gameplayCount: gameplay.length, networkCount, issues };
}

export function validateAllWorldLocations(locationIds: string[]): WorldIntegrityReport[] { return locationIds.map(validateWorldLocation); }

export const LEGACY_WORLD_PATHS = {
  residentLayer: 'src/features/world/components/LivingResidentLayer.tsx',
  vehicleLayer: 'src/features/world/components/LivingVehicleLayer.tsx',
  policy: 'compatibility-only; canonical runtime/simulation owns state',
};
