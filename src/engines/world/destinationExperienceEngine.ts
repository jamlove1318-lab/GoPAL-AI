import { LanguageWorldId, WorldPlace, resolveLanguageWorld } from './languageWorldEngine';

export type LocationType='neighborhood'|'market'|'cafe'|'station'|'landmark'|'garden'|'temple'|'coast'|'workshop'|'festival';

export interface WorldArea{
 id:string;
 name:string;
 destinationId:string;
 description:string;
 locationTypes:LocationType[];
 learningReasons:string[];
 discoverySeeds:string[];
}

export interface LearningMomentContext{
 worldId:LanguageWorldId;
 destination:WorldPlace;
 area:WorldArea;
 locationType:LocationType;
 situation:string;
 learningReasons:string[];
}

const AREAS:WorldArea[]=[
 {id:'kyoto-gion-higashiyama',name:'Gion & Higashiyama',destinationId:'kyoto-gion',description:'Historic Kyoto streets, shrines, small shops and everyday encounters.',locationTypes:['neighborhood','tea-shop' as LocationType,'temple','landmark'],learningReasons:['polite requests','etiquette','food vocabulary','asking directions'],discoverySeeds:['quiet side street','small tea shop','local craft shop']},
 {id:'tokyo-shibuya',name:'Shibuya',destinationId:'tokyo-shibuya',description:'A dense modern neighborhood where transport, shopping and fast conversation meet.',locationTypes:['neighborhood','station','cafe','market'],learningReasons:['fast listening','transport vocabulary','clarification','casual conversation'],discoverySeeds:['backstreet café','station platform','small record shop']},
 {id:'osaka-namba',name:'Dōtonbori & Namba',destinationId:'osaka-dotonbori',description:'Food streets, busy crossings and casual social interaction.',locationTypes:['neighborhood','market','cafe'],learningReasons:['casual speech','ordering food','humor','social phrases'],discoverySeeds:['tiny food counter','quiet alley','local market stall']},
 {id:'seville-triana',name:'Triana & central Seville',destinationId:'seville',description:'Neighborhood life, plazas, food and conversation in Andalusia.',locationTypes:['neighborhood','market','cafe','landmark'],learningReasons:['everyday conversation','directions','food vocabulary','social expressions'],discoverySeeds:['neighborhood plaza','small tapas counter','local market']},
 {id:'mexico-city-mercado',name:'Neighborhood mercado',destinationId:'mexico-city',description:'A living market environment for practical Mexican Spanish.',locationTypes:['market','neighborhood'],learningReasons:['buying things','numbers','polite requests','informal listening'],discoverySeeds:['family-run stall','local fruit stand','quiet market corner']},
 {id:'paris-montmartre',name:'Montmartre',destinationId:'paris-montmartre',description:'Dense historic streets, cafés, shops and everyday Parisian encounters.',locationTypes:['neighborhood','cafe','landmark'],learningReasons:['ordering','small talk','directions','natural French listening'],discoverySeeds:['neighborhood bakery','quiet square','small bookshop']},
 {id:'busan-jagalchi',name:'Jagalchi & port area',destinationId:'busan',description:'A coastal market district shaped by food, travel and port life.',locationTypes:['market','coast','neighborhood'],learningReasons:['food ordering','travel phrases','casual Korean','listening'],discoverySeeds:['market stall','harbor path','small seafood restaurant']},
 {id:'seoul-ikseondong',name:'Ikseon-dong',destinationId:'seoul-ikseondong',description:'Historic lanes meeting modern cafés and everyday Seoul life.',locationTypes:['neighborhood','cafe','landmark'],learningReasons:['polite Korean','ordering','navigation','social conversation'],discoverySeeds:['hanok café','small stationery shop','alley encounter']}
];

const SITUATIONS:Record<LocationType,string[]>= {
 neighborhood:['A resident starts a natural conversation.','You need to ask for help finding a nearby place.'],
 market:['You want to buy something and need to understand the seller.','A vendor asks a follow-up question you did not expect.'],
 cafe:['You need to order and respond to a simple question.','Someone nearby makes a casual comment and you decide whether to reply.'],
 station:['An announcement or direction question gives you a reason to listen carefully.','You need to confirm which platform or route to take.'],
 landmark:['A local person shares a detail about the place.','You discover something worth asking about rather than simply photographing it.'],
 garden:['The quiet setting creates space for observation and reflection.','A short conversation turns an observation into new vocabulary.'],
 temple:['You encounter a cultural practice and need to understand how to behave.','A local explains something and invites a question.'],
 coast:['You ask about a place, route or local activity.','A spontaneous conversation starts while exploring.'],
 workshop:['You learn by watching someone explain a craft or process.','You try something and need to understand the instructions.'],
 festival:['A seasonal event surrounds you with signs, sounds and conversations.','You need to understand a simple social interaction to participate.']
};

function findArea(destinationId:string,areaId?:string):WorldArea{
 const matches=AREAS.filter(area=>area.destinationId===destinationId);
 return matches.find(area=>area.id===areaId)||matches[0]||{
  id:`${destinationId}-center`,name:'Local area',destinationId,description:'Explore the destination through everyday life.',locationTypes:['neighborhood'],learningReasons:['everyday conversation'],discoverySeeds:['something unexpected']
 };
}

export function getDestinationAreas(destinationId:string):WorldArea[]{return AREAS.filter(area=>area.destinationId===destinationId);}

export function createLearningMoment(worldId:LanguageWorldId,placeId:string,areaId?:string,locationType?:LocationType):LearningMomentContext{
 const world=resolveLanguageWorld(worldId);
 const destination=world.places.find(place=>place.id===placeId)||world.places[0];
 if(!destination)throw new Error(`Unknown destination: ${placeId}`);
 const area=findArea(destination.id,areaId);
 const type=locationType&&area.locationTypes.includes(locationType)?locationType:area.locationTypes[0];
 const situations=SITUATIONS[type]||SITUATIONS.neighborhood;
 return {worldId,destination,area,locationType:type,situation:situations[0],learningReasons:area.learningReasons};
}

export const destinationExperienceEngine={getAreas:getDestinationAreas,createMoment:createLearningMoment};
