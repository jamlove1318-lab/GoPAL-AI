import type { WorldBuildingDefinition, WorldPropDefinition, WorldTheme } from '../components/LivingWorldPrimitives';

export type LivingLocationTemplate = {
  id: string;
  name: string;
  theme: WorldTheme;
  buildings: WorldBuildingDefinition[];
  props: WorldPropDefinition[];
};

/** Reusable physical-world catalog. New regions compose shared primitives rather than create bespoke renderers. */
export const LIVING_LOCATION_TEMPLATES: LivingLocationTemplate[] = [
  {
    id: 'emerald-village', name: 'Emerald Valley', theme: 'emerald',
    buildings: [
      { id: 'sanctuary', type: 'sanctuary', x: 12, y: 70, scale: 0.95, label: 'Sanctuary' },
      { id: 'cafe', type: 'cafe', x: 47, y: 38, scale: 1.05, label: 'Café' },
      { id: 'library', type: 'library', x: 73, y: 20, scale: 0.92, label: 'Library' },
      { id: 'market', type: 'market', x: 78, y: 67, label: 'Market' },
      { id: 'garden', type: 'house', x: 31, y: 79, scale: 0.9, label: 'Garden' },
      { id: 'emerald-railway-station', type: 'railway-station', x: 72, y: 70, scale: 1.08, label: 'Valley Station' },
    ],
    props: [
      { id: 'emerald-tree-1', type: 'tree', x: 6, y: 18, scale: 1.0 }, { id: 'emerald-tree-2', type: 'tree', x: 20, y: 12, scale: 0.75 },
      { id: 'emerald-tree-3', type: 'tree', x: 88, y: 12, scale: 0.95 }, { id: 'emerald-tree-4', type: 'tree', x: 94, y: 43, scale: 0.72 },
      { id: 'emerald-tree-5', type: 'tree', x: 8, y: 52, scale: 0.8 }, { id: 'emerald-tree-6', type: 'tree', x: 58, y: 7, scale: 0.65 },
      { id: 'emerald-tree-7', type: 'tree', x: 60, y: 89, scale: 0.8 }, { id: 'emerald-tree-8', type: 'tree', x: 94, y: 83, scale: 0.85 },
      { id: 'emerald-rock-1', type: 'rock', x: 28, y: 33 }, { id: 'emerald-lamp-1', type: 'lamp', x: 61, y: 47 },
      { id: 'emerald-bench-1', type: 'bench', x: 53, y: 55 }, { id: 'emerald-flower-1', type: 'flower', x: 39, y: 67 }, { id: 'emerald-flower-2', type: 'flower', x: 82, y: 72 },
    ],
  },
  {
    id: 'learning-campus', name: 'Learning Campus', theme: 'coastal',
    buildings: [
      { id: 'campus-school', type: 'school', x: 42, y: 25, label: 'Academy' },
      { id: 'campus-library', type: 'library', x: 67, y: 48, label: 'Library' },
      { id: 'campus-workshop', type: 'workshop', x: 19, y: 57, label: 'Workshop' },
      { id: 'campus-cafe', type: 'cafe', x: 73, y: 73, label: 'Café' },
      { id: 'campus-airport-terminal', type: 'airport', x: 17, y: 18, scale: 1.15, label: 'Campus Airport' },
    ],
    props: [
      { id: 'campus-tree-1', type: 'tree', x: 12, y: 28 }, { id: 'campus-tree-2', type: 'tree', x: 88, y: 35 },
      { id: 'campus-tree-3', type: 'tree', x: 34, y: 76 }, { id: 'campus-bench-1', type: 'bench', x: 57, y: 69 },
      { id: 'campus-lamp-1', type: 'lamp', x: 62, y: 57 }, { id: 'campus-flower-1', type: 'flower', x: 28, y: 43 },
    ],
  },
  {
    id: 'coastal-town', name: 'Azure Coast', theme: 'coastal',
    buildings: [
      { id: 'coast-cafe', type: 'cafe', x: 25, y: 48, scale: 1.05, label: 'Seaside Café' },
      { id: 'coast-market', type: 'market', x: 49, y: 36, label: 'Harbor Market' },
      { id: 'coast-workshop', type: 'workshop', x: 72, y: 57, label: 'Boat Workshop' },
      { id: 'coast-station', type: 'railway-station', x: 78, y: 24, label: 'Coast Station' },
    ],
    props: [
      { id: 'coast-tree-1', type: 'tree', x: 8, y: 25, scale: .85 }, { id: 'coast-tree-2', type: 'tree', x: 91, y: 69, scale: .8 },
      { id: 'coast-rock-1', type: 'rock', x: 15, y: 76 }, { id: 'coast-bench-1', type: 'bench', x: 39, y: 67 },
      { id: 'coast-lamp-1', type: 'lamp', x: 59, y: 53 }, { id: 'coast-flower-1', type: 'flower', x: 87, y: 46 },
    ],
  },
  {
    id: 'mountain-village', name: 'Cloudpine Village', theme: 'mountain',
    buildings: [
      { id: 'mountain-sanctuary', type: 'sanctuary', x: 18, y: 40, scale: 1.0, label: 'Mountain Shrine' },
      { id: 'mountain-house', type: 'house', x: 46, y: 27, scale: .9, label: 'Lodge' },
      { id: 'mountain-workshop', type: 'workshop', x: 72, y: 50, label: 'Forge' },
      { id: 'mountain-cafe', type: 'cafe', x: 54, y: 70, label: 'Summit Café' },
    ],
    props: [
      { id: 'mountain-tree-1', type: 'tree', x: 7, y: 15, scale: .95 }, { id: 'mountain-tree-2', type: 'tree', x: 29, y: 11, scale: .8 },
      { id: 'mountain-tree-3', type: 'tree', x: 84, y: 18, scale: .9 }, { id: 'mountain-rock-1', type: 'rock', x: 90, y: 65, scale: 1.1 },
      { id: 'mountain-rock-2', type: 'rock', x: 32, y: 83 }, { id: 'mountain-bench-1', type: 'bench', x: 64, y: 82 },
    ],
  },
  {
    id: 'fantasy-kingdom', name: 'Moonveil Kingdom', theme: 'festival',
    buildings: [
      { id: 'fantasy-sanctuary', type: 'sanctuary', x: 50, y: 24, scale: 1.3, label: 'Moon Temple' },
      { id: 'fantasy-market', type: 'market', x: 24, y: 54, scale: 1.05, label: 'Magic Market' },
      { id: 'fantasy-workshop', type: 'workshop', x: 73, y: 54, label: 'Enchanter' },
      { id: 'fantasy-library', type: 'library', x: 51, y: 72, label: 'Arcane Library' },
      { id: 'fantasy-house', type: 'house', x: 15, y: 76, scale: .85, label: 'Village Home' },
    ],
    props: [
      { id: 'fantasy-tree-1', type: 'tree', x: 7, y: 18, scale: 1.15 }, { id: 'fantasy-tree-2', type: 'tree', x: 92, y: 19, scale: 1.1 },
      { id: 'fantasy-rock-1', type: 'rock', x: 86, y: 79, scale: 1.2 }, { id: 'fantasy-lamp-1', type: 'lamp', x: 34, y: 45 },
      { id: 'fantasy-lamp-2', type: 'lamp', x: 67, y: 44 }, { id: 'fantasy-flower-1', type: 'flower', x: 42, y: 57, scale: 1.3 },
    ],
  },
  {
    id: 'scifi-outpost', name: 'Nova Outpost', theme: 'coastal',
    buildings: [
      { id: 'scifi-school', type: 'school', x: 25, y: 32, scale: 1.05, label: 'Research Hub' },
      { id: 'scifi-workshop', type: 'workshop', x: 72, y: 32, scale: 1.05, label: 'Tech Lab' },
      { id: 'scifi-library', type: 'library', x: 50, y: 58, scale: 1.0, label: 'Data Archive' },
      { id: 'scifi-airport', type: 'airport', x: 50, y: 80, scale: 1.1, label: 'Starport' },
    ],
    props: [
      { id: 'scifi-tree-1', type: 'tree', x: 8, y: 48, scale: .75 }, { id: 'scifi-tree-2', type: 'tree', x: 92, y: 48, scale: .75 },
      { id: 'scifi-rock-1', type: 'rock', x: 17, y: 82, scale: 1.0 }, { id: 'scifi-rock-2', type: 'rock', x: 83, y: 82, scale: 1.0 },
      { id: 'scifi-lamp-1', type: 'lamp', x: 39, y: 43 }, { id: 'scifi-lamp-2', type: 'lamp', x: 61, y: 43 },
    ],
  },
  {
    id: 'game-arena', name: 'Chaos Arena', theme: 'festival',
    buildings: [
      { id: 'arena-market', type: 'market', x: 18, y: 25, scale: 1.0, label: 'Prize Booth' },
      { id: 'arena-workshop', type: 'workshop', x: 82, y: 25, scale: 1.0, label: 'Build Zone' },
      { id: 'arena-library', type: 'library', x: 18, y: 76, scale: .9, label: 'Rule Hall' },
      { id: 'arena-cafe', type: 'cafe', x: 82, y: 76, scale: .9, label: 'Party Café' },
    ],
    props: [
      { id: 'arena-lamp-1', type: 'lamp', x: 30, y: 42, scale: 1.1 }, { id: 'arena-lamp-2', type: 'lamp', x: 70, y: 42, scale: 1.1 },
      { id: 'arena-bench-1', type: 'bench', x: 30, y: 63 }, { id: 'arena-bench-2', type: 'bench', x: 70, y: 63 },
      { id: 'arena-flower-1', type: 'flower', x: 50, y: 17, scale: 1.2 }, { id: 'arena-flower-2', type: 'flower', x: 50, y: 88, scale: 1.2 },
    ],
  },
];

export function getLivingLocationTemplate(id: string) {
  return LIVING_LOCATION_TEMPLATES.find(location => location.id === id) ?? LIVING_LOCATION_TEMPLATES[0];
}
