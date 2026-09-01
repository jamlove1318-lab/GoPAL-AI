export type RhythmBeat={id:string;at:number;window:number;label?:string};
export type RhythmState={index:number;hits:number;misses:number;score:number;startedAt?:number;completed:boolean};
export const createRhythmState=():RhythmState=>({index:0,hits:0,misses:0,score:0,completed:false});
export function startRhythm(state:RhythmState,now=Date.now()):RhythmState{return{...state,startedAt:now}};
export function hitBeat(state:RhythmState,beat:RhythmBeat,now:number):RhythmState{const delta=Math.abs(now-(state.startedAt??now)-beat.at);const hit=delta<=beat.window;const index=state.index+1;return{...state,index,hits:state.hits+(hit?1:0),misses:state.misses+(hit?0:1),score:Math.max(0,state.score+(hit?Math.max(10,100-Math.floor(delta)):0)),completed:false}};
export function finishRhythm(state:RhythmState,total:number):RhythmState{return{...state,completed:state.index>=total}};
