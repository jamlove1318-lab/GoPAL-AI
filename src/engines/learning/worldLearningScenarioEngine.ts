import type { LanguageWorldId } from '../world/languageWorldEngine';
import type { LearningSkill } from './contextualLanguageLearningEngine';

export type WorldLearningScenario={
 id:string; worldId:LanguageWorldId; placeId:string; title:string; scene:string;
 skill:LearningSkill; goal:string; targetLanguage:string; translation:string;
 vocabulary:{word:string;meaning:string;reading?:string}[];
 responseOptions:{text:string;meaning:string;correct:boolean}[];
 successWorldChange:string;
};

const SCENARIOS:WorldLearningScenario[]=[
 {id:'ja-market-first-purchase',worldId:'ja',placeId:'market',title:'A small purchase',scene:'A vendor at Tsuki Market holds up two rice balls and waits for your answer.',skill:'speaking',goal:'Ask for one item politely.',targetLanguage:'これをください。',translation:'This one, please.',vocabulary:[{word:'これ',meaning:'this'},{word:'ください',meaning:'please / give me'}],responseOptions:[{text:'これをください。',meaning:'This one, please.',correct:true},{text:'こんにちは。',meaning:'Hello.',correct:false},{text:'わかりません。',meaning:"I don't understand.",correct:false}],successWorldChange:'The vendor smiles and the market remembers your first successful purchase.'},
 {id:'es-cafe-order',worldId:'es',placeId:'cafe',title:'Order at the café',scene:'Morning light reaches Casa de Café. The barista asks what you would like.',skill:'speaking',goal:'Order a coffee politely.',targetLanguage:'Quiero un café, por favor.',translation:'I would like a coffee, please.',vocabulary:[{word:'quiero',meaning:'I want / I would like'},{word:'café',meaning:'coffee'},{word:'por favor',meaning:'please'}],responseOptions:[{text:'Quiero un café, por favor.',meaning:'I would like a coffee, please.',correct:true},{text:'Buenas noches.',meaning:'Good evening.',correct:false},{text:'No entiendo.',meaning:"I don't understand.",correct:false}],successWorldChange:'Your table becomes part of the morning café scene.'},
 {id:'fr-bakery-order',worldId:'fr',placeId:'bakery',title:'The morning bakery',scene:'Warm bread has just arrived at Boulangerie Matin. The baker asks what you want.',skill:'speaking',goal:'Ask for bread politely.',targetLanguage:'Je voudrais du pain, s’il vous plaît.',translation:'I would like some bread, please.',vocabulary:[{word:'je voudrais',meaning:'I would like'},{word:'pain',meaning:'bread'},{word:'s’il vous plaît',meaning:'please'}],responseOptions:[{text:'Je voudrais du pain, s’il vous plaît.',meaning:'I would like some bread, please.',correct:true},{text:'Au revoir.',meaning:'Goodbye.',correct:false},{text:'Je ne sais pas.',meaning:"I don't know.",correct:false}],successWorldChange:'The baker places fresh bread beside the counter.'},
 {id:'ko-food-order',worldId:'ko',placeId:'foodstreet',title:'Choose your food',scene:'A food-stall owner at Bada Food Street waits while steam rises from the grill.',skill:'speaking',goal:'Ask for kimbap politely.',targetLanguage:'김밥 주세요.',translation:'Kimbap, please.',vocabulary:[{word:'김밥',meaning:'kimbap'},{word:'주세요',meaning:'please give me'}],responseOptions:[{text:'김밥 주세요.',meaning:'Kimbap, please.',correct:true},{text:'안녕하세요.',meaning:'Hello.',correct:false},{text:'모르겠어요.',meaning:"I don't know.",correct:false}],successWorldChange:'The stall owner hands over your food and remembers you.'}
];

export function getWorldLearningScenarios(worldId:LanguageWorldId,placeId?:string){return SCENARIOS.filter(s=>s.worldId===worldId&&(!placeId||s.placeId===placeId));}
export function getWorldLearningScenario(worldId:LanguageWorldId,placeId:string){return getWorldLearningScenarios(worldId,placeId)[0]??null;}
export const worldLearningScenarioEngine={all:()=>SCENARIOS,forWorld:getWorldLearningScenarios,forPlace:getWorldLearningScenario};
