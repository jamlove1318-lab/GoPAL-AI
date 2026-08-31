import type { LanguageWorldId } from './languageWorldEngine';
import type { EncounterAtmosphere } from './livingResidentEncounterEngine';

export type ArrivalShot='establishing'|'wide-environment'|'weather-detail'|'life-detail'|'resident-reveal';
export type ArrivalScene={
 id:string;
 worldId:LanguageWorldId;
 placeId:string;
 backgroundKey:string;
 atmosphere:EncounterAtmosphere;
 shots:ArrivalShot[];
 durationMs:number;
 weatherContinues:true;
 environmentContinues:true;
 residentsEnterAfterArrival:true;
 transition:'cinematic-to-encounter';
};

const backgroundByPlace:Record<string,string>={
 'kyoto-gion':'kyoto-gion-teahouse',
 'tokyo-shibuya':'tokyo-shibuya-station',
 'kanazawa':'kanazawa-omicho-market',
 'fukuoka-hakata':'fukuoka-hakata-street',
 'mexico-city':'mexico-city-mercado',
 'paris-montmartre':'paris-montmartre-cafe',
 'busan':'busan-jagalchi-market',
 'seoul':'seoul-ikseondong',
};

const atmosphereByPlace:Record<string,EncounterAtmosphere>={
 'tokyo-shibuya':'energetic',
 'kanazawa':'busy',
 'kyoto-gion':'calm',
 'fukuoka-hakata':'warm',
 'mexico-city':'energetic',
 'paris-montmartre':'warm',
 'busan':'busy',
 'seoul':'energetic',
};

export function createDestinationArrivalScene(worldId:LanguageWorldId,placeId:string):ArrivalScene {
 return {
  id:`${placeId}:arrival`,
  worldId,
  placeId,
  backgroundKey:backgroundByPlace[placeId]??`${placeId}-environment`,
  atmosphere:atmosphereByPlace[placeId]??'seasonal',
  shots:['establishing','wide-environment','weather-detail','life-detail','resident-reveal'],
  durationMs:6500,
  weatherContinues:true,
  environmentContinues:true,
  residentsEnterAfterArrival:true,
  transition:'cinematic-to-encounter',
 };
}

export const destinationArrivalSceneEngine={create:createDestinationArrivalScene};
