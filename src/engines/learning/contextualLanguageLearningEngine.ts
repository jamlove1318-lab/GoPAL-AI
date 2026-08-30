import type {LanguageWorld} from '../world/languageWorldEngine';

export type LearningSkill='vocabulary'|'listening'|'speaking'|'reading'|'grammar'|'writing';
export type ContextualLearningMoment={id:string;worldId:string;placeId:string;title:string;skill:LearningSkill;goal:string;language:string;prompt:string;targetPatterns:string[];successMeaning:string;};

export function buildContextualMoment(world:LanguageWorld,placeId:string,skill:LearningSkill='speaking'):ContextualLearningMoment{const place=world.places.find(item=>item.id===placeId)??world.places[0];const seed=`${world.id}:${place.id}:${skill}`;const language=world.languageName;const promptBySkill:Record<LearningSkill,string>={
 vocabulary:`Look around ${place.name}. Learn the words you need before interacting with the place.`,
 listening:`Listen to what is happening at ${place.name} and identify the important words and intent.`,
 speaking:`Respond naturally to someone at ${place.name}. Say something useful, not a random isolated sentence.`,
 reading:`Read a sign, note, menu or message found at ${place.name} and understand what it means.`,
 grammar:`Notice a pattern being used at ${place.name}, then use that pattern in your own response.`,
 writing:`Write a short message that would genuinely make sense in the current situation at ${place.name}.`
};
return{id:`moment:${seed}`,worldId:world.id,placeId:place.id,title:`${place.name}: ${place.purpose}`,skill,goal:`Use ${language} to do something meaningful in this place.`,language,prompt:promptBySkill[skill],targetPatterns:world.culture.greetings.slice(0,1),successMeaning:`You can now use this language knowledge naturally in a similar situation.`};}

export function nextLearningSkill(completed:LearningSkill[]):LearningSkill{const order:LearningSkill[]=['vocabulary','listening','speaking','reading','grammar','writing'];return order.find(skill=>!completed.includes(skill))??'speaking';}

export const contextualLanguageLearningEngine={buildMoment:buildContextualMoment,nextSkill:nextLearningSkill};
