import { evolveCassidyPersonality } from './cassidyPersonalityEngine';
import { markCassidyInteraction } from './cassidyLifeStateEngine';

export type CassidyInteractionKind='greeting'|'conversation'|'story'|'dream'|'adventure'|'help'|'discovery';
export async function recordCassidyInteraction(input:{kind:CassidyInteractionKind;worldId:string;destinationId?:string;successful?:boolean}){await markCassidyInteraction();return evolveCassidyPersonality({worldId:input.worldId,activity:input.kind,success:input.successful,interaction:true,discovery:input.kind==='discovery',adventure:input.kind==='adventure'});}
export const cassidyInteractionEngine={record:recordCassidyInteraction};
