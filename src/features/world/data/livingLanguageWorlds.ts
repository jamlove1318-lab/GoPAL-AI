import type { WorldLocationDefinition } from './livingWorldLocationSchema';

/** A language world is the learner-facing world identity. Locations (real or fictional) live inside it. */
export type LanguageWorldDefinition = {
  id: string;
  name: string;
  language: string;
  locale: string;
  flag?: string;
  homeWorld?: boolean;
  locationIds: string[];
  tags?: string[];
};

/** Canonical world identities. Add future languages here without changing the physical world engine. */
export const LANGUAGE_WORLDS: LanguageWorldDefinition[] = [
  { id: 'emerald-valley', name: 'Emerald Valley', language: 'GoPAL Home', locale: 'en', flag: '🌿', homeWorld: true, locationIds: ['emerald-village'], tags: ['home', 'fictional'] },
  { id: 'japanese', name: 'Japanese World', language: 'Japanese', locale: 'ja-JP', flag: '🇯🇵', locationIds: [], tags: ['language', 'real-world', 'fictional-locations'] },
  { id: 'french', name: 'French World', language: 'French', locale: 'fr-FR', flag: '🇫🇷', locationIds: [], tags: ['language', 'real-world', 'fictional-locations'] },
];

export function getLanguageWorld(id: string) { return LANGUAGE_WORLDS.find(world => world.id === id) ?? null; }
export function getLanguageWorldForLocation(location: WorldLocationDefinition): LanguageWorldDefinition | null {
  const explicit = typeof location.metadata?.languageWorldId === 'string' ? getLanguageWorld(location.metadata.languageWorldId) : null;
  if (explicit) return explicit;
  return LANGUAGE_WORLDS.find(world => world.locationIds.includes(location.id)) ?? null;
}
export function registerLanguageWorld(world: LanguageWorldDefinition): LanguageWorldDefinition[] {
  const next = LANGUAGE_WORLDS.filter(item => item.id !== world.id);
  next.push({ ...world, locationIds: [...world.locationIds], tags: world.tags ? [...world.tags] : [] });
  return next;
}
export function isLanguageWorld(world: LanguageWorldDefinition | null): boolean { return !!world && !world.homeWorld; }
export function attachLanguageWorldMetadata(location: WorldLocationDefinition, world: LanguageWorldDefinition): WorldLocationDefinition {
  return { ...location, metadata: { ...(location.metadata ?? {}), languageWorldId: world.id, language: world.language, locale: world.locale, worldDisplayName: world.name } };
}
