import { useState, useCallback, useRef } from 'react';
import { tutorEngine, SCENARIOS, ScenarioDefinition, ScenarioStep, DialogueEvaluation } from '../engines/tutor/tutorEngine';
import { learningEvaluationEngine, LearningEvidence } from '../engines/learning/learningEvaluationEngine';
import { KnowledgeEngine } from '../engines/knowledge/knowledgeEngine';
import { JourneyEngine } from '../engines/journey/journeyEngine';
import { LocalStore } from '../lib/localStore';
import { WaveStore } from '../lib/waveStore';
import { eventBus } from '../engines/events/eventBus';

export function useLearningSession(userId = 'local-explorer-user') {
  const [activeScenario, setActiveScenario] = useState<ScenarioDefinition | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [evaluation, setEvaluation] = useState<LearningEvidence | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const completionRecordedRef = useRef(false);
  const stepEvidenceRef = useRef<LearningEvidence[]>([]);
  const hintUsedRef = useRef(false);

  const completeScenario = useCallback(
    async (scenario: ScenarioDefinition, finalEvaluation: LearningEvidence) => {
      const nodes = await LocalStore.getKnowledgeNodes();
      const context = `scenario:${scenario.id}`;
      const evidence = stepEvidenceRef.current;
      const matchedConcepts = Array.from(new Set(evidence.flatMap((item) => item.matchedConcepts)));

      const effects: Promise<unknown>[] = [
        LocalStore.addMemory(
          'conversation',
          `Successfully completed real-world dialogue scenario "${scenario.title}" with ${scenario.characterName}.`
        ),
        LocalStore.addJourneyEvent(
          'conversation:completed',
          {
            topic: scenario.title,
            location: scenario.locationName,
            character: scenario.characterName,
            accuracy: finalEvaluation.accuracy,
            conceptsDemonstrated: matchedConcepts,
          },
          'tutor_engine'
        ),
        new JourneyEngine().earnSouvenir(
          `Conversation: ${scenario.title}`,
          'memory',
          `Held a full dialogue with ${scenario.characterName} at ${scenario.locationName}.`,
          userId
        ),
        WaveStore.recordDecision(`Completed "${scenario.title}" and chose to follow it through.`),
      ];

      if (matchedConcepts.length > 0) {
        effects.push(
          (async () => {
            for (const conceptKey of matchedConcepts) {
              const node = nodes.find((nodeItem) => nodeItem.key === conceptKey);
              const label = node ? `${node.term} (${node.reading})` : conceptKey;
              await KnowledgeEngine.recordLearningEcho(conceptKey, label, context);
            }
          })()
        );
      }

      await Promise.allSettled(effects);

      eventBus.emit(
        'learning:sessionCompleted',
        {
          sessionId: scenario.id,
          accuracy: finalEvaluation.accuracy,
          activityType: 'real-world-dialogue',
          conceptsDemonstrated: matchedConcepts,
        },
        'learning'
      );
    },
    [userId]
  );

  const startScenario = useCallback((scenarioIdOrLocationKey: string) => {
    const matched =
      SCENARIOS.find((s) => s.id === scenarioIdOrLocationKey) ||
      SCENARIOS.find((s) => s.locationKey === scenarioIdOrLocationKey) ||
      SCENARIOS[0];

    completionRecordedRef.current = false;
    stepEvidenceRef.current = [];
    hintUsedRef.current = false;
    setActiveScenario(matched);
    setCurrentStepIndex(0);
    setEvaluation(null);
    setSessionCompleted(false);
    setIsSessionActive(true);
  }, []);

  const endSession = useCallback(() => {
    completionRecordedRef.current = false;
    stepEvidenceRef.current = [];
    hintUsedRef.current = false;
    setIsSessionActive(false);
    setActiveScenario(null);
    setEvaluation(null);
    setSessionCompleted(false);
  }, []);

  const submitResponse = useCallback(
    async (userInput: string) => {
      if (!activeScenario || completionRecordedRef.current) return null;
      const step = activeScenario.steps[currentStepIndex];
      const evalResult = learningEvaluationEngine.evaluate(
        userInput,
        step,
        activeScenario.difficulty,
        hintUsedRef.current,
      );
      setEvaluation(evalResult);
      stepEvidenceRef.current = [
        ...stepEvidenceRef.current.filter((_, index) => index !== currentStepIndex),
        evalResult,
      ];

      if (evalResult.isCorrect && currentStepIndex + 1 >= activeScenario.steps.length) {
        completionRecordedRef.current = true;
        setSessionCompleted(true);
        await completeScenario(activeScenario, evalResult);
      }
      return evalResult;
    },
    [activeScenario, currentStepIndex, completeScenario]
  );

  const nextStep = useCallback(() => {
    if (!activeScenario || completionRecordedRef.current) return;
    if (currentStepIndex + 1 < activeScenario.steps.length) {
      setCurrentStepIndex((prev) => prev + 1);
      setEvaluation(null);
      hintUsedRef.current = false;
    }
  }, [activeScenario, currentStepIndex]);

  const currentStep: ScenarioStep | null =
    activeScenario && activeScenario.steps[currentStepIndex]
      ? activeScenario.steps[currentStepIndex]
      : null;

  return {
    isSessionActive,
    activeScenario,
    currentStep,
    currentStepIndex,
    totalSteps: activeScenario ? activeScenario.steps.length : 0,
    evaluation,
    sessionCompleted,
    startScenario,
    submitResponse,
    nextStep,
    endSession,
  };
}
