import type {LanguageWorld} from '../world/languageWorldEngine';
import { worldLearningScenarioEngine } from './worldLearningScenarioEngine';

export type LearningSkill='vocabulary'|'listening'|'speaking'|'reading'|'grammar'|'writing';
export type ContextualLearningMoment={
 id:string;
 worldId:string;
 placeId:string;
 destination:string;
 city:string;
 country:string;
 area?:string;
 locationType?:string;
 title:string;
 skill:LearningSkill;
 goal:string;
 language:string;
 prompt:string;
 targetPatterns:string[];
 successMeaning:string;
 scenarioId?:string;
 scene?:string;
 targetLanguage?:string;
 translation?:string;
 vocabulary?:{word:string;meaning:string;reading?:string}[];
 responseOptions?:{text:string;meaning:string;correct:boolean}[];
};

export function buildContextualMoment(world:LanguageWorld,placeId:string,skill:LearningSkill='speaking'):ContextualLearningMoment{
 const place=world.places.find(item=>item.id===placeId)??world.places[0];
 const scenario=worldLearningScenarioEngine.forPlace(world.id,place.id);
 const base={worldId:world.id,placeId:place.id,destination:place.name,city:place.city,country:place.country};
 if(scenario&&scenario.skill===skill){
  return {...base,id:`moment:${scenario.id}`,area:scenario.area,locationType:scenario.locationType,title:scenario.title,skill,goal:scenario.goal,language:world.languageName,prompt:scenario.scene,targetPatterns:[scenario.targetLanguage],successMeaning:scenario.successWorldChange,scenarioId:scenario.id,scene:scenario.scene,targetLanguage:scenario.targetLanguage,translation:scenario.translation,vocabulary:scenario.vocabulary,responseOptions:scenario.responseOptions};
 }
 const seed=`${world.id}:${place.id}:${skill}`;
 const language=world.languageName;
 const promptBySkill:Record<LearningSkill,string>={
  vocabulary:`Look around ${place.name} in ${place.city}. Learn the words you need before interacting with the place.`,
  listening:`Listen to what is happening in ${place.name} and identify the important words and intent.`,
  speaking:`Respond naturally to someone in ${place.name}. Say something useful for this destination, not a random isolated sentence.`,
  reading:`Read a sign, note, menu or message you might genuinely encounter in ${place.name} and understand what it means.`,
  grammar:`Notice a pattern being used in ${place.name}, then use that pattern in your own response.`,
  writing:`Write a short message that would genuinely make sense in the current situation in ${place.name}.`
 };
 return {...base,id:`moment:${seed}`,title:`${place.name}: ${place.purpose}`,skill,goal:`Use ${language} to do something meaningful in ${place.realWorldLocation}.`,language,prompt:promptBySkill[skill],targetPatterns:world.culture.greetings.slice(0,1),successMeaning:`You can now use this language knowledge naturally in a similar situation.`};
}

export function nextLearningSkill(completed:LearningSkill[]):LearningSkill{const order:LearningSkill[]=['vocabulary','listening','speaking','reading','grammar','writing'];return order.find(skill=>!completed.includes(skill))??'speaking';}
export const contextualLanguageLearningEngine={buildMoment:buildContextualMoment,nextSkill:nextLearningSkill};
