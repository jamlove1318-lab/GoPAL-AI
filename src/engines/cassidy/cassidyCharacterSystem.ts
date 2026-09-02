import { cassidyCharacterRuntimeEngine } from './cassidyCharacterRuntimeEngine';
import { decideCassidyAction, type CassidyAutonomyInput, type CassidyAutonomyDecision } from './cassidyAutonomyEngine';
import { executeCassidyDecision, type CassidyAction } from './cassidyActionEngine';
import { getCassidyPersonality, type CassidyPersonalityState } from './cassidyPersonalityEngine';
import { getCassidyLifeState, type CassidyLifeState } from './cassidyLifeStateEngine';
import type { CassidyCharacterRuntimeSnapshot, } from './cassidyCharacterRuntimeEngine';
export interface CassidyCharacterSystemSnapshot{character:CassidyCharacterRuntimeSnapshot;personality:CassidyPersonalityState;life:CassidyLifeState;}
export async function decideCassidyCharacter(input:CassidyAutonomyInput,userId='local-explorer-user'):Promise<{decision:CassidyAutonomyDecision;action:CassidyAction;character:CassidyCharacterRuntimeSnapshot}>{const decision=decideCassidyAction(input);const action=executeCassidyDecision(decision,userId);const animation=action.visualAction==='walking'?'walk':action.visualAction==='talking'?'talking':action.visualAction==='waving'?'gesture':'idle';cassidyCharacterRuntimeEngine.setWorldPresence(decision.worldId??'emerald-valley',decision.destinationId);cassidyCharacterRuntimeEngine.setExpression(decision.mood==='excited'?'excited':decision.mood==='thinking'?'thoughtful':decision.mood==='happy'?'happy':'warm' as never);cassidyCharacterRuntimeEngine.play(animation);return{decision,action,character:cassidyCharacterRuntimeEngine.snapshot()};}
export async function getCassidyCharacterSystemSnapshot(userId='local-explorer-user'):Promise<CassidyCharacterSystemSnapshot>{return{character:cassidyCharacterRuntimeEngine.snapshot(),personality:await getCassidyPersonality(userId),life:await getCassidyLifeState(userId)};}
export const cassidyCharacterSystem={runtime:cassidyCharacterRuntimeEngine,decide:decideCassidyCharacter,snapshot:getCassidyCharacterSystemSnapshot};
