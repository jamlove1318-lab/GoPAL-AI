import type { ResidentPresentationState } from './residentPresentationEngine';
import type { ResidentContextReaction } from './residentContextReactionEngine';

export type ResidentBehaviorState='idle'|'notice'|'listen'|'think'|'happy'|'confused'|'talk'|'goodbye';
export type ResidentBehaviorSignal={state:ResidentBehaviorState;reason:string;durationMs:number};

const expressionFor:Record<ResidentBehaviorState,ResidentPresentationState['expression']>={idle:'neutral',notice:'curious',listen:'warm',think:'thinking',happy:'happy',confused:'encouraging',talk:'warm',goodbye:'warm'};
const motionFor:Record<ResidentBehaviorState,ResidentPresentationState['motion']>={idle:'idle',notice:'greeting',listen:'listening',think:'thinking',happy:'gesturing',confused:'thinking',talk:'gesturing',goodbye:'goodbye'};

export function adaptResidentBehavior(current:ResidentPresentationState,signal:ResidentBehaviorSignal):ResidentPresentationState{return {...current,expression:expressionFor[signal.state],motion:motionFor[signal.state],shouldLookAtLearner:signal.state!=='idle'||current.shouldLookAtLearner,animationKey:`${current.residentId}:${motionFor[signal.state]}:${expressionFor[signal.state]}:${signal.state}`};}

export function adaptResidentReaction(current:ResidentPresentationState,reaction:ResidentContextReaction):ResidentPresentationState{return {...current,expression:reaction.expression==='friendly'?'warm':reaction.expression==='pleased'?'happy':reaction.expression==='concerned'?'encouraging':reaction.expression,motion:reaction.motion==='warm'?'gesturing':reaction.motion,shouldLookAtLearner:true,animationKey:`${current.residentId}:${reaction.motion}:${reaction.expression}`};}

export const residentPresentationAdapter={behavior:adaptResidentBehavior,reaction:adaptResidentReaction};
