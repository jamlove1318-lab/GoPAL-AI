import { CassidyAction } from '../../characters/cassidy';
import { CassidyPresenceContext } from './cassidyWorldPresenceEngine';
import type { CassidyLifeActivity } from './cassidyLifeEngine';
import { LanguageWorldId, resolveLanguageWorld } from '../world/languageWorldEngine';

export type CassidyPhysicalAnchor = {
  id: string;
  x: number;
  y: number;
  facing?: 'left' | 'right';
  activity?: CassidyLifeActivity;
};

export type CassidySceneAnchor = {
  left: string;
  top: string;
  height: number;
  action: CassidyAction;
  facing: 'left' | 'right';
  physicalAnchorId?: string;
};

const WORLD_ANCHORS: Record<LanguageWorldId, Record<CassidyPresenceContext, CassidySceneAnchor>> = {
  ja: {
    exploring: { left: '16%', top: '48%', height: 92, action: 'walking', facing: 'right' },
    learning: { left: '25%', top: '45%', height: 108, action: 'talking', facing: 'right' },
    confused: { left: '30%', top: '44%', height: 102, action: 'idle', facing: 'right' },
    success: { left: '22%', top: '43%', height: 108, action: 'waving', facing: 'right' },
    quiet: { left: '12%', top: '52%', height: 84, action: 'idle', facing: 'right' },
    returning: { left: '18%', top: '47%', height: 100, action: 'waving', facing: 'right' },
  },
  es: {
    exploring: { left: '72%', top: '46%', height: 96, action: 'walking', facing: 'left' },
    learning: { left: '62%', top: '43%', height: 110, action: 'talking', facing: 'left' },
    confused: { left: '58%', top: '44%', height: 104, action: 'idle', facing: 'left' },
    success: { left: '66%', top: '42%', height: 110, action: 'waving', facing: 'left' },
    quiet: { left: '76%', top: '53%', height: 84, action: 'idle', facing: 'left' },
    returning: { left: '70%', top: '47%', height: 100, action: 'waving', facing: 'left' },
  },
  fr: {
    exploring: { left: '20%', top: '43%', height: 92, action: 'walking', facing: 'right' },
    learning: { left: '28%', top: '40%', height: 108, action: 'talking', facing: 'right' },
    confused: { left: '25%', top: '42%', height: 102, action: 'idle', facing: 'right' },
    success: { left: '31%', top: '39%', height: 108, action: 'waving', facing: 'right' },
    quiet: { left: '14%', top: '50%', height: 82, action: 'idle', facing: 'right' },
    returning: { left: '22%', top: '44%', height: 98, action: 'waving', facing: 'right' },
  },
  ko: {
    exploring: { left: '68%', top: '50%', height: 94, action: 'walking', facing: 'left' },
    learning: { left: '58%', top: '46%', height: 110, action: 'talking', facing: 'left' },
    confused: { left: '55%', top: '47%', height: 104, action: 'idle', facing: 'left' },
    success: { left: '63%', top: '44%', height: 110, action: 'waving', facing: 'left' },
    quiet: { left: '74%', top: '55%', height: 84, action: 'idle', facing: 'left' },
    returning: { left: '67%', top: '49%', height: 100, action: 'waving', facing: 'left' },
  },
};

const LIFE_CONTEXT: Record<CassidyLifeActivity, CassidyPresenceContext> = {
  wandering: 'exploring',
  cafe: 'quiet',
  reading: 'quiet',
  'watching-rain': 'quiet',
  stargazing: 'quiet',
  dreaming: 'quiet',
  storytelling: 'learning',
  adventure: 'exploring',
  helping: 'learning',
  resting: 'quiet',
};

function applyPhysicalAnchor(base: CassidySceneAnchor, physicalAnchor?: CassidyPhysicalAnchor): CassidySceneAnchor {
  if (!physicalAnchor) return base;
  const action = physicalAnchor.activity
    ? (physicalAnchor.activity === 'wandering' || physicalAnchor.activity === 'adventure' ? 'walking' : physicalAnchor.activity === 'storytelling' || physicalAnchor.activity === 'helping' ? 'talking' : 'idle')
    : base.action;
  return {
    ...base,
    left: `${Math.max(0, Math.min(100, physicalAnchor.x))}%`,
    top: `${Math.max(0, Math.min(100, physicalAnchor.y))}%`,
    facing: physicalAnchor.facing ?? base.facing,
    action,
    physicalAnchorId: physicalAnchor.id,
  };
}

export function resolveCassidySceneAnchor(
  languageCode: string,
  context: CassidyPresenceContext,
  lifeActivity?: CassidyLifeActivity,
  physicalAnchor?: CassidyPhysicalAnchor
): CassidySceneAnchor {
  const world = resolveLanguageWorld(languageCode);
  const resolvedContext = lifeActivity ? LIFE_CONTEXT[lifeActivity] : context;
  const base = WORLD_ANCHORS[world.id][resolvedContext];
  if (!lifeActivity && !physicalAnchor) return base;

  const activityAdjustments: Partial<Record<CassidyLifeActivity, Pick<CassidySceneAnchor, 'height' | 'action'>>> = {
    cafe: { height: Math.max(72, base.height - 10), action: 'idle' },
    reading: { height: Math.max(72, base.height - 8), action: 'idle' },
    'watching-rain': { height: Math.max(72, base.height - 8), action: 'idle' },
    stargazing: { height: Math.max(72, base.height - 8), action: 'idle' },
    dreaming: { height: Math.max(72, base.height - 8), action: 'idle' },
    resting: { height: Math.max(72, base.height - 12), action: 'idle' },
    storytelling: { action: 'talking' },
    helping: { action: 'talking' },
    wandering: { action: 'walking' },
    adventure: { action: 'walking' },
  };

  const adjusted = lifeActivity ? { ...base, ...activityAdjustments[lifeActivity] } : base;
  return applyPhysicalAnchor(adjusted, physicalAnchor);
}

export const cassidySceneAnchorEngine = { resolve: resolveCassidySceneAnchor };
