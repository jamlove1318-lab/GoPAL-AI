import { evolveCassidyPersonality } from './cassidyPersonalityEngine';
import { markCassidyInteraction } from './cassidyLifeStateEngine';

export type CassidyInteractionKind='greeting'|'conversation'|'story'|'dream'|'adventure'|'help'|'discovery';
export async function recordCassidyInteraction(input:{kind:CassidyInteractionKind;worldId:string;destinationId?:string;anchorId?:string;successful?:boolean;eventId?:string}){await markCassidyInteraction({worldId:input.worldId,destinationId:input.destinationId,anchorId:input.anchorId});return evolveCassidyPersonality({eventId:input.eventId,worldId:input.worldId,activity:input.kind,success:input.successful,interaction:true,discovery:input.kind==='discovery',adventure:input.kind==='adventure'});}
export const cassidyInteractionEngine={record:recordCassidyInteraction};
