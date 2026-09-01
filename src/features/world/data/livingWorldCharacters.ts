import type { WorldTheme } from '../components/LivingWorldPrimitives';

export type WorldCharacterRole = 'player' | 'companion' | 'resident' | 'teacher' | 'merchant' | 'guide' | 'traveler' | 'quest-giver' | 'enemy' | 'custom';

export type WorldCharacterDefinition = {
  id: string;
  role: WorldCharacterRole;
  x: number;
  y: number;
  scale?: number;
  theme?: WorldTheme;
  name?: string;
  label?: string;
  tags?: string[];
  dialogueId?: string;
  scheduleId?: string;
  interactionRadius?: number;
  persistent?: boolean;
  interactive?: boolean;
  metadata?: Record<string, unknown>;
};

export type WorldCharacterSpawnPoint = {
  id: string;
  x: number;
  y: number;
  role: WorldCharacterRole;
  tags?: string[];
  maxCount?: number;
  respawn?: boolean;
};

export const LIVING_WORLD_CHARACTERS: Record<string, WorldCharacterDefinition[]> = {
  'emerald-village': [
    { id: 'cassidy', role: 'companion', x: 38, y: 52, scale: 1, name: 'Cassidy', label: 'Cassidy', interactive: true, persistent: true, interactionRadius: 10, tags: ['companion', 'mentor'] },
    { id: 'village-teacher', role: 'teacher', x: 58, y: 35, name: 'Village Teacher', label: 'Teacher', interactive: true, interactionRadius: 8, tags: ['learning'] },
    { id: 'village-merchant', role: 'merchant', x: 82, y: 64, name: 'Market Keeper', label: 'Merchant', interactive: true, interactionRadius: 8, tags: ['market'] },
  ],
  'learning-campus': [
    { id: 'campus-guide', role: 'guide', x: 48, y: 42, name: 'Campus Guide', label: 'Guide', interactive: true, interactionRadius: 9, tags: ['learning'] },
    { id: 'campus-teacher', role: 'teacher', x: 45, y: 33, name: 'Academy Teacher', label: 'Teacher', interactive: true, interactionRadius: 8, tags: ['learning', 'lesson'] },
  ],
};

export const LIVING_WORLD_SPAWN_POINTS: Record<string, WorldCharacterSpawnPoint[]> = {
  'emerald-village': [
    { id: 'village-resident-spawn', x: 24, y: 48, role: 'resident', tags: ['village'], maxCount: 6, respawn: true },
    { id: 'village-traveler-spawn', x: 70, y: 76, role: 'traveler', tags: ['station'], maxCount: 3, respawn: true },
  ],
  'learning-campus': [
    { id: 'campus-student-spawn', x: 55, y: 62, role: 'resident', tags: ['student'], maxCount: 8, respawn: true },
  ],
};

export function getWorldCharacters(locationId: string) { return LIVING_WORLD_CHARACTERS[locationId] ?? []; }
export function getWorldSpawnPoints(locationId: string) { return LIVING_WORLD_SPAWN_POINTS[locationId] ?? []; }
export function findWorldCharacter(locationId: string, id: string) { return getWorldCharacters(locationId).find(character => character.id === id) ?? null; }
