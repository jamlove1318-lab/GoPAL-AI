import type { WorldTheme } from '../components/LivingWorldPrimitives';
export type WorldGameplayKind='spawn'|'checkpoint'|'collectible'|'trigger'|'portal'|'door'|'switch'|'pressure-plate'|'quest-marker'|'save-point'|'shop'|'loot-container'|'puzzle'|'moving-platform'|'hazard';
export type WorldGameplayDefinition={id:string;kind:WorldGameplayKind;x:number;y:number;radius?:number;scale?:number;theme?:WorldTheme;label?:string;tags?:string[];targetId?:string;oneShot?:boolean;stateful?:boolean;interactive?:boolean};
const LOCATION_GAMEPLAY:Record<string,WorldGameplayDefinition[]>={
 'emerald-village':[
  {id:'emerald-spawn',kind:'spawn',x:50,y:62,radius:4,theme:'emerald',label:'Village Spawn'},
  {id:'emerald-checkpoint-station',kind:'checkpoint',x:62,y:52,radius:5,theme:'emerald',label:'Station Checkpoint',stateful:true,interactive:true},
  {id:'emerald-garden-collectible',kind:'collectible',x:76,y:76,radius:4,theme:'emerald',label:'Garden Discovery',oneShot:true,interactive:true,tags:['discovery','learning']},
  {id:'emerald-village-save',kind:'save-point',x:28,y:48,radius:4,theme:'emerald',label:'Village Save Point',interactive:true},
 ],
 'learning-campus':[
  {id:'campus-spawn',kind:'spawn',x:50,y:62,radius:4,theme:'emerald',label:'Campus Spawn'}, {id:'campus-checkpoint',kind:'checkpoint',x:52,y:54,radius:5,theme:'emerald',label:'Campus Checkpoint',stateful:true,interactive:true},
  {id:'campus-quest-marker',kind:'quest-marker',x:67,y:38,radius:4,theme:'emerald',label:'Learning Quest',interactive:true,tags:['lesson','quest']}, {id:'campus-puzzle',kind:'puzzle',x:27,y:70,radius:5,theme:'emerald',label:'Campus Puzzle',stateful:true,interactive:true,tags:['game','learning']},
 ],
 'coastal-town':[
  {id:'coast-spawn',kind:'spawn',x:50,y:61,radius:4,theme:'coastal',label:'Coast Arrival'}, {id:'coast-harbor-checkpoint',kind:'checkpoint',x:79,y:68,radius:5,theme:'coastal',label:'Harbor Checkpoint',stateful:true,interactive:true},
  {id:'coast-treasure',kind:'collectible',x:90,y:78,radius:4,theme:'coastal',label:'Harbor Discovery',oneShot:true,interactive:true,tags:['discovery','culture']}, {id:'coast-quest',kind:'quest-marker',x:49,y:36,radius:4,theme:'coastal',label:'Coastal Lesson',interactive:true,tags:['lesson','travel']},
 ],
 'mountain-village':[
  {id:'mountain-spawn',kind:'spawn',x:48,y:62,radius:4,theme:'mountain',label:'Mountain Arrival'}, {id:'mountain-checkpoint',kind:'checkpoint',x:51,y:53,radius:5,theme:'mountain',label:'Trail Checkpoint',stateful:true,interactive:true},
  {id:'mountain-discovery',kind:'collectible',x:86,y:69,radius:4,theme:'mountain',label:'Summit Discovery',oneShot:true,interactive:true,tags:['discovery','nature']}, {id:'mountain-puzzle',kind:'puzzle',x:19,y:41,radius:5,theme:'mountain',label:'Shrine Puzzle',stateful:true,interactive:true,tags:['game','culture']},
 ],
 'fantasy-kingdom':[
  {id:'fantasy-spawn',kind:'spawn',x:50,y:58,radius:4,theme:'festival',label:'Kingdom Gate'}, {id:'fantasy-quest',kind:'quest-marker',x:50,y:25,radius:5,theme:'festival',label:'Moon Temple Quest',interactive:true,tags:['quest','story']},
  {id:'fantasy-crystal',kind:'collectible',x:84,y:31,radius:4,theme:'festival',label:'Moon Crystal',oneShot:true,interactive:true,tags:['discovery','magic']}, {id:'fantasy-puzzle',kind:'puzzle',x:51,y:72,radius:5,theme:'festival',label:'Arcane Puzzle',stateful:true,interactive:true,tags:['game','learning']},
 ],
 'scifi-outpost':[
  {id:'scifi-spawn',kind:'spawn',x:50,y:58,radius:4,theme:'coastal',label:'Outpost Arrival'}, {id:'scifi-checkpoint',kind:'checkpoint',x:50,y:48,radius:5,theme:'coastal',label:'Transit Checkpoint',stateful:true,interactive:true},
  {id:'scifi-data-cache',kind:'collectible',x:83,y:30,radius:4,theme:'coastal',label:'Data Discovery',oneShot:true,interactive:true,tags:['discovery','science']}, {id:'scifi-puzzle',kind:'puzzle',x:50,y:58,radius:5,theme:'coastal',label:'Systems Puzzle',stateful:true,interactive:true,tags:['game','science','learning']},
 ],
 'game-arena':[
  {id:'arena-spawn',kind:'spawn',x:50,y:78,radius:4,theme:'festival',label:'Arena Start'}, {id:'arena-checkpoint',kind:'checkpoint',x:50,y:50,radius:5,theme:'festival',label:'Arena Checkpoint',stateful:true,interactive:true},
  {id:'arena-quest',kind:'quest-marker',x:50,y:25,radius:4,theme:'festival',label:'Challenge Board',interactive:true,tags:['quest','game']}, {id:'arena-puzzle',kind:'puzzle',x:50,y:50,radius:5,theme:'festival',label:'Chaos Challenge',stateful:true,interactive:true,tags:['game','learning']},
 ],
};
export function getLocationGameplay(locationId:string){return LOCATION_GAMEPLAY[locationId]??[];}
export function gameplayByKind(locationId:string,kind:WorldGameplayKind){return getLocationGameplay(locationId).filter(item=>item.kind===kind);}
export function nearestGameplay(point:{x:number;y:number},objects:WorldGameplayDefinition[],maxDistance=12){let nearest:WorldGameplayDefinition|null=null;let best=maxDistance;for(const object of objects){const distance=Math.hypot(point.x-object.x,(point.y-object.y)*.92);const radius=object.radius??4;const effective=Math.max(0,distance-radius);if(effective<=best){best=effective;nearest=object;}}return nearest;}
