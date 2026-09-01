export type WorldLocationKind = 'real' | 'fictional';
export type WorldActivityMode = 'resident-learning' | 'exploration-games';

export interface WorldLocationDescriptor {
  id: string;
  worldId: string;
  kind: WorldLocationKind;
  label: string;
  residentId?: string;
}

export interface WorldExperiencePolicy {
  kind: WorldLocationKind;
  activityMode: WorldActivityMode;
  requiresArrivalCinematic: boolean;
  requiresResidentFocus: boolean;
  gamesAllowed: boolean;
  questsAllowed: boolean;
  adventuresAllowed: boolean;
}

const POLICIES: Record<WorldLocationKind, WorldExperiencePolicy> = {
  real: {
    kind: 'real',
    activityMode: 'resident-learning',
    requiresArrivalCinematic: true,
    requiresResidentFocus: true,
    gamesAllowed: false,
    questsAllowed: false,
    adventuresAllowed: false,
  },
  fictional: {
    kind: 'fictional',
    activityMode: 'exploration-games',
    requiresArrivalCinematic: false,
    requiresResidentFocus: false,
    gamesAllowed: true,
    questsAllowed: true,
    adventuresAllowed: true,
  },
};

export function resolveWorldExperiencePolicy(kind: WorldLocationKind): WorldExperiencePolicy {
  return POLICIES[kind];
}

/**
 * Canonical world gate. Real places are resident-first learning experiences;
 * fictional places are the playground for games, quests and adventures.
 */
export function assertWorldActivityAllowed(
  location: WorldLocationDescriptor,
  activity: 'resident' | 'game' | 'quest' | 'adventure',
): boolean {
  const policy = resolveWorldExperiencePolicy(location.kind);
  if (activity === 'resident') return policy.requiresResidentFocus && Boolean(location.residentId);
  if (activity === 'game') return policy.gamesAllowed;
  if (activity === 'quest') return policy.questsAllowed;
  return policy.adventuresAllowed;
}

/** Real locations must always identify the resident who anchors the learning encounter. */
export function createRealLocationDescriptor(
  input: Omit<WorldLocationDescriptor, 'kind' | 'residentId'> & { residentId: string },
): WorldLocationDescriptor {
  return { ...input, kind: 'real', residentId: input.residentId };
}

export function createFictionalLocationDescriptor(
  input: Omit<WorldLocationDescriptor, 'kind'>,
): WorldLocationDescriptor {
  return { ...input, kind: 'fictional' };
}
