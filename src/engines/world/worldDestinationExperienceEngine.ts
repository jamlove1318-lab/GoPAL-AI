import { LanguageWorldId, WorldPlace, resolveLanguageWorld } from './languageWorldEngine';
import { getWorldLearningScenarios, WorldLearningScenario } from '../learning/worldLearningScenarioEngine';

export type DestinationExperience={
 worldId:LanguageWorldId;
 worldName:string;
 destination:WorldPlace;
 atmosphere:string;
 visiblePlaces:string[];
 discoveries:string[];
 learningMoments:WorldLearningScenario[];
 nextSuggestion:string;
};

const ATMOSPHERES:Record<string,string>={
 'kyoto-gion':'Historic lanes, quiet gardens, small shops and the changing rhythm of Gion and Higashiyama.',
 'tokyo-shibuya':'Fast streets, rail announcements, crossings, shops and dense modern city life.',
 'osaka-dotonbori':'Bright food streets, lively conversation, crowded lanes and Osaka’s energetic social rhythm.',
 kanazawa:'Gardens, craft traditions, markets and quieter historic neighborhoods.',
 'fukuoka-hakata':'Rail travel, riverside streets, food stalls and relaxed everyday city life.',
 seville:'Warm plazas, neighborhood streets, food, conversation and Andalusian city rhythms.',
 barcelona:'Dense urban streets, markets, neighborhoods and the layered culture of Barcelona.',
 'mexico-city':'Busy neighborhoods, markets, public spaces, transport and everyday Mexican Spanish.',
 medellin:'Mountain city life, public transit, cafés, parks and Colombian everyday conversation.',
 'buenos-aires':'Cafés, neighborhood streets, social conversation and the distinctive rhythm of Buenos Aires.',
 'paris-montmartre':'Hillside streets, cafés, artists, markets and dense Parisian neighborhood life.',
 lyon:'Rivers, food, old passages and everyday interactions across a major French city.',
 strasbourg:'Canals, markets, historic streets and a distinctive border-region atmosphere.',
 nice:'Mediterranean streets, markets, coastline and relaxed everyday interactions.',
 'seoul-ikseondong':'Hanok alleys, cafés, subway journeys and the constant motion of central Seoul.',
 busan:'Harbor life, markets, coastline, food stalls and a slower rhythm beside the sea.',
 jeonju:'Hanok streets, food, crafts and heritage woven into everyday life.',
 gangneung:'Coast, pine landscapes, cafés and seasonal life on Korea’s east side.'
};

function unique(values:string[]){return [...new Set(values)].filter(Boolean);}

export function getDestinationExperience(worldId:LanguageWorldId,placeId:string):DestinationExperience|null{
 const world=resolveLanguageWorld(worldId);
 const destination=world.places.find(place=>place.id===placeId);
 if(!destination)return null;
 const learningMoments=getWorldLearningScenarios(worldId,placeId);
 const visiblePlaces=unique(destination.landmarks);
 const discoveries=unique(destination.hiddenGems);
 return{
  worldId:world.id,
  worldName:world.worldName,
  destination,
  atmosphere:ATMOSPHERES[destination.id]??world.visualIdentity,
  visiblePlaces,
  discoveries,
  learningMoments,
  nextSuggestion:learningMoments[0]?.followUp??`Wander beyond the obvious. Look for something local in ${destination.name}.`
 };
}

export function getDestinationExperiences(worldId:LanguageWorldId){
 const world=resolveLanguageWorld(worldId);
 return world.places.map(place=>getDestinationExperience(worldId,place.id)).filter((value):value is DestinationExperience=>Boolean(value));
}

export const worldDestinationExperienceEngine={forDestination:getDestinationExperience,forWorld:getDestinationExperiences};
