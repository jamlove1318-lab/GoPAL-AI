import { JourneyEngine } from '../journey/journeyEngine';
import type { LivingResident } from '../../features/world/components/LivingResidentLayer';

export type EncounterChoice = { id: 'stay' | 'ask' | 'help' | 'wander'; label: string; detail: string; learningScenario?: string };
export type LivingEncounterResult = { residentId: string; residentName: string; eventKey: string; title: string; detail: string; firstTime: boolean; choices: EncounterChoice[]; };

/** Bridges visible encounters into Journey events and contextual choices. */
export class LivingEncounterEngine {
  private readonly journey = new JourneyEngine();
  private readonly seen = new Set<string>();

  async approach(resident: LivingResident, userId = 'local-explorer-user'): Promise<LivingEncounterResult> {
    const eventKey = `${resident.id}:${resident.locationKey}:${resident.activity}`;
    const firstTime = !this.seen.has(eventKey);
    this.seen.add(eventKey);
    if (firstTime) await this.journey.recordEvent(userId, 'living_encounter_engine', 'world:encounteredResident', { residentId: resident.id, residentName: resident.name, role: resident.role, location: resident.locationKey, mood: resident.mood, activity: resident.activity });
    return { residentId: resident.id, residentName: resident.name, eventKey, firstTime, title: firstTime ? `${resident.name} notices you` : `${resident.name} looks up again`, detail: firstTime ? `${resident.name} was ${resident.activity}. You do not have to turn this into a lesson; decide what feels natural.` : `${resident.name} is ${resident.activity} again. Because you have met before, the moment already has a little history.`, choices: choicesFor(resident) };
  }

  async choose(result: LivingEncounterResult, choice: EncounterChoice, userId = 'local-explorer-user'): Promise<{ title: string; detail: string; scenario?: string }> {
    if (choice.id !== 'wander') await this.journey.recordEvent(userId, 'living_encounter_engine', 'world:residentMoment', { residentId: result.residentId, residentName: result.residentName, encounter: result.eventKey, choice: choice.id, label: choice.label });
    if (choice.id === 'wander') return { title: 'The valley keeps moving', detail: `You leave ${result.residentName} to their day. Maybe something else will be happening when you return.` };
    if (choice.id === 'help') return { title: `${result.residentName} remembers the gesture`, detail: choice.detail, scenario: choice.learningScenario };
    return { title: `${result.residentName} stays with you for a while`, detail: choice.detail, scenario: choice.learningScenario };
  }
}

function choicesFor(resident: LivingResident): EncounterChoice[] {
  const scenario = resident.locationKey.includes('cafe') ? 'scen-cafe-order' : resident.locationKey.includes('library') ? 'scen-library-inquiry' : resident.locationKey.includes('market') ? 'scen-market-browse' : undefined;
  return [
    { id: 'stay', label: 'Stay for a while', detail: `You slow down and let ${resident.name}'s world become part of yours for a moment.`, learningScenario: scenario },
    { id: 'ask', label: 'Ask about it', detail: `${resident.name} begins explaining what they are doing, giving the moment somewhere new to go.`, learningScenario: scenario },
    { id: 'help', label: 'Offer to help', detail: `You step into the activity instead of watching from outside. What you learn now has a reason.`, learningScenario: scenario },
    { id: 'wander', label: 'Keep wandering', detail: 'Leave the encounter open and continue exploring.' },
  ];
}
export const livingEncounterEngine = new LivingEncounterEngine();
