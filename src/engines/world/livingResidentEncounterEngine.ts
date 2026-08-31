import type { LanguageWorldId } from './languageWorldEngine';
import { getDestinationResident, type DestinationResident } from './destinationResidentEngine';

export type ResidentMotion='idle'|'listening'|'speaking'|'thinking'|'laughing'|'gesturing'|'working'|'surprised'|'warm';
export type EncounterAtmosphere='calm'|'busy'|'warm'|'energetic'|'quiet'|'seasonal';

export type LivingResidentEncounter={
 id:string;
 worldId:LanguageWorldId;
 placeId:string;
 resident:DestinationResident;
 backgroundKey:string;
 atmosphere:EncounterAtmosphere;
 camera:'face-to-face'|'slightly-wide';
 motion:ResidentMotion;
 canAnimate:true;
 canReact:true;
 canContinue:true;
 instruction:'The resident is physically present in the scene. Render the character, not a static portrait.';
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

function atmosphereFor(resident:DestinationResident):EncounterAtmosphere {
 const mood=resident.mood.toLowerCase();
 if(mood.includes('energetic'))return 'energetic';
 if(mood.includes('busy'))return 'busy';
 if(mood.includes('warm')||mood.includes('welcoming'))return 'warm';
 if(mood.includes('quiet')||mood.includes('calm'))return 'calm';
 return 'seasonal';
}

export function createLivingResidentEncounter(worldId:LanguageWorldId,placeId:string,residentId:string):LivingResidentEncounter|null{
 const resident=getDestinationResident(worldId,placeId,residentId);
 if(!resident)return null;
 return {id:`${placeId}:encounter:${resident.id}`,worldId,placeId,resident,backgroundKey:backgroundByPlace[placeId]??`${placeId}-environment`,atmosphere:atmosphereFor(resident),camera:'face-to-face',motion:'warm',canAnimate:true,canReact:true,canContinue:true,instruction:'The resident is physically present in the scene. Render the character, not a static portrait.'};
}

export const livingResidentEncounterEngine={create:createLivingResidentEncounter};
