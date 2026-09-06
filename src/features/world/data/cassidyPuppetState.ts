/**
 * Renderer-independent Cassidy puppet state.
 *
 * World/life systems describe what Cassidy is doing; this adapter translates
 * those semantics into the stable production puppet vocabulary. A renderer
 * (SVG fallback, layered 2D, or a future authored runtime) consumes this state
 * without needing to know about world engines.
 */
import type { CassidyMood } from '../../../characters/cassidy';
import type { CassidyLifeActivity } from '../../../engines/cassidy/cassidyLifeEngine';
import type { CassidyPresenceContext } from '../../../engines/cassidy/cassidyWorldPresenceEngine';
import type { CassidySceneAnchor } from '../../../engines/cassidy/cassidySceneAnchorEngine';
import type {
  CassidyAction,
  CassidyCharmGlowState,
  CassidyExpression,
} from './cassidyProductionAssetContract';

export interface CassidyPuppetState {
  readonly action: CassidyAction;
  readonly expression: CassidyExpression;
  readonly charmGlow: CassidyCharmGlowState;
  readonly speaking: boolean;
  readonly facing: 'left' | 'right';
  readonly anchor: CassidySceneAnchor;
  readonly lifeActivity?: CassidyLifeActivity;
}

function expressionFor(mood: CassidyMood, context: CassidyPresenceContext): CassidyExpression {
  if (context === 'success') return 'excited';
  if (context === 'confused') return 'concerned';
  if (context === 'learning') return 'thoughtful';
  if (mood === 'excited') return 'excited';
  if (mood === 'thinking') return 'curious';
  if (mood === 'calm') return 'gentle';
  if (mood === 'happy') return 'happy';
  return 'neutral';
}

function actionFor(
  activity: CassidyLifeActivity | undefined,
  context: CassidyPresenceContext,
  anchor: CassidySceneAnchor,
): CassidyAction {
  // The scene-anchor engine is authoritative for explicitly staged contexts.
  if (!activity || context !== 'life') return anchor.action;
  if (activity === 'wandering' || activity === 'adventure') return 'walking';
  if (activity === 'storytelling' || activity === 'helping') return 'talking';
  if (activity === 'celebrating') return 'waving';
  return anchor.action;
}

function charmFor(
  activity: CassidyLifeActivity | undefined,
  context: CassidyPresenceContext,
): CassidyCharmGlowState {
  if (context === 'success' || activity === 'celebrating') return 'celebration';
  if (context === 'learning' || activity === 'helping') return 'learning';
  if (activity === 'discovering' || activity === 'adventure') return 'discovery';
  if (context === 'confused') return 'important';
  if (activity === 'storytelling') return 'memory';
  if (activity === 'cafe') return 'curious';
  return 'normal';
}

export function resolveCassidyPuppetState(input: {
  mood: CassidyMood;
  context: CassidyPresenceContext;
  activity?: CassidyLifeActivity;
  anchor: CassidySceneAnchor;
  speaking?: boolean;
}): CassidyPuppetState {
  return {
    action: actionFor(input.activity, input.context, input.anchor),
    expression: expressionFor(input.mood, input.context),
    charmGlow: charmFor(input.activity, input.context),
    speaking: Boolean(input.speaking),
    facing: input.anchor.facing,
    anchor: input.anchor,
    lifeActivity: input.activity,
  };
}
