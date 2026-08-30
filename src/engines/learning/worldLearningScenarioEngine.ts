import type { LanguageWorldId } from '../world/languageWorldEngine';
import type { LearningSkill } from './contextualLanguageLearningEngine';

export type WorldLearningScenario={
 id:string;
 worldId:LanguageWorldId;
 placeId:string;
 area:string;
 locationType:string;
 title:string;
 scene:string;
 skill:LearningSkill;
 goal:string;
 targetLanguage:string;
 translation:string;
 vocabulary:{word:string;meaning:string;reading?:string}[];
 responseOptions:{text:string;meaning:string;correct:boolean}[];
 successWorldChange:string;
};

const SCENARIOS:WorldLearningScenario[]=[
 {
  id:'ja-kyoto-tea-order',worldId:'ja',placeId:'kyoto-gion',area:'Gion & Higashiyama',locationType:'small tea shop',title:'Tea in Gion',
  scene:'Inside a small tea shop in Gion, the owner sets out several teas and waits for your order. The room is quiet, and a polite response matters.',skill:'speaking',goal:'Order one tea politely.',targetLanguage:'これをください。',translation:'This one, please.',
  vocabulary:[{word:'これ',meaning:'this'},{word:'ください',meaning:'please / give me'}],
  responseOptions:[{text:'これをください。',meaning:'This one, please.',correct:true},{text:'こんにちは。',meaning:'Hello.',correct:false},{text:'わかりません。',meaning:"I don't understand.",correct:false}],
  successWorldChange:'The owner nods warmly and pours your tea. The shop now feels a little less unfamiliar.'
 },
 {
  id:'es-mexico-market-purchase',worldId:'es',placeId:'mexico-city',area:'a neighborhood mercado',locationType:'market stall',title:'A small purchase in the mercado',
  scene:'A vendor in a neighborhood market asks what you would like. You recognize the item you want and need to answer naturally.',skill:'speaking',goal:'Ask for one item politely.',targetLanguage:'Quiero esto, por favor.',translation:'I would like this, please.',
  vocabulary:[{word:'quiero',meaning:'I want / I would like'},{word:'esto',meaning:'this'},{word:'por favor',meaning:'please'}],
  responseOptions:[{text:'Quiero esto, por favor.',meaning:'I would like this, please.',correct:true},{text:'Buenas noches.',meaning:'Good evening.',correct:false},{text:'No entiendo.',meaning:"I don't understand.",correct:false}],
  successWorldChange:'The vendor hands you the item, and the market becomes part of your remembered route through the neighborhood.'
 },
 {
  id:'fr-paris-cafe-order',worldId:'fr',placeId:'paris-montmartre',area:'Montmartre',locationType:'neighborhood café',title:'Morning in Montmartre',
  scene:'At a small Montmartre café, the server comes to your table and asks what you would like. The conversation is brief, but it is happening now.',skill:'speaking',goal:'Order a coffee politely.',targetLanguage:'Je voudrais un café, s’il vous plaît.',translation:'I would like a coffee, please.',
  vocabulary:[{word:'je voudrais',meaning:'I would like'},{word:'café',meaning:'coffee'},{word:'s’il vous plaît',meaning:'please'}],
  responseOptions:[{text:'Je voudrais un café, s’il vous plaît.',meaning:'I would like a coffee, please.',correct:true},{text:'Au revoir.',meaning:'Goodbye.',correct:false},{text:'Je ne sais pas.',meaning:"I don't know.",correct:false}],
  successWorldChange:'The server brings your coffee, and the café becomes somewhere you know how to enter with language.'
 },
 {
  id:'ko-busan-market-order',worldId:'ko',placeId:'busan',area:'Jagalchi Market area',locationType:'food stall',title:'Choose your food in Busan',
  scene:'Near Jagalchi Market, a food-stall owner is ready to take your order while the market moves around you.',skill:'speaking',goal:'Ask for kimbap politely.',targetLanguage:'김밥 주세요.',translation:'Kimbap, please.',
  vocabulary:[{word:'김밥',meaning:'kimbap'},{word:'주세요',meaning:'please give me'}],
  responseOptions:[{text:'김밥 주세요.',meaning:'Kimbap, please.',correct:true},{text:'안녕하세요.',meaning:'Hello.',correct:false},{text:'모르겠어요.',meaning:"I don't know.",correct:false}],
  successWorldChange:'The owner hands over your food, and you leave with one more real interaction that you can now handle.'
 }
];

export function getWorldLearningScenarios(worldId:LanguageWorldId,placeId?:string){return SCENARIOS.filter(s=>s.worldId===worldId&&(!placeId||s.placeId===placeId));}
export function getWorldLearningScenario(worldId:LanguageWorldId,placeId:string){return getWorldLearningScenarios(worldId,placeId)[0]??null;}
export function getWorldLearningScenarioById(id:string){return SCENARIOS.find(s=>s.id===id)??null;}
export const worldLearningScenarioEngine={all:()=>SCENARIOS,forWorld:getWorldLearningScenarios,forPlace:getWorldLearningScenario,byId:getWorldLearningScenarioById};
