import { Cassidy } from '../../characters/cassidy';
import { decideCassidyAction } from './cassidyAutonomyEngine';
import { executeCassidyDecision, type CassidyAction } from './cassidyActionEngine';
import { presentCassidyAction, type CassidyPresentation } from './cassidyPresentationEngine';
import type { WorldLearningOutcome } from '../learning/worldLearningOutcomeEngine';

export type CassidyLearningReaction={action:CassidyAction;presentation:CassidyPresentation;reason:string};

export function reactToWorldLearningOutcome(outcome:WorldLearningOutcome):CassidyLearningReaction{
  const decision=decideCassidyAction({
    worldMode:'journey',
    worldId:outcome.worldId,
    placeId:outcome.placeId,
    learner:{isExploring:false,needsHelp:!outcome.success,recentlySucceeded:outcome.success,recentTopic:outcome.goal},
    time:{minutesSinceCassidySpoke:10},
    learnerNeedsHelp:!outcome.success,
    learnerRecentlySucceeded:outcome.success,
    learnerIsExploring:false,
    minutesSinceCassidySpoke:10,
  });
  const action=executeCassidyDecision(decision);
  const presentation=presentCassidyAction(action);
  const characterText=outcome.success?Cassidy.lineFor('excited'):Cassidy.lineFor('thinking');
  return {action:{...action,text:characterText},presentation:{...presentation,text:characterText},reason:decision.reason};
}

export const cassidyLearningReactionEngine={react:reactToWorldLearningOutcome};
