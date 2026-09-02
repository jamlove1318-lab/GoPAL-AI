import { JourneyEngine } from '../journey/journeyEngine';
import { eventBus } from '../events/eventBus';
import type { LivingResident } from '../../features/world/components/LivingResidentLayer';
import { worldStateEngine } from './worldStateEngine';
import { residentRelationshipEngine } from './residentRelationshipEngine';
import { residentStoryEngine } from './residentStoryEngine';
import { residentConsequenceFollowUpEngine } from './residentConsequenceFollowUpEngine';

export type EncounterChoice={id:'stay'|'ask'|'help'|'wander';label:string;detail:string;learningScenario?:string};
export type LivingEncounterResult={residentId:string;residentName:string;eventKey:string;title:string;detail:string;firstTime:boolean;choices:EncounterChoice[]};

export class LivingEncounterEngine{
  private readonly journey=new JourneyEngine();
  private readonly seen=new Set<string>();

  async approach(resident:LivingResident,userId='local-explorer-user'):Promise<LivingEncounterResult>{
    const eventKey=`${resident.id}:${resident.locationKey}:${resident.activity}`;
    const known=await worldStateEngine.has(`resident:${resident.id}:met`);
    const firstTime=!known&&!this.seen.has(eventKey);
    this.seen.add(eventKey);
    await worldStateEngine.mark(`resident:${resident.id}:met`);
    await worldStateEngine.set(`resident:${resident.id}:lastActivity`,resident.activity);
    const relationship=await residentRelationshipEngine.recordEncounter(resident.id);
    const thread=await residentStoryEngine.readyForResident(resident.id);
    const followUp=!thread?await residentConsequenceFollowUpEngine.readyForResident(resident.id):null;

    eventBus.emit('world:residentEncountered',{residentId:resident.id,residentName:resident.name,activity:resident.activity,locationId:resident.locationKey,userId},'world');
    if(firstTime)await this.journey.recordEvent(userId,'living_encounter_engine','world:encounteredResident',{residentId:resident.id,residentName:resident.name,role:resident.role,location:resident.locationKey,mood:resident.mood,activity:resident.activity});

    const detail=thread
      ?`${resident.name} notices you before you can say anything. “You came back. I found something.”`
      :followUp
        ?followUp.detail
        :firstTime
          ?`${resident.name} was ${resident.activity}. You do not have to turn this into a lesson; decide what feels natural.`
          :await residentRelationshipEngine.greeting(resident.id,resident.name);

    const title=thread
      ?thread.title
      :followUp
        ?followUp.title
        :firstTime
          ?`${resident.name} notices you`
          :relationship.tone==='trusted'
            ?`${resident.name} is glad you came back`
            :`${resident.name} recognizes you`;

    const choices=thread
      ?[
          {id:'stay' as const,label:'See what they found',detail:thread.detail},
          {id:'ask' as const,label:'Ask what changed',detail:`${resident.name} has been carrying this thread forward while the valley kept moving.`},
          {id:'wander' as const,label:'Come back later',detail:'The thread remains open. Some things can wait.'},
        ]
      :followUp
        ?[
            {id:'ask' as const,label:'Say you noticed',detail:followUp.acknowledgement},
            {id:'stay' as const,label:'Stay with the moment',detail:`You let ${resident.name} decide how much to share without forcing the answer.`},
            {id:'wander' as const,label:'Leave it unspoken',detail:'You both understand that not every discovery needs to become a conversation yet.'},
          ]
        :choicesFor(resident,relationship.tone);

    return{residentId:resident.id,residentName:resident.name,eventKey,firstTime,title,detail,choices};
  }

  async choose(result:LivingEncounterResult,choice:EncounterChoice,userId='local-explorer-user'):Promise<{title:string;detail:string;scenario?:string}>{
    const relationship=await residentRelationshipEngine.recordChoice(result.residentId,choice.id);
    if(choice.id!=='wander'){
      eventBus.emit('world:residentMoment',{residentId:result.residentId,residentName:result.residentName,choice:choice.id,userId},'world');
      await this.journey.recordEvent(userId,'living_encounter_engine','world:residentMoment',{residentId:result.residentId,residentName:result.residentName,encounter:result.eventKey,choice:choice.id,label:choice.label,relationshipTone:relationship.tone});
    }

    await worldStateEngine.set(`resident:${result.residentId}:lastChoice`,choice.id);
    if(choice.id==='help')await worldStateEngine.mark(`resident:${result.residentId}:helped`);
    if(choice.id==='ask')await worldStateEngine.mark(`resident:${result.residentId}:asked`);
    await residentStoryEngine.noteChoice(result.residentId,choice.id);

    const consequenceFollowUp=choice.id!=='wander'
      ?await residentConsequenceFollowUpEngine.acknowledge(result.residentId)
      :null;
    if(consequenceFollowUp){
      return{title:`${result.residentName} remembers that you noticed`,detail:consequenceFollowUp.acknowledgement};
    }

    const ready=await residentStoryEngine.readyForResident(result.residentId);
    if(ready&&choice.id!=='wander'){
      await residentStoryEngine.resolve(ready.id);
      return{title:`${result.residentName} continues the story`,detail:choice.detail,scenario:choice.learningScenario};
    }
    if(choice.id==='wander')return{title:'The valley keeps moving',detail:`You leave ${result.residentName} to their day. Maybe something else will be happening when you return.`};
    if(choice.id==='help')return{title:relationship.tone==='warm'||relationship.tone==='trusted'?`${result.residentName} trusts you with more`:`${result.residentName} remembers the gesture`,detail:choice.detail,scenario:choice.learningScenario};
    return{title:relationship.tone==='warm'||relationship.tone==='trusted'?`${result.residentName} lets the moment linger`:`${result.residentName} stays with you for a while`,detail:choice.detail,scenario:choice.learningScenario};
  }
}

function choicesFor(resident:LivingResident,tone:'new'|'familiar'|'warm'|'trusted'):EncounterChoice[]{
  const scenario=resident.locationKey.includes('cafe')?'scen-cafe-order':resident.locationKey.includes('library')?'scen-library-inquiry':resident.locationKey.includes('market')?'scen-market-browse':undefined;
  const familiar=tone==='warm'||tone==='trusted';
  return[
    {id:'stay',label:familiar?'Stay a little longer':'Stay for a while',detail:familiar?`${resident.name} is comfortable sharing the quiet with you now.`:`You slow down and let ${resident.name}'s world become part of yours for a moment.`,learningScenario:scenario},
    {id:'ask',label:familiar?'Ask what happened since last time':'Ask about it',detail:familiar?`${resident.name} fills you in on what changed while you were away.`:`${resident.name} begins explaining what they are doing, giving the moment somewhere new to go.`,learningScenario:scenario},
    {id:'help',label:familiar?'Offer to help again':'Offer to help',detail:'You step into the activity instead of watching from outside. What you learn now has a reason.',learningScenario:scenario},
    {id:'wander',label:'Keep wandering',detail:'Leave the encounter open and continue exploring.'},
  ];
}

export const livingEncounterEngine=new LivingEncounterEngine();
