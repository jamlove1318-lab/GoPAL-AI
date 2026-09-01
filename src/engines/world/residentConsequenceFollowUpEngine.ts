import { worldStateEngine } from './worldStateEngine';
export type ResidentConsequenceFollowUp={residentId:string;title:string;detail:string;acknowledgement:string;sourceFlag:string};
const FOLLOW_UPS:Record<string,Omit<ResidentConsequenceFollowUp,'residentId'>>={
 emi:{title:'Emi notices what you found',detail:'Emi glances toward the place where the clue was waiting, then back at you. “You saw it too, didn’t you?”',acknowledgement:'The clue is no longer just scenery. Emi now knows you noticed what was left behind.',sourceFlag:'resident:emi:clue-noticed'},
 ren:{title:'Ren follows your glance',detail:'Ren notices that you recognised the unfamiliar guest. Their expression changes slightly, as if they were waiting to see whether you would mention it.',acknowledgement:'Ren remembers that you noticed the guest without needing to explain everything yet.',sourceFlag:'resident:ren:guest-noticed'},
 kenji:{title:'Kenji sees you looking',detail:'Kenji follows your eyes toward the warmer lanterns and gives them a small, satisfied adjustment. “You noticed the difference.”',acknowledgement:'Kenji knows you noticed what changed in the market.',sourceFlag:'resident:kenji:market-change-noticed'},
};
export class ResidentConsequenceFollowUpEngine{
 async readyForResident(residentId:string,userId='local-explorer-user'):Promise<ResidentConsequenceFollowUp|null>{const followUp=FOLLOW_UPS[residentId];if(!followUp)return null;const noticed=await worldStateEngine.has(userId,followUp.sourceFlag);const acknowledged=await worldStateEngine.has(userId,`${followUp.sourceFlag}:acknowledged`);if(!noticed||acknowledged)return null;return{residentId,...followUp};}
 async acknowledge(residentId:string,userId='local-explorer-user'):Promise<ResidentConsequenceFollowUp|null>{const followUp=await this.readyForResident(residentId,userId);if(!followUp)return null;await worldStateEngine.mark(userId,`${followUp.sourceFlag}:acknowledged`);return followUp;}
}
export const residentConsequenceFollowUpEngine=new ResidentConsequenceFollowUpEngine();