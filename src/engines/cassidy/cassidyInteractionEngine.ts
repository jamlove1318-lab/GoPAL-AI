import { eventBus } from '../events/eventBus';
import { evolveCassidyPersonality } from './cassidyPersonalityEngine';
import { markCassidyInteraction } from './cassidyLifeStateEngine';

export type CassidyInteractionKind='greeting'|'conversation'|'story'|'dream'|'adventure'|'help'|'discovery';
export async function recordCassidyInteraction(input:{kind:CassidyInteractionKind;worldId:string;destinationId?:string;successful?:boolean}){await markCassidyInteraction();await evolveCassidyPersonality({worldId:input.worldId,activity:input.kind,success:input.successful,interaction:true,discovery:input.kind==='discovery',adventure:input.kind==='adventure'});eventBus.emit('cassidy:interactionRecorded',{kind:input.kind,worldId:input.worldId,destinationId:input.destinationId});return true;}
export const cassidyInteractionEngine={record:recordCassidyInteraction};
