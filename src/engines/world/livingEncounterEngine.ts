import { JourneyEngine } from '../journey/journeyEngine';
import type { LivingResident } from '../../features/world/components/LivingResidentLayer';

export type LivingEncounterResult = {
  residentId: string;
  eventKey: string;
  title: string;
  detail: string;
  firstTime: boolean;
};

/**
 * Small bridge between visible world encounters and the persistent Journey.
 * This intentionally records only meaningful approaches, not every tap.
 */
export class LivingEncounterEngine {
  private readonly journey = new JourneyEngine();
  private readonly seen = new Set<string>();

  async approach(resident: LivingResident, userId = 'local-explorer-user'): Promise<LivingEncounterResult> {
    const eventKey = `${resident.id}:${resident.locationKey}:${resident.activity}`;
    const firstTime = !this.seen.has(eventKey);
    this.seen.add(eventKey);

    if (firstTime) {
      await this.journey.recordEvent(userId, 'living_encounter_engine', 'world:encounteredResident', {
        residentId: resident.id,
        residentName: resident.name,
        role: resident.role,
        location: resident.locationKey,
        mood: resident.mood,
        activity: resident.activity,
      });
    }

    return {
      residentId: resident.id,
      eventKey,
      firstTime,
      title: firstTime ? `You found ${resident.name}` : `You found ${resident.name} again`,
      detail: firstTime
        ? `${resident.name} was ${resident.activity}. Cassidy may remember that this was your first real encounter.`
        : `${resident.name} is ${resident.activity} again, but the moment is not exactly the same.`,
    };
  }
}

export const livingEncounterEngine = new LivingEncounterEngine();
