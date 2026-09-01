import type { LanguageWorldId } from './languageWorldEngine';
import { resolveDestinationExperience } from './destinationExperienceEngine';

export type DestinationResident={
 id:string; name:string; role:string; area:string; activity:string; mood:string; purpose:string; languageNeed:string; conversationHook:string;
};

const RESIDENTS:Record<string,DestinationResident[]>={
 'kyoto-gion':[
  {id:'kyoto-teahouse-owner',name:'Aiko',role:'Tea shop owner',area:'Gion & Higashiyama',activity:'preparing the first tea of the afternoon',mood:'calm',purpose:'hospitality',languageNeed:'polite ordering',conversationHook:'She asks whether you would like to try the seasonal tea.'},
  {id:'kyoto-walk-guide',name:'Haruto',role:'Neighborhood guide',area:'Gion & Higashiyama',activity:'checking a quiet side street',mood:'curious',purpose:'directions',languageNeed:'asking where something is',conversationHook:'He notices you looking at a map and offers a suggestion.'}
 ],
 'tokyo-shibuya':[
  {id:'tokyo-station-worker',name:'Mika',role:'Station attendant',area:'Shibuya',activity:'helping travelers find a platform',mood:'focused',purpose:'transport',languageNeed:'understanding directions',conversationHook:'She gives a quick direction and waits to see if you understood.'},
  {id:'tokyo-shop-clerk',name:'Ren',role:'Shop clerk',area:'Shibuya',activity:'restocking a small display',mood:'friendly',purpose:'shopping',languageNeed:'asking about an item',conversationHook:'You pick up an item and the clerk asks if you need help.'}
 ],
 'kanazawa':[
  {id:'kanazawa-artisan',name:'Yui',role:'Local artisan',area:'Ōmichō & Higashi Chaya',activity:'finishing a small craft',mood:'patient',purpose:'crafts',languageNeed:'asking about an object',conversationHook:'She notices your interest and explains what she is making.'},
  {id:'kanazawa-market-guide',name:'Daichi',role:'Market helper',area:'Ōmichō Market',activity:'checking a stall sign',mood:'helpful',purpose:'market',languageNeed:'reading and asking about food',conversationHook:'He points toward a stall and asks what you are looking for.'}
 ],
 'osaka-dotonbori':[
  {id:'osaka-street-vendor',name:'Kenji',role:'Street food vendor',area:'Dōtonbori',activity:'preparing the next takoyaki order',mood:'energetic',purpose:'food',languageNeed:'ordering food politely',conversationHook:'He calls out a friendly question while preparing a fresh order.'},
  {id:'osaka-canalside-helper',name:'Sora',role:'Local helper',area:'Dōtonbori Canal',activity:'pointing visitors toward the bridge',mood:'cheerful',purpose:'directions',languageNeed:'understanding and giving directions',conversationHook:'She notices you checking the canal map and offers a quick direction.'}
 ],
 'fukuoka-hakata':[
  {id:'fukuoka-stall-owner',name:'Mio',role:'Hakata food-stall owner',area:'Hakata',activity:'setting out the evening menu',mood:'warm',purpose:'food',languageNeed:'ordering at a food stall',conversationHook:'She asks what you would like while the evening stalls begin to open.'},
  {id:'fukuoka-market-guide',name:'Kaito',role:'Neighborhood guide',area:'Hakata',activity:'helping visitors find the canal walk',mood:'curious',purpose:'directions',languageNeed:'asking where a place is',conversationHook:'He sees you looking around and offers a simple direction.'}
 ],
 'mexico-city':[
  {id:'mexico-vendor',name:'Lucía',role:'Market vendor',area:'a neighborhood mercado',activity:'arranging fresh produce',mood:'welcoming',purpose:'market',languageNeed:'buying something',conversationHook:'She asks what you are looking for.'}
 ],
 'paris-montmartre':[
  {id:'paris-cafe-server',name:'Camille',role:'Café server',area:'Montmartre',activity:'serving the morning tables',mood:'warm',purpose:'café',languageNeed:'ordering politely',conversationHook:'She asks what you would like.'}
 ],
 'busan':[
  {id:'busan-market-seller',name:'Min-seo',role:'Market seller',area:'Jagalchi Market area',activity:'preparing the next order',mood:'energetic',purpose:'food',languageNeed:'ordering food',conversationHook:'She asks what you would like to try.'}
 ]
};

export function getDestinationResidents(worldId:LanguageWorldId,placeId:string):DestinationResident[]{
 const experience=resolveDestinationExperience(worldId,placeId);
 if(!experience)return[];
 return RESIDENTS[placeId]??[];
}

export function getDestinationResident(worldId:LanguageWorldId,placeId:string,residentId:string){return getDestinationResidents(worldId,placeId).find(resident=>resident.id===residentId)??null;}

export function chooseDestinationResident(worldId:LanguageWorldId,placeId:string):DestinationResident|null{
 const residents=getDestinationResidents(worldId,placeId);
 return residents.length?residents[Math.floor(Math.random()*residents.length)]!:null;
}

export const destinationResidentEngine={forPlace:getDestinationResidents,byId:getDestinationResident,choose:chooseDestinationResident};
