import type { CassidyLifeActivity } from './cassidyLifeEngine';

export type CassidyMeaningfulExperienceKind = 'discovery' | 'adventure' | 'story' | 'dream' | 'help' | 'celebration';

export interface CassidyMeaningfulExperience {
  kind: CassidyMeaningfulExperienceKind;
  activity: CassidyLifeActivity;
  shouldPersist: true;
  summary: string;
}

const MEANINGFUL: Record<CassidyLifeActivity, CassidyMeaningfulExperienceKind | null> = {
  discovering: 'discovery',
  adventure: 'adventure',
  storytelling: 'story',
  dreaming: 'dream',
  helping: 'help',
  celebrating: 'celebration',
  wandering: null,
  cafe: null,
  reading: null,
  'watching-rain': null,
  stargazing: null,
  resting: null,
};

const SUMMARY: Record<CassidyMeaningfulExperienceKind, string> = {
  discovery: 'Cassidy discovered something unusual while living in the world.',
  adventure: 'Cassidy began an adventure after discovering something worth exploring.',
  story: 'Cassidy shared a story as part of her life in the world.',
  dream: 'Cassidy experienced one of her dreams.',
  help: 'Cassidy noticed the learner needed help and chose to help.',
  celebration: 'Cassidy celebrated something the learner accomplished.',
};

export function meaningfulCassidyExperience(activity: CassidyLifeActivity): CassidyMeaningfulExperience | null {
  const kind = MEANINGFUL[activity];
  if (!kind) return null;
  return { kind, activity, shouldPersist: true, summary: SUMMARY[kind] };
}

export function isMeaningfulCassidyActivity(activity: CassidyLifeActivity): boolean {
  return meaningfulCassidyExperience(activity) !== null;
}

export const cassidyMeaningfulExperienceEngine = {
  resolve: meaningfulCassidyExperience,
  isMeaningful: isMeaningfulCassidyActivity,
};
