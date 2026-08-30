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
