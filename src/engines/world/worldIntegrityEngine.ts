import { getWorldPlaceHotspots } from '../../features/learning/components/worldPlaceHotspotCatalog';
import { worldLearningScenarioEngine } from '../learning/worldLearningScenarioEngine';
import { languageWorldEngine, type LanguageWorldId } from './languageWorldEngine';

export type WorldIntegrityIssue={code:'DUPLICATE_HOTSPOT'|'BROKEN_NEXT'|'BROKEN_SCENARIO'|'BROKEN_PLACE'|'EMPTY_ACTIVITY';worldId:string;placeId:string;hotspotId?:string;message:string};
export type WorldIntegrityReport={ok:boolean;checkedWorlds:number;checkedPlaces:number;checkedHotspots:number;checkedScenarios:number;issues:WorldIntegrityIssue[]};

export function auditWorldIntegrity():WorldIntegrityReport{
 const issues:WorldIntegrityIssue[]=[];let checkedPlaces=0,checkedHotspots=0;
 for(const world of languageWorldEngine.all()){
  for(const place of world.places){checkedPlaces++;const hotspots=getWorldPlaceHotspots(place.id);const ids=new Set<string>();
   for(const hotspot of hotspots){checkedHotspots++;if(ids.has(hotspot.id))issues.push({code:'DUPLICATE_HOTSPOT',worldId:world.id,placeId:place.id,hotspotId:hotspot.id,message:`Duplicate hotspot id '${hotspot.id}'`});ids.add(hotspot.id);
    if(hotspot.nextHotspotId&&!hotspots.some(item=>item.id===hotspot.nextHotspotId))issues.push({code:'BROKEN_NEXT',worldId:world.id,placeId:place.id,hotspotId:hotspot.id,message:`nextHotspotId '${hotspot.nextHotspotId}' does not exist in this place`});
    for(const scenarioId of hotspot.scenarioIds??[])if(!worldLearningScenarioEngine.byId(scenarioId))issues.push({code:'BROKEN_SCENARIO',worldId:world.id,placeId:place.id,hotspotId:hotspot.id,message:`scenarioId '${scenarioId}' does not exist`});
    if(['quiz','quest','challenge','special'].includes(hotspot.kind)&&(!hotspot.scenarioIds||hotspot.scenarioIds.length===0))issues.push({code:'EMPTY_ACTIVITY',worldId:world.id,placeId:place.id,hotspotId:hotspot.id,message:`Activity hotspot '${hotspot.id}' has no learning scenario`});
   }
  }
 }
 for(const scenario of worldLearningScenarioEngine.all()){const world=languageWorldEngine.resolve(scenario.worldId as LanguageWorldId);if(!world.places.some(place=>place.id===scenario.placeId))issues.push({code:'BROKEN_PLACE',worldId:scenario.worldId,placeId:scenario.placeId,message:`Scenario '${scenario.id}' references a missing place`});}
 return{ok:issues.length===0,checkedWorlds:languageWorldEngine.all().length,checkedPlaces,checkedHotspots,checkedScenarios:worldLearningScenarioEngine.all().length,issues};
}
export const worldIntegrityEngine={audit:auditWorldIntegrity};
