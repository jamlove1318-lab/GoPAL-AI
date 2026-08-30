import { Cassidy } from '../../characters/cassidy';
import { decideCassidyAction } from './cassidyAutonomyEngine';
import { executeCassidyDecision, type CassidyAction } from './cassidyActionEngine';
import { presentCassidyAction, type CassidyPresentation } from './cassidyPresentationEngine';
import type { WorldLearningOutcome } from '../learning/worldLearningOutcomeEngine';

export type CassidyLearningReaction={action:CassidyAction;presentation:CassidyPresentation;reason:string};
export type CassidyLearningContext={residentId?:string;familiarity?:number;trust?:number;worldEchoId?:string};

export function reactToWorldLearningOutcome(outcome:WorldLearningOutcome,context:CassidyLearningContext={}):CassidyLearningReaction{
  const relationship=context.residentId?{residentId:context.residentId,familiarity:context.familiarity??0,trust:context.trust??0}:undefined;
  const decision=decideCassidyAction({
    worldMode:'journey',
    worldId:outcome.worldId,
    placeId:outcome.placeId,
    learner:{isExploring:false,needsHelp:!outcome.success,recentlySucceeded:outcome.success,recentTopic:outcome.goal},
    relationship,
    time:{minutesSinceCassidySpoke:10},
    learnerNeedsHelp:!outcome.success,
    learnerRecentlySucceeded:outcome.success,
    learnerIsExploring:false,
    minutesSinceCassidySpoke:10,
  });
  const action=executeCassidyDecision(decision);
  const presentation=presentCassidyAction(action);
  const characterText=outcome.success?Cassidy.lineFor('excited'):Cassidy.lineFor('thinking');
  return {action:{...action,text:characterText},presentation:{...presentation,text:characterText},reason:context.worldEchoId?`${decision.reason} Cassidy can also notice that this moment left a lasting echo.`:decision.reason};
}

export const cassidyLearningReactionEngine={react:reactToWorldLearningOutcome};
