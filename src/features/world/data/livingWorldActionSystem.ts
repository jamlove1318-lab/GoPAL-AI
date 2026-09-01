import type { WorldObjectDefinition } from './livingWorldObjects';

export type WorldActionId =
  | 'talk' | 'learn' | 'enter' | 'exit' | 'inspect' | 'discover' | 'collect'
  | 'use' | 'open' | 'close' | 'board' | 'ride' | 'travel' | 'activate'
  | 'save' | 'quest' | 'play' | 'custom';

export type WorldActionContext = {
  object: WorldObjectDefinition;
  distance: number;
  unlocked?: boolean;
  playerTags?: string[];
};

export type WorldActionDefinition = {
  id: WorldActionId;
  label: string;
  icon?: string;
  priority: number;
  requiresUnlock?: boolean;
  tags?: string[];
};

const ACTIONS: Record<WorldActionId, WorldActionDefinition> = {
  talk: { id: 'talk', label: 'Talk', priority: 100, tags: ['character'] },
  learn: { id: 'learn', label: 'Learn', priority: 95, tags: ['learning'] },
  enter: { id: 'enter', label: 'Enter', priority: 90, tags: ['entrance'] },
  exit: { id: 'exit', label: 'Exit', priority: 90, tags: ['entrance'] },
  inspect: { id: 'inspect', label: 'Inspect', priority: 60 },
  discover: { id: 'discover', label: 'Discover', priority: 55 },
  collect: { id: 'collect', label: 'Collect', priority: 85 },
  use: { id: 'use', label: 'Use', priority: 80 },
  open: { id: 'open', label: 'Open', priority: 75 },
  close: { id: 'close', label: 'Close', priority: 75 },
  board: { id: 'board', label: 'Board', priority: 88, tags: ['transport'] },
  ride: { id: 'ride', label: 'Ride', priority: 82, tags: ['transport'] },
  travel: { id: 'travel', label: 'Travel', priority: 92, tags: ['transport'] },
  activate: { id: 'activate', label: 'Activate', priority: 78, tags: ['gameplay'] },
  save: { id: 'save', label: 'Save', priority: 110, tags: ['gameplay'] },
  quest: { id: 'quest', label: 'Quest', priority: 105, tags: ['gameplay'] },
  play: { id: 'play', label: 'Play', priority: 80, tags: ['gameplay'] },
  custom: { id: 'custom', label: 'Interact', priority: 10 },
};

const TYPE_ACTIONS: Record<string, WorldActionId[]> = {
  building: ['enter', 'learn', 'discover'],
  character: ['talk', 'learn'],
  infrastructure: ['inspect', 'discover'],
  transport: ['travel', 'inspect'],
  vehicle: ['board', 'ride', 'inspect'],
  gameplay: ['activate', 'inspect'],
  prop: ['inspect', 'discover'],
  nature: ['inspect', 'discover'],
};

export function getWorldAction(id: WorldActionId) { return ACTIONS[id]; }

export function getAvailableWorldActions(context: WorldActionContext): WorldActionDefinition[] {
  const object = context.object;
  const actionIds = new Set<WorldActionId>(TYPE_ACTIONS[object.category] ?? ['inspect']);
  for (const action of object.interaction?.actions ?? []) {
    if (action in ACTIONS) actionIds.add(action as WorldActionId);
  }
  if (object.category === 'gameplay' && object.type === 'save-point') actionIds.add('save');
  if (object.category === 'gameplay' && object.type === 'quest-marker') actionIds.add('quest');
  if (object.category === 'gameplay' && object.type === 'puzzle') actionIds.add('play');
  if (object.category === 'infrastructure' && (object.type === 'bus-stop' || object.type === 'parking')) actionIds.add('travel');
  if (object.category === 'transport') actionIds.add('inspect');
  if (object.category === 'vehicle') actionIds.add('board');
  if (object.state?.unlocked === false) return [...actionIds].map(id => ACTIONS[id]).filter(action => !action.requiresUnlock);
  return [...actionIds].map(id => ACTIONS[id]).sort((a, b) => b.priority - a.priority);
}

export function findBestWorldAction(context: WorldActionContext) {
  return getAvailableWorldActions(context)[0] ?? null;
}
