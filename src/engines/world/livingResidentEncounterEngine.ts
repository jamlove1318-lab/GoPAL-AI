import type { LanguageWorldId } from './languageWorldEngine';
import { getDestinationResident, type DestinationResident } from './destinationResidentEngine';
import { offlineResidentBehaviorEngine, type OfflineResidentMoment, type OfflineResidentProfile } from './offlineResidentBehaviorEngine';

export type ResidentMotion='idle'|'listening'|'speaking'|'thinking'|'laughing'|'gesturing'|'working'|'surprised'|'warm';
export type EncounterAtmosphere='calm'|'busy'|'warm'|'energetic'|'quiet'|'seasonal';
export type EncounterTrigger='enter'|'learner-spoke'|'learner-typed'|'idle'|'success'|'confusion'|'goodbye';

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

export type LivingResidentSceneState={
 encounter:LivingResidentEncounter;
 moment:OfflineResidentMoment;
 mode:'offline'|'online'|'ai-enhanced';
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

function defaultProfile(resident:DestinationResident):OfflineResidentProfile {
 const mood=resident.mood.toLowerCase();
 return {id:resident.id,warmth:mood.includes('warm')||mood.includes('welcoming')?0.8:0.55,curiosity:0.65,expressiveness:0.7};
}

export function createOfflineResidentSceneState(encounter:LivingResidentEncounter,trigger:EncounterTrigger='enter',profile?:OfflineResidentProfile):LivingResidentSceneState {
 const residentProfile=profile??defaultProfile(encounter.resident);
 return {encounter,moment:offlineResidentBehaviorEngine.plan(encounter,residentProfile,trigger),mode:'offline'};
}

export function advanceOfflineResidentScene(encounter:LivingResidentEncounter,trigger:EncounterTrigger,profile?:OfflineResidentProfile):LivingResidentSceneState {
 return createOfflineResidentSceneState(encounter,trigger,profile);
}

export const livingResidentEncounterEngine={create:createLivingResidentEncounter,createOfflineState:createOfflineResidentSceneState,advanceOffline:advanceOfflineResidentScene};
