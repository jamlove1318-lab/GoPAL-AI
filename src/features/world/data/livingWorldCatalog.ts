import type { WorldBuildingDefinition, WorldPropDefinition, WorldTheme } from '../components/LivingWorldPrimitives';

export type LivingLocationTemplate = {
  id: string;
  name: string;
  theme: WorldTheme;
  buildings: WorldBuildingDefinition[];
  props: WorldPropDefinition[];
};

/**
 * Reusable physical-world catalog.
 *
 * A location is data, not a new screen. New regions should compose these
 * primitives rather than create another bespoke world renderer.
 */
export const LIVING_LOCATION_TEMPLATES: LivingLocationTemplate[] = [
  {
    id: 'emerald-village',
    name: 'Emerald Valley',
    theme: 'emerald',
    buildings: [
      { id: 'sanctuary', type: 'sanctuary', x: 12, y: 70, scale: 0.95, label: 'Sanctuary' },
      { id: 'cafe', type: 'cafe', x: 47, y: 38, scale: 1.05, label: 'Café' },
      { id: 'library', type: 'library', x: 73, y: 20, scale: 0.92, label: 'Library' },
      { id: 'market', type: 'market', x: 78, y: 67, label: 'Market' },
      { id: 'garden', type: 'house', x: 31, y: 79, scale: 0.9, label: 'Garden' },
    ],
    props: [
      { id: 'emerald-tree-1', type: 'tree', x: 6, y: 18, scale: 1.0 },
      { id: 'emerald-tree-2', type: 'tree', x: 20, y: 12, scale: 0.75 },
      { id: 'emerald-tree-3', type: 'tree', x: 88, y: 12, scale: 0.95 },
      { id: 'emerald-tree-4', type: 'tree', x: 94, y: 43, scale: 0.72 },
      { id: 'emerald-tree-5', type: 'tree', x: 8, y: 52, scale: 0.8 },
      { id: 'emerald-tree-6', type: 'tree', x: 58, y: 7, scale: 0.65 },
      { id: 'emerald-tree-7', type: 'tree', x: 60, y: 89, scale: 0.8 },
      { id: 'emerald-tree-8', type: 'tree', x: 94, y: 83, scale: 0.85 },
      { id: 'emerald-rock-1', type: 'rock', x: 28, y: 33 },
      { id: 'emerald-lamp-1', type: 'lamp', x: 61, y: 47 },
      { id: 'emerald-bench-1', type: 'bench', x: 53, y: 55 },
      { id: 'emerald-flower-1', type: 'flower', x: 39, y: 67 },
      { id: 'emerald-flower-2', type: 'flower', x: 82, y: 72 },
    ],
  },
  {
    id: 'learning-campus',
    name: 'Learning Campus',
    theme: 'coastal',
    buildings: [
      { id: 'campus-school', type: 'school', x: 42, y: 25, label: 'Academy' },
      { id: 'campus-library', type: 'library', x: 67, y: 48, label: 'Library' },
      { id: 'campus-workshop', type: 'workshop', x: 19, y: 57, label: 'Workshop' },
      { id: 'campus-cafe', type: 'cafe', x: 73, y: 73, label: 'Café' },
    ],
    props: [
      { id: 'campus-tree-1', type: 'tree', x: 12, y: 28 },
      { id: 'campus-tree-2', type: 'tree', x: 88, y: 35 },
      { id: 'campus-tree-3', type: 'tree', x: 34, y: 76 },
      { id: 'campus-bench-1', type: 'bench', x: 57, y: 69 },
      { id: 'campus-lamp-1', type: 'lamp', x: 62, y: 57 },
      { id: 'campus-flower-1', type: 'flower', x: 28, y: 43 },
    ],
  },
];

export function getLivingLocationTemplate(id: string) {
  return LIVING_LOCATION_TEMPLATES.find(location => location.id === id) ?? LIVING_LOCATION_TEMPLATES[0];
}
