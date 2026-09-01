import type { WorldBuildingDefinition, WorldPropDefinition, WorldTheme } from '../components/LivingWorldPrimitives';

export type LivingLocationTemplate = {
  id: string;
  name: string;
  theme: WorldTheme;
  buildings: WorldBuildingDefinition[];
  props: WorldPropDefinition[];
};

export const LIVING_LOCATION_TEMPLATES: LivingLocationTemplate[] = [
  {
    id: 'emerald-village', name: 'Emerald Village', theme: 'emerald',
    buildings: [
      { id: 'village-cafe', type: 'cafe', x: 45, y: 36, label: 'Café' },
      { id: 'village-library', type: 'library', x: 70, y: 20, label: 'Library' },
      { id: 'village-market', type: 'market', x: 75, y: 61, label: 'Market' },
      { id: 'village-sanctuary', type: 'sanctuary', x: 18, y: 58, label: 'Sanctuary' },
    ],
    props: [
      { id: 'tree-1', type: 'tree', x: 14, y: 22, scale: 1.1 }, { id: 'tree-2', type: 'tree', x: 85, y: 27 },
      { id: 'tree-3', type: 'tree', x: 57, y: 72, scale: 0.9 }, { id: 'rock-1', type: 'rock', x: 28, y: 33 },
      { id: 'lamp-1', type: 'lamp', x: 61, y: 47 }, { id: 'bench-1', type: 'bench', x: 53, y: 55 },
      { id: 'flower-1', type: 'flower', x: 39, y: 67 }, { id: 'flower-2', type: 'flower', x: 82, y: 72 },
    ],
  },
  {
    id: 'learning-campus', name: 'Learning Campus', theme: 'coastal',
    buildings: [
      { id: 'campus-school', type: 'school', x: 42, y: 25, label: 'Academy' },
      { id: 'campus-library', type: 'library', x: 67, y: 48, label: 'Library' },
      { id: 'campus-workshop', type: 'workshop', x: 19, y: 57, label: 'Workshop' },
      { id: 'campus-cafe', type: 'cafe', x: 73, y: 73, label: 'Café' },
    ],
    props: [
      { id: 'campus-tree-1', type: 'tree', x: 12, y: 28 }, { id: 'campus-tree-2', type: 'tree', x: 88, y: 35 },
      { id: 'campus-tree-3', type: 'tree', x: 34, y: 76 }, { id: 'campus-bench-1', type: 'bench', x: 57, y: 69 },
      { id: 'campus-lamp-1', type: 'lamp', x: 62, y: 57 }, { id: 'campus-flower-1', type: 'flower', x: 28, y: 43 },
    ],
  },
];

export function getLivingLocationTemplate(id: string) {
  return LIVING_LOCATION_TEMPLATES.find(location => location.id === id) ?? LIVING_LOCATION_TEMPLATES[0];
}
