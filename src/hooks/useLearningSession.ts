import { useState, useCallback, useRef } from 'react';
import { tutorEngine, SCENARIOS, ScenarioDefinition, ScenarioStep, DialogueEvaluation } from '../engines/tutor/tutorEngine';
import { LocalStore } from '../lib/localStore';

export function useLearningSession() {
  const [activeScenario, setActiveScenario] = useState<ScenarioDefinition | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [evaluation, setEvaluation] = useState<DialogueEvaluation | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const completionRecordedRef = useRef(false);

  const startScenario = useCallback((scenarioIdOrLocationKey: string) => {
    const matched =
      SCENARIOS.find((s) => s.id === scenarioIdOrLocationKey) ||
      SCENARIOS.find((s) => s.locationKey === scenarioIdOrLocationKey) ||
      SCENARIOS[0];

    completionRecordedRef.current = false;
    setActiveScenario(matched);
    setCurrentStepIndex(0);
    setEvaluation(null);
    setSessionCompleted(false);
    setIsSessionActive(true);
  }, []);

  const endSession = useCallback(() => {
    completionRecordedRef.current = false;
    setIsSessionActive(false);
    setActiveScenario(null);
    setEvaluation(null);
    setSessionCompleted(false);
  }, []);

  const submitResponse = useCallback(
    async (userInput: string) => {
      if (!activeScenario || completionRecordedRef.current) return null;
      const step = activeScenario.steps[currentStepIndex];
      const evalResult = tutorEngine.evaluateInput(userInput, step);
      setEvaluation(evalResult);

      if (evalResult.isCorrect && currentStepIndex + 1 >= activeScenario.steps.length) {
        // Mark synchronously before any awaited persistence work so rapid retries
        // cannot record the same completed dialogue twice.
        completionRecordedRef.current = true;
        setSessionCompleted(true);

        await LocalStore.addMemory(
          'conversation',
          `Successfully completed real-world dialogue scenario "${activeScenario.title}" with ${activeScenario.characterName}.`
        );
        await LocalStore.addJourneyEvent(
          'conversation:completed',
          {
            topic: activeScenario.title,
            location: activeScenario.locationName,
            character: activeScenario.characterName,
          },
          'tutor_engine'
        );
      }
      return evalResult;
    },
    [activeScenario, currentStepIndex]
  );

  const nextStep = useCallback(() => {
    if (!activeScenario || completionRecordedRef.current) return;
    if (currentStepIndex + 1 < activeScenario.steps.length) {
      setCurrentStepIndex((prev) => prev + 1);
      setEvaluation(null);
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
