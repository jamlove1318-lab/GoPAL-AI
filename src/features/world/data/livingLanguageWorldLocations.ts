/**
 * Canonical content catalog for language-world locations.
 *
 * Emerald Valley remains the only top-level fictional home world.
 * Real and fictional learning places belong inside a language world.
 * The physical construction kit can materialize these records later.
 */
export type LanguageLocationKind = 'real' | 'fictional';
export type LanguageLocationExperience = 'exploration' | 'conversation' | 'vocabulary' | 'grammar' | 'culture' | 'quest';

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
  { id:'jp-tokyo-shibuya', worldId:'japanese', name:'Shibuya Crossing', kind:'real', city:'Tokyo', country:'Japan', description:'A lively Tokyo district for greetings, directions, signs, and everyday conversation.', tags:['tokyo','city','everyday-life','directions'], experiences:['exploration','conversation','vocabulary','quest'], unlockOrder:1, coordinates:{x:22,y:18} },
  { id:'jp-tokyo-cafe', worldId:'japanese', name:'Komorebi Café Tokyo', kind:'fictional', city:'Tokyo', country:'Japan', description:'A fictional neighborhood café where learners practice ordering, requests, and polite conversation.', tags:['cafe','food','conversation','politeness'], experiences:['conversation','vocabulary','grammar','culture'], unlockOrder:2, coordinates:{x:31,y:25} },
  { id:'jp-kyoto-gion', worldId:'japanese', name:'Gion, Kyoto', kind:'real', city:'Kyoto', country:'Japan', description:'A Kyoto setting for cultural vocabulary, respectful language, and contextual discovery.', tags:['kyoto','culture','tradition','respect'], experiences:['exploration','vocabulary','culture','quest'], unlockOrder:3, coordinates:{x:48,y:32} },
  { id:'jp-kyoto-whispering-garden', worldId:'japanese', name:'Whispering Bamboo Garden', kind:'fictional', city:'Kyoto', country:'Japan', description:'A fictional garden where environmental vocabulary and quiet observation become learning moments.', tags:['garden','nature','observation','discovery'], experiences:['exploration','vocabulary','grammar','culture'], unlockOrder:4, coordinates:{x:57,y:38} },
  { id:'jp-osaka-dotonbori', worldId:'japanese', name:'Dotonbori, Osaka', kind:'real', city:'Osaka', country:'Japan', description:'A bright Osaka district for food vocabulary, casual conversation, signs, and practical travel language.', tags:['osaka','food','nightlife','casual-conversation'], experiences:['exploration','conversation','vocabulary','quest'], unlockOrder:5, coordinates:{x:28,y:55} },
  { id:'jp-osaka-night-market', worldId:'japanese', name:'Lantern Night Market', kind:'fictional', city:'Osaka', country:'Japan', description:'A fictional market where learners ask prices, make choices, and practice spontaneous phrases.', tags:['market','food','prices','conversation'], experiences:['conversation','vocabulary','grammar','quest'], unlockOrder:6, coordinates:{x:38,y:62} },
  { id:'jp-kanazawa', worldId:'japanese', name:'Kanazawa', kind:'real', city:'Kanazawa', country:'Japan', description:'A cultural destination for crafts, seasonal vocabulary, travel conversation, and careful observation.', tags:['kanazawa','crafts','culture','seasonal'], experiences:['exploration','conversation','vocabulary','culture'], unlockOrder:7, coordinates:{x:63,y:53} },
  { id:'jp-kanazawa-craft-house', worldId:'japanese', name:'Hikari Craft House', kind:'fictional', city:'Kanazawa', country:'Japan', description:'A fictional artisan workshop where learners discover materials, instructions, and descriptive grammar.', tags:['crafts','workshop','instructions','discovery'], experiences:['exploration','vocabulary','grammar','culture'], unlockOrder:8, coordinates:{x:73,y:60} },
  { id:'jp-fukuoka-hakata', worldId:'japanese', name:'Hakata, Fukuoka', kind:'real', city:'Fukuoka', country:'Japan', description:'A welcoming travel hub for introductions, food culture, transit language, and everyday conversation.', tags:['fukuoka','hakata','food','transit'], experiences:['exploration','conversation','vocabulary','quest'], unlockOrder:9, coordinates:{x:77,y:34} },
  { id:'jp-fukuoka-yatai-alley', worldId:'japanese', name:'Moonlit Yatai Alley', kind:'fictional', city:'Fukuoka', country:'Japan', description:'A fictional food-stall alley for fast listening, ordering, greetings, and friendly conversation.', tags:['yatai','food','listening','conversation'], experiences:['conversation','vocabulary','culture','quest'], unlockOrder:10, coordinates:{x:86,y:42} },
  { id:'fr-paris-montmartre', worldId:'french', name:'Montmartre', kind:'real', city:'Paris', country:'France', description:'A Paris neighborhood for introductions, descriptions, directions, and everyday French.', tags:['paris','city','directions','everyday-life'], experiences:['exploration','conversation','vocabulary','quest'], unlockOrder:1, coordinates:{x:20,y:19} },
  { id:'fr-paris-bakery', worldId:'french', name:'La Petite Lune Bakery', kind:'fictional', city:'Paris', country:'France', description:'A fictional bakery built around ordering food, polite requests, numbers, and short conversations.', tags:['bakery','food','conversation','politeness'], experiences:['conversation','vocabulary','grammar','culture'], unlockOrder:2, coordinates:{x:30,y:27} },
  { id:'fr-lyon-old-town', worldId:'french', name:'Vieux Lyon', kind:'real', city:'Lyon', country:'France', description:'A historic French setting for travel vocabulary, descriptions, and cultural discovery.', tags:['lyon','history','travel','culture'], experiences:['exploration','vocabulary','culture','quest'], unlockOrder:3, coordinates:{x:47,y:34} },
  { id:'fr-lyon-story-square', worldId:'french', name:'Place des Histoires', kind:'fictional', city:'Lyon', country:'France', description:'A fictional story square where learners use grammar to piece together small scenes.', tags:['stories','grammar','mystery','discovery'], experiences:['exploration','conversation','grammar','quest'], unlockOrder:4, coordinates:{x:58,y:40} },
  { id:'fr-strasbourg', worldId:'french', name:'Strasbourg Old Town', kind:'real', city:'Strasbourg', country:'France', description:'A historic city setting for directions, architecture vocabulary, seasonal culture, and conversation.', tags:['strasbourg','history','architecture','culture'], experiences:['exploration','conversation','vocabulary','culture'], unlockOrder:5, coordinates:{x:28,y:56} },
  { id:'fr-strasbourg-christmas-quarter', worldId:'french', name:'Étoile Market Quarter', kind:'fictional', city:'Strasbourg', country:'France', description:'A fictional market quarter for seasonal vocabulary, descriptions, requests, and short dialogues.', tags:['market','seasonal','shopping','conversation'], experiences:['conversation','vocabulary','grammar','culture'], unlockOrder:6, coordinates:{x:38,y:63} },
  { id:'fr-nice', worldId:'french', name:'Nice', kind:'real', city:'Nice', country:'France', description:'A Mediterranean destination for travel phrases, directions, descriptions, and relaxed conversation.', tags:['nice','coast','travel','mediterranean'], experiences:['exploration','conversation','vocabulary','quest'], unlockOrder:7, coordinates:{x:63,y:53} },
  { id:'fr-nice-promenade-studio', worldId:'french', name:'Promenade des Rêves', kind:'fictional', city:'Nice', country:'France', description:'A fictional seaside learning studio where learners practice descriptions, directions, and spontaneous conversation.', tags:['coast','studio','descriptions','conversation'], experiences:['exploration','conversation','grammar','culture'], unlockOrder:8, coordinates:{x:73,y:60} },
];

export function getLanguageWorldLocations(worldId: LanguageWorldLocationDefinition['worldId']) {
  return LANGUAGE_WORLD_LOCATIONS.filter(location => location.worldId === worldId).sort((a,b) => a.unlockOrder-b.unlockOrder).map(location => ({...location, tags:[...location.tags], experiences:[...location.experiences]}));
}

export function getLanguageWorldLocation(locationId: string) {
  const location = LANGUAGE_WORLD_LOCATIONS.find(item => item.id === locationId);
  return location ? {...location, tags:[...location.tags], experiences:[...location.experiences]} : null;
}

export function isRealLanguageWorldLocation(location: LanguageWorldLocationDefinition) { return location.kind === 'real'; }
export function isFictionalLanguageWorldLocation(location: LanguageWorldLocationDefinition) { return location.kind === 'fictional'; }
