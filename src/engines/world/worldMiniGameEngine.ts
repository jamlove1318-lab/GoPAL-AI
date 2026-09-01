export type WorldMiniGameKind='word-hunt'|'phrase-builder'|'listening-chase'|'memory-match'|'politeness-duel'|'market-rush'|'dialogue-detective'|'grammar-garden'|'culture-clue'|'mystery-room'|'speed-round'|'story-choice';

export type WorldMiniGameDifficulty='gentle'|'playful'|'clever'|'wild';

export type WorldMiniGameDefinition={
 id:string;
 title:string;
 kind:WorldMiniGameKind;
 difficulty:WorldMiniGameDifficulty;
 description:string;
 skills:Array<'vocabulary'|'grammar'|'reading'|'listening'|'speaking'|'culture'|'recall'|'conversation'>;
 estimatedMinutes:number;
 residentRequired:boolean;
 repeatable:boolean;
 tags:string[];
};

export type WorldMiniGameSession={
 gameId:string;
 seed:number;
 score:number;
 streak:number;
 round:number;
 totalRounds:number;
 lives:number;
 status:'ready'|'playing'|'won'|'lost';
};

const games:WorldMiniGameDefinition[]=[
 {id:'word-hunt',title:'Word Hunt',kind:'word-hunt',difficulty:'gentle',description:'Spot useful target-language words hidden inside a living scene before time runs out.',skills:['vocabulary','reading','recall'],estimatedMinutes:3,residentRequired:false,repeatable:true,tags:['search','timed','exploration']},
 {id:'phrase-builder',title:'Phrase Builder',kind:'phrase-builder',difficulty:'playful',description:'Build a natural phrase by moving words into the right order.',skills:['grammar','reading','conversation'],estimatedMinutes:4,residentRequired:false,repeatable:true,tags:['builder','grammar','logic']},
 {id:'listening-chase',title:'Listening Chase',kind:'listening-chase',difficulty:'playful',description:'Follow audio clues through a location and catch the phrase that unlocks the next step.',skills:['listening','vocabulary','recall'],estimatedMinutes:4,residentRequired:false,repeatable:true,tags:['audio','exploration','timed']},
 {id:'memory-match',title:'Memory Match',kind:'memory-match',difficulty:'gentle',description:'Match words, meanings, sounds, and objects discovered around the world.',skills:['vocabulary','recall','reading'],estimatedMinutes:3,residentRequired:false,repeatable:true,tags:['memory','matching','objects']},
 {id:'politeness-duel',title:'Politeness Duel',kind:'politeness-duel',difficulty:'clever',description:'Choose the most natural level of politeness for fast-changing social situations.',skills:['conversation','culture','speaking'],estimatedMinutes:4,residentRequired:false,repeatable:true,tags:['social','culture','choices']},
 {id:'market-rush',title:'Market Rush',kind:'market-rush',difficulty:'wild',description:'Serve a stream of customers by understanding requests, prices, quantities, and reactions.',skills:['listening','vocabulary','conversation','culture'],estimatedMinutes:5,residentRequired:false,repeatable:true,tags:['arcade','timed','shopping']},
 {id:'dialogue-detective',title:'Dialogue Detective',kind:'dialogue-detective',difficulty:'clever',description:'Read or listen to a conversation and uncover what each person really means.',skills:['reading','listening','conversation','culture'],estimatedMinutes:5,residentRequired:false,repeatable:true,tags:['mystery','dialogue','inference']},
 {id:'grammar-garden',title:'Grammar Garden',kind:'grammar-garden',difficulty:'playful',description:'Repair sentences to help a magical garden grow and reveal new language.',skills:['grammar','reading','recall'],estimatedMinutes:4,residentRequired:false,repeatable:true,tags:['creative','grammar','world-change']},
 {id:'culture-clue',title:'Culture Clue',kind:'culture-clue',difficulty:'clever',description:'Investigate objects, signs, customs, and clues to discover how language works in context.',skills:['culture','reading','vocabulary'],estimatedMinutes:4,residentRequired:false,repeatable:true,tags:['culture','investigation','discovery']},
 {id:'mystery-room',title:'Mystery Room',kind:'mystery-room',difficulty:'wild',description:'Solve a chain of language puzzles to escape a strange fictional room.',skills:['grammar','vocabulary','reading','recall'],estimatedMinutes:7,residentRequired:false,repeatable:true,tags:['puzzle','story','fictional']},
 {id:'speed-round',title:'Speed Round',kind:'speed-round',difficulty:'wild',description:'A fast arcade round of tiny language decisions with escalating pressure.',skills:['vocabulary','grammar','listening','recall'],estimatedMinutes:2,residentRequired:false,repeatable:true,tags:['arcade','speed','replay']},
 {id:'story-choice',title:'Story Choice',kind:'story-choice',difficulty:'playful',description:'Shape a short branching story by making language choices that change what happens next.',skills:['reading','conversation','culture','vocabulary'],estimatedMinutes:6,residentRequired:false,repeatable:true,tags:['story','choices','consequences']},
];

function hashSeed(value:string){let hash=2166136261;for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619)}return hash>>>0}

export const worldMiniGameEngine={
 all():WorldMiniGameDefinition[]{return games.map(game=>({...game,skills:[...game.skills],tags:[...game.tags]}))},
 byId(id:string):WorldMiniGameDefinition|null{return games.find(game=>game.id===id)??null},
 byKind(kind:WorldMiniGameKind):WorldMiniGameDefinition[]{return games.filter(game=>game.kind===kind).map(game=>({...game,skills:[...game.skills],tags:[...game.tags]}))},
 recommend(skills:Array<WorldMiniGameDefinition['skills'][number]>,exclude:string[]=[]):WorldMiniGameDefinition[]{const excluded=new Set(exclude);return games.map(game=>({game,score:game.skills.filter(skill=>skills.includes(skill)).length})).filter(item=>!excluded.has(item.game.id)&&item.score>0).sort((a,b)=>b.score-a.score||a.game.estimatedMinutes-b.game.estimatedMinutes).map(item=>({...item.game,skills:[...item.game.skills],tags:[...item.game.tags]}))},
 createSession(gameId:string,contextKey:string,totalRounds=5):WorldMiniGameSession{const game=worldMiniGameEngine.byId(gameId);if(!game)throw new Error(`Unknown mini-game: ${gameId}`);return{gameId,seed:hashSeed(`${gameId}:${contextKey}`),score:0,streak:0,round:0,totalRounds:Math.max(1,totalRounds),lives:game.difficulty==='wild'?3:game.difficulty==='clever'?4:5,status:'ready'}},
 start(session:WorldMiniGameSession):WorldMiniGameSession{return session.status==='ready'?{...session,status:'playing'}:session},
 answer(session:WorldMiniGameSession,correct:boolean):WorldMiniGameSession{if(session.status!=='playing')return session;const nextRound=session.round+1;const nextStreak=correct?session.streak+1:0;const nextScore=correct?session.score+10+Math.min(session.streak,5)*2:session.score;const nextLives=correct?session.lives:Math.max(0,session.lives-1);const status=nextRound>=session.totalRounds?'won':nextLives===0?'lost':'playing';return{...session,round:nextRound,streak:nextStreak,score:nextScore,lives:nextLives,status}},
 reset(session:WorldMiniGameSession):WorldMiniGameSession{return worldMiniGameEngine.createSession(session.gameId,String(session.seed),session.totalRounds)},
};
