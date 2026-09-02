import { getLanguageWorldLocations } from '../../features/world/data/livingLanguageWorldLocations';

export type LanguageWorldId='ja'|'es'|'fr'|'ko';
export type WorldPlace={id:string;name:string;city:string;country:string;realWorldLocation:string;purpose:string;landmarks:string[];hiddenGems:string[];};
export type LanguageWorld={id:LanguageWorldId;languageCode:string;languageName:string;worldName:string;regionLabel:string;visualIdentity:string;places:WorldPlace[];culture:{greetings:string[];food:string[];dailyLife:string[]};};

const WORLDS:Record<LanguageWorldId,LanguageWorld>={
 ja:{id:'ja',languageCode:'ja',languageName:'Japanese',worldName:'Japanese World',regionLabel:'Real places and fictional learning places across Japan',visualIdentity:'A living Japanese language world: dense modern streets, historic districts, gardens, markets, railways, crafts, food alleys and seasonal places.',places:[
  {id:'kyoto-gion',name:'Gion & Higashiyama',city:'Kyoto',country:'Japan',realWorldLocation:'Gion & Higashiyama, Kyoto',purpose:'polite conversation, daily etiquette, food, directions and cultural context',landmarks:['Yasaka Shrine','Hanamikoji Street','Kiyomizu-dera area'],hiddenGems:['Philosopher’s Path','Kurama & Kibune','Ohara']},
  {id:'tokyo-shibuya',name:'Shibuya',city:'Tokyo',country:'Japan',realWorldLocation:'Shibuya, Tokyo',purpose:'fast everyday conversation, shopping, transport, listening and modern life',landmarks:['Shibuya Crossing','Hachikō area','Shibuya Station'],hiddenGems:['Daikanyama backstreets','Yanaka','Kagurazaka']},
  {id:'osaka-dotonbori',name:'Dōtonbori & Namba',city:'Osaka',country:'Japan',realWorldLocation:'Dōtonbori & Namba, Osaka',purpose:'food ordering, casual speech, humor, nightlife and social interaction',landmarks:['Dōtonbori canal','Glico sign area','Kuromon Market'],hiddenGems:['Hozenji Yokocho','Nakazakicho','Shinsekai side streets']},
  {id:'kanazawa',name:'Kanazawa',city:'Kanazawa',country:'Japan',realWorldLocation:'Kanazawa, Ishikawa',purpose:'markets, crafts, travel, hospitality and regional culture',landmarks:['Kenrokuen Garden','Higashi Chaya District','Ōmichō Market'],hiddenGems:['Kazuemachi Chaya District','Nagamachi samurai district','quiet craft workshops']},
  {id:'fukuoka-hakata',name:'Hakata & Fukuoka',city:'Fukuoka',country:'Japan',realWorldLocation:'Hakata and Fukuoka City',purpose:'food stalls, travel, casual conversation and regional life',landmarks:['Hakata Station','Nakasu riverside','yatai food stalls'],hiddenGems:['Yanagibashi market','Kawabata shopping street','quiet temple lanes']}
 ],culture:{greetings:['こんにちは','おはよう'],food:['お茶','おにぎり','屋台料理'],dailyLife:['commuting','shopping','seasonal festivals','neighborhood routines']}},
 es:{id:'es',languageCode:'es',languageName:'Spanish',worldName:'Spanish World',regionLabel:'Real Spanish-speaking places across different countries',visualIdentity:'No single generic Spanish world: Mediterranean streets, plazas, Mexico City neighborhoods, Andean cities, Caribbean coasts and Southern Cone urban life each feel different.',places:[
  {id:'seville',name:'Seville',city:'Seville',country:'Spain',realWorldLocation:'Seville, Andalusia',purpose:'social conversation, food, directions and everyday street life',landmarks:['Plaza de España','Triana','Santa Cruz'],hiddenGems:['Alameda de Hércules','Calle Betis','local neighborhood plazas']},
  {id:'barcelona',name:'Barcelona',city:'Barcelona',country:'Spain',realWorldLocation:'Barcelona, Catalonia',purpose:'urban conversation, travel, shopping and city navigation',landmarks:['Sagrada Família','Gothic Quarter','La Boqueria'],hiddenGems:['Gràcia','Poblenou','quiet modernist streets']},
  {id:'mexico-city',name:'Mexico City',city:'Mexico City',country:'Mexico',realWorldLocation:'Mexico City',purpose:'real Mexican Spanish, markets, transport and rich everyday conversation',landmarks:['Centro Histórico','Chapultepec','Coyoacán'],hiddenGems:['Roma Sur','San Ángel','neighborhood mercados']},
  {id:'medellin',name:'Medellín',city:'Medellín',country:'Colombia',realWorldLocation:'Medellín, Antioquia',purpose:'Colombian Spanish, transport, social interaction and modern city life',landmarks:['Plaza Botero','Comuna 13','Metro Cable'],hiddenGems:['Laureles','Envigado','local cafés and parks']},
  {id:'buenos-aires',name:'Buenos Aires',city:'Buenos Aires',country:'Argentina',realWorldLocation:'Buenos Aires',purpose:'Rioplatense Spanish, cafés, conversation, culture and everyday life',landmarks:['San Telmo','La Boca','Recoleta'],hiddenGems:['Villa Crespo','Chacarita','traditional cafés']}
 ],culture:{greetings:['hola','buenos días'],food:['pan','café','regional street food'],dailyLife:['markets','family meals','city festivals','neighborhood social life']}},
 fr:{id:'fr',languageCode:'fr',languageName:'French',worldName:'French World',regionLabel:'Real French places and fictional learning places across France',visualIdentity:'A living French language world: historic streets, river cities, markets, cafés, bakeries, coastal towns, railways and regional architecture.',places:[
  {id:'paris-montmartre',name:'Montmartre & Paris',city:'Paris',country:'France',realWorldLocation:'Montmartre and central Paris',purpose:'everyday French, cafés, transport, culture and dense urban interaction',landmarks:['Sacré-Cœur','Montmartre streets','Seine'],hiddenGems:['Canal Saint-Martin','Butte-aux-Cailles','small neighborhood markets']},
  {id:'lyon',name:'Lyon',city:'Lyon',country:'France',realWorldLocation:'Lyon',purpose:'food, city life, directions and regional French culture',landmarks:['Vieux Lyon','Fourvière','Presqu’île'],hiddenGems:['traboules','Croix-Rousse','riverside neighborhoods']},
  {id:'strasbourg',name:'Strasbourg',city:'Strasbourg',country:'France',realWorldLocation:'Strasbourg, Grand Est',purpose:'travel, markets, seasonal language and border-region culture',landmarks:['Grande Île','Petite France','Strasbourg Cathedral'],hiddenGems:['Krutenau','canal walks','quiet Alsatian streets']},
  {id:'nice',name:'Nice',city:'Nice',country:'France',realWorldLocation:'Nice, French Riviera',purpose:'coastal daily life, food, tourism and casual interaction',landmarks:['Promenade des Anglais','Old Town','Cours Saleya'],hiddenGems:['Cimiez','Libération market','port side streets']}
 ],culture:{greetings:['bonjour','bonsoir'],food:['pain','fromage','pâtisserie'],dailyLife:['cafés','markets','riverside evenings','regional traditions']}},
 ko:{id:'ko',languageCode:'ko',languageName:'Korean',worldName:'Korean World',regionLabel:'Real Korean cities and regions',visualIdentity:'Seoul neighborhoods, Busan coastline, historic cities, food streets, mountains, subways and modern night scenes with distinct regional identities.',places:[
  {id:'seoul-ikseondong',name:'Ikseon-dong & Seoul',city:'Seoul',country:'South Korea',realWorldLocation:'Ikseon-dong and central Seoul',purpose:'everyday Korean, cafés, shopping, subway navigation and social life',landmarks:['Ikseon-dong Hanok Village','Gyeongbokgung area','Seoul subway'],hiddenGems:['Seochon','Mangwon','Euljiro alleys']},
  {id:'busan',name:'Busan',city:'Busan',country:'South Korea',realWorldLocation:'Busan',purpose:'coastal life, food ordering, travel and casual conversation',landmarks:['Gamcheon Culture Village','Jagalchi Market','Haeundae'],hiddenGems:['Huinnyeoul','Jeonpo Café Street','Yeongdo']},
  {id:'jeonju',name:'Jeonju',city:'Jeonju',country:'South Korea',realWorldLocation:'Jeonju, North Jeolla',purpose:'food, heritage vocabulary, polite interaction and cultural life',landmarks:['Jeonju Hanok Village','Gyeonggijeon','Nambu Market'],hiddenGems:['quiet hanok lanes','local bibimbap streets','traditional workshops']},
  {id:'gangneung',name:'Gangneung',city:'Gangneung',country:'South Korea',realWorldLocation:'Gangneung, Gangwon',purpose:'nature, coastal travel, cafés and seasonal language',landmarks:['Gyeongpo Beach','Anmok Coffee Street','Ojukheon'],hiddenGems:['quiet beaches','pine forests','small local cafés']}
 ],culture:{greetings:['안녕하세요','좋은 아침'],food:['김밥','차','street food'],dailyLife:['subway travel','food streets','seasonal celebrations','neighborhood cafés']}}
};

function canonicalPlaces(worldId:'japanese'|'french'):WorldPlace[]{
 return getLanguageWorldLocations(worldId).map(location=>({
  id:worldId==='japanese'?legacyJapanesePlaceId(location.id):legacyFrenchPlaceId(location.id),
  name:location.name,
  city:location.city??location.country,
  country:location.country,
  realWorldLocation:[location.city,location.country].filter(Boolean).join(', '),
  purpose:location.description,
  landmarks:location.kind==='real'?['Real-world location']:['Fictional learning location'],
  hiddenGems:location.experiences.includes('quest')?['Contextual learning encounter']:[]
 }));
}
function legacyJapanesePlaceId(id:string){const map:Record<string,string>={'jp-tokyo-shibuya':'tokyo-shibuya','jp-tokyo-cafe':'tokyo-komorebi-cafe','jp-kyoto-gion':'kyoto-gion','jp-kyoto-whispering-garden':'kyoto-whispering-garden','jp-osaka-dotonbori':'osaka-dotonbori','jp-osaka-night-market':'osaka-lantern-market','jp-kanazawa':'kanazawa','jp-kanazawa-craft-house':'kanazawa-craft-house','jp-fukuoka-hakata':'fukuoka-hakata','jp-fukuoka-yatai-alley':'fukuoka-yatai-alley'};return map[id]??id;}
function legacyFrenchPlaceId(id:string){const map:Record<string,string>={'fr-paris-montmartre':'paris-montmartre','fr-paris-bakery':'paris-lune-bakery','fr-lyon-old-town':'lyon','fr-lyon-story-square':'lyon-story-square','fr-strasbourg':'strasbourg','fr-strasbourg-christmas-quarter':'strasbourg-market-quarter','fr-nice':'nice','fr-nice-promenade-studio':'nice-promenade-studio'};return map[id]??id;}

function materializeWorld(world:LanguageWorld):LanguageWorld{
 if(world.id==='ja')return{...world,worldName:'Japanese World',places:canonicalPlaces('japanese')};
 if(world.id==='fr')return{...world,worldName:'French World',places:canonicalPlaces('french')};
 return world;
}

export function resolveLanguageWorld(languageCode:string):LanguageWorld{const normalized=languageCode.toLowerCase().split('-')[0] as LanguageWorldId;return materializeWorld(WORLDS[normalized]??WORLDS.ja);}
export function getLanguageWorlds():LanguageWorld[]{return (Object.values(WORLDS) as LanguageWorld[]).map(materializeWorld);}
export const languageWorldEngine={resolve:resolveLanguageWorld,all:getLanguageWorlds};
