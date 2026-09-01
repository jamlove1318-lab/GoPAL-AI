export type WorldMiniGameKind='word-hunt'|'object-snap'|'sign-spotter'|'hidden-phrase'|'culture-clue-hunt'|'memory-trail'|'lost-label'|'sound-scout'|'phrase-builder'|'grammar-garden'|'sentence-machine'|'particle-puzzle'|'verb-workshop'|'word-forge'|'kanji-tile-forge'|'translation-tangle'|'context-lock'|'logic-lanterns'|'speed-round'|'falling-words'|'word-dash'|'listening-chase'|'quick-reply'|'flash-recall'|'match-rush'|'sound-catcher'|'grammar-dodge'|'vocabulary-meteor'|'politeness-duel'|'dialogue-detective'|'market-rush'|'cafe-order'|'train-counter'|'neighbor-favor'|'lost-tourist'|'message-relay'|'emotion-reader'|'conversation-repair'|'echo-station'|'audio-map'|'voice-match'|'missing-word-radio'|'street-noise'|'rhythm-repeat'|'announcement-alert'|'whisper-trail'|'mystery-room'|'story-choice'|'detective-case'|'treasure-map'|'festival-prep'|'time-traveler'|'dream-theatre'|'secret-agent'|'escape-the-archive'|'lantern-mystery'|'sign-designer'|'story-composer'|'recipe-creator'|'world-builder';

export type WorldMiniGameDifficulty='gentle'|'playful'|'clever'|'wild';
export type WorldMiniGameFamily='discovery'|'puzzle'|'arcade'|'social'|'listening'|'adventure'|'creative';
export type WorldMiniGameDefinition={id:string;title:string;kind:WorldMiniGameKind;family:WorldMiniGameFamily;difficulty:WorldMiniGameDifficulty;description:string;skills:Array<'vocabulary'|'grammar'|'reading'|'listening'|'speaking'|'culture'|'recall'|'conversation'|'navigation'|'writing'|'kanji'|'translation'|'verbs'|'memory'|'word-building'|'creative'|'mixed'>;estimatedMinutes:number;residentRequired:boolean;repeatable:boolean;tags:string[];repeatCooldown:number};

const g=(id:WorldMiniGameKind,title:string,kind:WorldMiniGameKind,family:WorldMiniGameFamily,difficulty:WorldMiniGameDifficulty,description:string,skills:WorldMiniGameDefinition['skills'],estimatedMinutes:number,tags:string[],repeatCooldown=8):WorldMiniGameDefinition=>({id,title,kind,family,difficulty,description,skills,estimatedMinutes,residentRequired:false,repeatable:true,tags,repeatCooldown});

const games:WorldMiniGameDefinition[]=[
 g('word-hunt','Word Hunt','word-hunt','discovery','gentle','Spot useful target-language words hidden inside a living scene before time runs out.',['vocabulary','reading','recall'],3,['search','timed','exploration']),
 g('object-snap','Object Snap','object-snap','discovery','playful','Identify moving objects and snap the correct target-language word to each one.',['vocabulary','recall'],3,['objects','reflex']),
 g('sign-spotter','Sign Spotter','sign-spotter','discovery','gentle','Read signs around a location and choose what they mean in context.',['reading','vocabulary'],4,['signs','exploration']),
 g('hidden-phrase','Hidden Phrase','hidden-phrase','discovery','clever','Find phrase fragments hidden around the environment and reconstruct their meaning.',['reading','vocabulary'],4,['search','phrases']),
 g('culture-clue-hunt','Culture Clue Hunt','culture-clue-hunt','discovery','clever','Investigate objects and customs to uncover language clues.',['culture','reading'],5,['culture','investigation']),
 g('memory-trail','Memory Trail','memory-trail','discovery','playful','Remember where words were discovered and retrace the correct sequence.',['vocabulary','memory','recall'],4,['memory','map']),
 g('lost-label','Lost Label','lost-label','discovery','gentle','Restore missing labels to objects in the world.',['vocabulary','reading'],3,['objects','repair']),
 g('sound-scout','Sound Scout','sound-scout','discovery','mysterious','Locate the source of a spoken clue in the environment.',['listening','recall'],4,['audio','search']),
 g('phrase-builder','Phrase Builder','phrase-builder','puzzle','playful','Build a natural phrase by arranging language pieces.',['grammar','reading','conversation'],4,['builder','grammar']),
 g('grammar-garden','Grammar Garden','grammar-garden','puzzle','playful','Repair sentences to help a magical garden grow.',['grammar','reading','recall'],4,['creative','world-change']),
 g('sentence-machine','Sentence Machine','sentence-machine','puzzle','clever','Feed words into a machine in the correct grammatical order.',['grammar','writing'],4,['logic','grammar']),
 g('particle-puzzle','Particle Puzzle','particle-puzzle','puzzle','clever','Choose and place the particle that makes each sentence natural.',['grammar'],4,['grammar','precision']),
 g('verb-workshop','Verb Workshop','verb-workshop','puzzle','playful','Transform verbs to match time, intent and situation.',['grammar','verbs'],5,['verbs','construction']),
 g('word-forge','Word Forge','word-forge','puzzle','creative','Forge valid words from reusable language pieces.',['vocabulary','word-building'],4,['word-building','craft']),
 g('kanji-tile-forge','Kanji Tile Forge','kanji-tile-forge','puzzle','clever','Assemble and read kanji compounds from tiles.',['kanji','reading'],5,['kanji','tiles']),
 g('translation-tangle','Translation Tangle','translation-tangle','puzzle','playful','Untangle a mixed translation and restore the intended meaning.',['translation','reading'],4,['translation','logic']),
 g('context-lock','Context Lock','context-lock','puzzle','clever','Use contextual language clues to unlock a fictional location.',['reading','grammar'],5,['mystery','context']),
 g('logic-lanterns','Logic Lanterns','logic-lanterns','puzzle','clever','Light lanterns in the correct language sequence to reveal a hidden message.',['grammar','reading'],5,['logic','mystery']),
 g('speed-round','Speed Round','speed-round','arcade','wild','A rapid arcade round of escalating language decisions.',['vocabulary','grammar','listening','recall'],2,['arcade','speed'],10),
 g('falling-words','Falling Words','falling-words','arcade','wild','Catch correct words while avoiding misleading ones.',['vocabulary'],3,['arcade','reflex'],10),
 g('word-dash','Word Dash','word-dash','arcade','wild','Choose the correct lane while language clues race toward you.',['vocabulary','reading'],3,['arcade','movement'],10),
 g('listening-chase','Listening Chase','listening-chase','arcade','playful','Follow audio clues through a location and catch the phrase that unlocks the next step.',['listening','vocabulary','recall'],4,['audio','exploration']),
 g('quick-reply','Quick Reply','quick-reply','arcade','wild','Select the most natural conversational reply before the moment passes.',['speaking','conversation'],3,['social','speed']),
 g('flash-recall','Flash Recall','flash-recall','arcade','wild','Rapidly recall meaning from changing visual cues.',['vocabulary','memory'],2,['recall','speed']),
 g('match-rush','Match Rush','match-rush','arcade','playful','Pair words, meanings, sounds and objects under pressure.',['vocabulary','recall'],3,['matching','timed']),
 g('sound-catcher','Sound Catcher','sound-catcher','arcade','playful','Catch the spoken word matching the target.',['listening','vocabulary'],3,['audio','reflex']),
 g('grammar-dodge','Grammar Dodge','grammar-dodge','arcade','wild','Dodge incorrect sentence obstacles and follow correct grammar.',['grammar'],3,['grammar','arcade']),
 g('vocabulary-meteor','Vocabulary Meteor','vocabulary-meteor','arcade','wild','Defend a location by selecting the correct meaning as meteors fall.',['vocabulary','recall'],3,['arcade','action']),
 g('politeness-duel','Politeness Duel','politeness-duel','social','clever','Choose the natural level of politeness for changing social situations.',['conversation','culture','speaking'],4,['social','culture']),
 g('dialogue-detective','Dialogue Detective','dialogue-detective','social','clever','Infer what people mean from their dialogue and context.',['reading','listening','conversation','culture'],5,['mystery','dialogue']),
 g('market-rush','Market Rush','market-rush','social','wild','Handle changing requests, quantities, prices and reactions.',['listening','vocabulary','conversation','culture'],5,['arcade','market'],10),
 g('cafe-order','Café Order','cafe-order','social','playful','Listen, remember and place a correct café order.',['listening','speaking','vocabulary'],4,['cafe','memory']),
 g('train-counter','Train Counter','train-counter','social','clever','Buy the correct ticket using language and travel clues.',['speaking','reading','navigation'],5,['travel','roleplay']),
 g('neighbor-favor','Neighbor Favor','neighbor-favor','social','playful','Understand a friendly request and choose how to respond.',['listening','speaking','conversation'],4,['social','community']),
 g('lost-tourist','Lost Tourist','lost-tourist','social','playful','Give or understand directions through a real location.',['speaking','navigation','listening'],5,['navigation','help']),
 g('message-relay','Message Relay','message-relay','social','wild','Remember and pass a spoken message accurately.',['listening','memory','conversation'],4,['memory','audio']),
 g('emotion-reader','Emotion Reader','emotion-reader','social','clever','Match tone and emotion with an appropriate response.',['speaking','culture','conversation'],4,['emotion','social']),
 g('conversation-repair','Conversation Repair','conversation-repair','social','playful','Repair awkward dialogue with a natural language choice.',['speaking','grammar','conversation'],5,['dialogue','repair']),
 g('echo-station','Echo Station','echo-station','listening','gentle','Identify repeated target-language sounds and phrases.',['listening','recall'],3,['audio','recall']),
 g('audio-map','Audio Map','audio-map','listening','clever','Follow spoken directions across a map.',['listening','navigation'],5,['audio','navigation']),
 g('voice-match','Voice Match','voice-match','listening','gentle','Match a spoken phrase to the correct situation.',['listening','conversation'],3,['audio','context']),
 g('missing-word-radio','Missing Word Radio','missing-word-radio','listening','playful','Fill missing words in short spoken broadcasts.',['listening','vocabulary'],4,['audio','fill']),
 g('street-noise','Street Noise','street-noise','listening','clever','Separate useful language from harmless ambient scene noise.',['listening','recall'],4,['audio','attention']),
 g('rhythm-repeat','Rhythm Repeat','rhythm-repeat','listening','playful','Choose the phrase matching speech rhythm and intent.',['listening','speaking'],3,['audio','rhythm']),
 g('announcement-alert','Announcement Alert','announcement-alert','listening','wild','Understand a public announcement quickly.',['listening','reading'],3,['audio','travel','speed']),
 g('whisper-trail','Whisper Trail','whisper-trail','listening','mysterious','Follow quiet fictional clues through a hidden location.',['listening','reading'],5,['mystery','audio']),
 g('mystery-room','Mystery Room','mystery-room','adventure','wild','Solve a chain of language puzzles to escape a strange fictional room.',['grammar','vocabulary','reading','recall'],7,['puzzle','story','fictional'],12),
 g('story-choice','Story Choice','story-choice','adventure','playful','Shape a branching story through language choices.',['reading','speaking','culture','vocabulary'],6,['story','choices'],10),
 g('detective-case','Detective Case','detective-case','adventure','clever','Solve a small mystery from language clues.',['reading','listening','vocabulary'],7,['detective','mystery'],12),
 g('treasure-map','Treasure Map','treasure-map','adventure','playful','Decode clues to discover a hidden destination.',['reading','vocabulary','navigation'],6,['map','adventure']),
 g('festival-prep','Festival Prep','festival-prep','adventure','playful','Prepare a festival using varied language tasks.',['mixed','culture','vocabulary'],8,['festival','variety'],14),
 g('time-traveler','Time Traveler','time-traveler','adventure','wild','Navigate fictional eras using language clues.',['reading','culture','vocabulary'],8,['time','adventure'],14),
 g('dream-theatre','Dream Theatre','dream-theatre','adventure','creative','Act through surreal language scenes and choices.',['speaking','creative','conversation'],7,['dream','story'],14),
 g('secret-agent','Secret Agent','secret-agent','adventure','wild','Decode harmless messages and identify the next objective.',['reading','listening','recall'],6,['agent','decode'],12),
 g('escape-the-archive','Escape the Archive','escape-the-archive','adventure','wild','Solve language locks to escape a fictional archive.',['grammar','reading','vocabulary'],8,['archive','puzzle'],12),
 g('lantern-mystery','Lantern Mystery','lantern-mystery','adventure','mysterious','Investigate a night-time fictional mystery.',['listening','reading','culture'],7,['night','mystery'],12),
 g('sign-designer','Sign Designer','sign-designer','creative','creative','Construct a useful sign from language pieces.',['writing','vocabulary'],5,['design','writing']),
 g('story-composer','Story Composer','story-composer','creative','creative','Arrange scenes and phrases into a coherent story.',['writing','reading'],6,['story','creative']),
 g('recipe-creator','Recipe Creator','recipe-creator','creative','playful','Sequence ingredients and instructions using target-language clues.',['reading','vocabulary','writing'],5,['food','sequence']),
 g('world-builder','World Builder','world-builder','creative','creative','Use correct language commands to construct a small scene.',['mixed','writing','creative'],7,['building','world'],12),
];

function hashSeed(value:string){let hash=2166136261;for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619)}return hash>>>0}
export const worldMiniGameEngine={
 all():WorldMiniGameDefinition[]{return games.map(game=>({...game,skills:[...game.skills],tags:[...game.tags]}))},
 byId(id:string):WorldMiniGameDefinition|null{return games.find(game=>game.id===id)??null},
 byKind(kind:WorldMiniGameKind):WorldMiniGameDefinition[]{return games.filter(game=>game.kind===kind).map(game=>({...game,skills:[...game.skills],tags:[...game.tags]}))},
 recommend(skills:Array<WorldMiniGameDefinition['skills'][number]>,exclude:string[]=[]):WorldMiniGameDefinition[]{const excluded=new Set(exclude);return games.map(game=>({game,score:game.skills.filter(skill=>skills.includes(skill)).length*10+(excluded.has(game.id)?-100:game.noveltyWeight??1)})).filter(item=>!excluded.has(item.game.id)&&item.score>0).sort((a,b)=>b.score-a.score||a.game.estimatedMinutes-b.game.estimatedMinutes).map(item=>({...item.game,skills:[...item.game.skills],tags:[...item.game.tags]}))},
 createSession(gameId:string,contextKey:string,totalRounds=5):WorldMiniGameSession{const game=worldMiniGameEngine.byId(gameId);if(!game)throw new Error(`Unknown mini-game: ${gameId}`);return{gameId,seed:hashSeed(`${gameId}:${contextKey}`),score:0,streak:0,round:0,totalRounds:Math.max(1,totalRounds),lives:game.difficulty==='wild'?3:game.difficulty==='clever'?4:5,status:'ready'}},
 start(session:WorldMiniGameSession):WorldMiniGameSession{return session.status==='ready'?{...session,status:'playing'}:session},
 answer(session:WorldMiniGameSession,correct:boolean):WorldMiniGameSession{if(session.status!=='playing')return session;const nextRound=session.round+1;const nextStreak=correct?session.streak+1:0;const nextScore=correct?session.score+10+Math.min(session.streak,5)*2:session.score;const nextLives=correct?session.lives:Math.max(0,session.lives-1);const status=nextRound>=session.totalRounds?'won':nextLives===0?'lost':'playing';return{...session,round:nextRound,streak:nextStreak,score:nextScore,lives:nextLives,status}},
 reset(session:WorldMiniGameSession):WorldMiniGameSession{return worldMiniGameEngine.createSession(session.gameId,String(session.seed),session.totalRounds)},
};

export type WorldMiniGameSession={gameId:string;seed:number;score:number;streak:number;round:number;totalRounds:number;lives:number;status:'ready'|'playing'|'won'|'lost'};
