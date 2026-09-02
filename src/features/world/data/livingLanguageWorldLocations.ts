/**
 * Canonical content catalog for language-world locations.
 *
 * Emerald Valley remains the only top-level fictional home world.
 * Real and fictional learning places belong inside a language world.
 * The physical construction kit can materialize these records later.
 */
export type LanguageLocationKind = 'real' | 'fictional';
export type LanguageLocationExperience =
  | 'exploration'
  | 'conversation'
  | 'vocabulary'
  | 'grammar'
  | 'culture'
  | 'quest';

export interface LanguageWorldLocationDefinition {
  id: string;
  worldId: 'japanese' | 'french';
  name: string;
  kind: LanguageLocationKind;
  city?: string;
  country: string;
  description: string;
  tags: string[];
  experiences: LanguageLocationExperience[];
  unlockOrder: number;
  coordinates?: { x: number; y: number };
}

export const LANGUAGE_WORLD_LOCATIONS: LanguageWorldLocationDefinition[] = [
  {
    id: 'jp-tokyo-shibuya',
    worldId: 'japanese',
    name: 'Shibuya Crossing',
    kind: 'real',
    city: 'Tokyo',
    country: 'Japan',
    description: 'A lively Tokyo district for greetings, directions, signs, and everyday conversation.',
    tags: ['tokyo', 'city', 'everyday-life', 'directions'],
    experiences: ['exploration', 'conversation', 'vocabulary', 'quest'],
    unlockOrder: 1,
    coordinates: { x: 22, y: 18 },
  },
  {
    id: 'jp-tokyo-cafe',
    worldId: 'japanese',
    name: 'Komorebi Café Tokyo',
    kind: 'fictional',
    city: 'Tokyo',
    country: 'Japan',
    description: 'A fictional neighborhood café where learners practice ordering, requests, and polite conversation.',
    tags: ['cafe', 'food', 'conversation', 'politeness'],
    experiences: ['conversation', 'vocabulary', 'grammar', 'culture'],
    unlockOrder: 2,
    coordinates: { x: 31, y: 25 },
  },
  {
    id: 'jp-kyoto-gion',
    worldId: 'japanese',
    name: 'Gion, Kyoto',
    kind: 'real',
    city: 'Kyoto',
    country: 'Japan',
    description: 'A Kyoto setting for cultural vocabulary, respectful language, and contextual discovery.',
    tags: ['kyoto', 'culture', 'tradition', 'respect'],
    experiences: ['exploration', 'vocabulary', 'culture', 'quest'],
    unlockOrder: 3,
    coordinates: { x: 48, y: 32 },
  },
  {
    id: 'jp-kyoto-whispering-garden',
    worldId: 'japanese',
    name: 'Whispering Bamboo Garden',
    kind: 'fictional',
    city: 'Kyoto',
    country: 'Japan',
    description: 'A fictional garden where environmental vocabulary and quiet observation become learning moments.',
    tags: ['garden', 'nature', 'observation', 'discovery'],
    experiences: ['exploration', 'vocabulary', 'grammar', 'culture'],
    unlockOrder: 4,
    coordinates: { x: 57, y: 38 },
  },
  {
    id: 'fr-paris-montmartre',
    worldId: 'french',
    name: 'Montmartre',
    kind: 'real',
    city: 'Paris',
    country: 'France',
    description: 'A Paris neighborhood for introductions, descriptions, directions, and everyday French.',
    tags: ['paris', 'city', 'directions', 'everyday-life'],
    experiences: ['exploration', 'conversation', 'vocabulary', 'quest'],
    unlockOrder: 1,
    coordinates: { x: 20, y: 19 },
  },
  {
    id: 'fr-paris-bakery',
    worldId: 'french',
    name: 'La Petite Lune Bakery',
    kind: 'fictional',
    city: 'Paris',
    country: 'France',
    description: 'A fictional bakery built around ordering food, polite requests, numbers, and short conversations.',
    tags: ['bakery', 'food', 'conversation', 'politeness'],
    experiences: ['conversation', 'vocabulary', 'grammar', 'culture'],
    unlockOrder: 2,
    coordinates: { x: 30, y: 27 },
  },
  {
    id: 'fr-lyon-old-town',
    worldId: 'french',
    name: 'Vieux Lyon',
    kind: 'real',
    city: 'Lyon',
    country: 'France',
    description: 'A historic French setting for travel vocabulary, descriptions, and cultural discovery.',
    tags: ['lyon', 'history', 'travel', 'culture'],
    experiences: ['exploration', 'vocabulary', 'culture', 'quest'],
    unlockOrder: 3,
    coordinates: { x: 47, y: 34 },
  },
  {
    id: 'fr-lyon-story-square',
    worldId: 'french',
    name: 'Place des Histoires',
    kind: 'fictional',
    city: 'Lyon',
    country: 'France',
    description: 'A fictional story square where learners use grammar to piece together small scenes.',
    tags: ['stories', 'grammar', 'mystery', 'discovery'],
    experiences: ['exploration', 'conversation', 'grammar', 'quest'],
    unlockOrder: 4,
    coordinates: { x: 58, y: 40 },
  },
];

export function getLanguageWorldLocations(worldId: LanguageWorldLocationDefinition['worldId']) {
  return LANGUAGE_WORLD_LOCATIONS
    .filter((location) => location.worldId === worldId)
    .sort((a, b) => a.unlockOrder - b.unlockOrder)
    .map((location) => ({ ...location, tags: [...location.tags], experiences: [...location.experiences] }));
}

export function getLanguageWorldLocation(locationId: string) {
  const location = LANGUAGE_WORLD_LOCATIONS.find((item) => item.id === locationId);
  return location ? { ...location, tags: [...location.tags], experiences: [...location.experiences] } : null;
}

export function isRealLanguageWorldLocation(location: LanguageWorldLocationDefinition) {
  return location.kind === 'real';
}

export function isFictionalLanguageWorldLocation(location: LanguageWorldLocationDefinition) {
  return location.kind === 'fictional';
}
