/**
 * Canonical physical identity for locations.
 *
 * This layer deliberately describes spatial composition, not renderer details.
 * Terrain, construction, infrastructure, and cinematics can consume the same
 * profile without each inventing its own tag heuristics.
 */

export type PhysicalLocationProfileId =
  | 'urban-crossing'
  | 'neighborhood-cafe'
  | 'historic-district'
  | 'bamboo-garden'
  | 'neon-canal'
  | 'market-alley'
  | 'craft-district'
  | 'transit-hub'
  | 'mediterranean-promenade'
  | 'story-square';

export type PhysicalLocationProfile = {
  id: PhysicalLocationProfileId;
  streetPattern: 'grid' | 'lane' | 'path' | 'promenade' | 'courtyard' | 'plaza' | 'mixed';
  density: 'open' | 'neighborhood' | 'dense';
  primaryLandmark: 'crossing' | 'cafe' | 'historic' | 'garden' | 'canal' | 'market' | 'workshop' | 'station' | 'waterfront' | 'square';
  infrastructure: Array<'road' | 'sidewalk' | 'crosswalk' | 'rail' | 'canal' | 'market-stalls' | 'promenade' | 'plaza' | 'garden-path'>;
  signatures: string[];
};

export const PHYSICAL_LOCATION_PROFILES: Record<PhysicalLocationProfileId, PhysicalLocationProfile> = {
  'urban-crossing': { id:'urban-crossing', streetPattern:'grid', density:'dense', primaryLandmark:'crossing', infrastructure:['road','sidewalk','crosswalk'], signatures:['dense-frontage','pedestrian-crossing','commercial-streets'] },
  'neighborhood-cafe': { id:'neighborhood-cafe', streetPattern:'lane', density:'neighborhood', primaryLandmark:'cafe', infrastructure:['road','sidewalk'], signatures:['small-frontage','seating-edge','neighborhood-lane'] },
  'historic-district': { id:'historic-district', streetPattern:'lane', density:'neighborhood', primaryLandmark:'historic', infrastructure:['road','sidewalk','plaza'], signatures:['historic-frontage','narrow-lanes','cultural-landmark'] },
  'bamboo-garden': { id:'bamboo-garden', streetPattern:'path', density:'open', primaryLandmark:'garden', infrastructure:['garden-path'], signatures:['bamboo-grove','quiet-clearing','nature-path'] },
  'neon-canal': { id:'neon-canal', streetPattern:'mixed', density:'dense', primaryLandmark:'canal', infrastructure:['road','sidewalk','canal'], signatures:['waterfront-neon','food-frontage','nightlife'] },
  'market-alley': { id:'market-alley', streetPattern:'lane', density:'dense', primaryLandmark:'market', infrastructure:['road','sidewalk','market-stalls'], signatures:['stall-row','food-alley','pedestrian-lane'] },
  'craft-district': { id:'craft-district', streetPattern:'courtyard', density:'neighborhood', primaryLandmark:'workshop', infrastructure:['road','sidewalk','plaza'], signatures:['artisan-frontage','workshop-yard','craft-displays'] },
  'transit-hub': { id:'transit-hub', streetPattern:'grid', density:'dense', primaryLandmark:'station', infrastructure:['road','sidewalk','rail'], signatures:['station-forecourt','transit-flow','food-frontage'] },
  'mediterranean-promenade': { id:'mediterranean-promenade', streetPattern:'promenade', density:'open', primaryLandmark:'waterfront', infrastructure:['road','sidewalk','promenade'], signatures:['waterfront-edge','palm-grove','open-view'] },
  'story-square': { id:'story-square', streetPattern:'plaza', density:'neighborhood', primaryLandmark:'square', infrastructure:['sidewalk','plaza'], signatures:['central-square','story-space','pedestrian-plaza'] },
};

const LOCATION_PROFILE_MAP: Record<string, PhysicalLocationProfileId> = {
  'jp-tokyo-shibuya':'urban-crossing',
  'jp-tokyo-cafe':'neighborhood-cafe',
  'jp-kyoto-gion':'historic-district',
  'jp-kyoto-whispering-garden':'bamboo-garden',
  'jp-osaka-dotonbori':'neon-canal',
  'jp-osaka-night-market':'market-alley',
  'jp-kanazawa':'craft-district',
  'jp-kanazawa-craft-house':'craft-district',
  'jp-fukuoka-hakata':'transit-hub',
  'jp-fukuoka-yatai-alley':'market-alley',
  'fr-paris-montmartre':'historic-district',
  'fr-paris-bakery':'neighborhood-cafe',
  'fr-lyon-old-town':'historic-district',
  'fr-lyon-story-square':'story-square',
  'fr-strasbourg':'historic-district',
  'fr-strasbourg-christmas-quarter':'market-alley',
  'fr-nice':'mediterranean-promenade',
  'fr-nice-promenade-studio':'mediterranean-promenade',
};

export function getPhysicalLocationProfile(locationId: string): PhysicalLocationProfile | null {
  const profileId = LOCATION_PROFILE_MAP[locationId];
  return profileId ? PHYSICAL_LOCATION_PROFILES[profileId] : null;
}
