import type { ScenarioStep, DialogueEvaluation } from '../tutor/tutorEngine';

export interface LearningEvidence extends DialogueEvaluation {
  confidence: number;
  matchedConcepts: string[];
  missingConcepts: string[];
  partialUnderstanding: boolean;
  hintDependency: 'none' | 'light' | 'moderate' | 'high';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[。、！？!?.,]/g, ' ')
    .replace(/\s+/g, ' ');

const conceptVariants = (concept: string): string[] => {
  const key = normalize(concept);
  const variants: Record<string, string[]> = {
    'arigatou gozaimasu': ['arigatou gozaimasu', 'arigato gozaimasu', 'ありがとう', 'ありがとうございます'],
    arigatou: ['arigatou', 'arigato', 'ありがとう', 'ありがと'],
    onegai: ['onegai', 'onegaishimasu', 'お願いします'],
    kudasai: ['kudasai', 'ください'],
    matcha: ['matcha', '抹茶'],
    coffee: ['coffee', 'コーヒー'],
    tennai: ['tennai', '店内'],
    hai: ['hai', 'はい'],
    koko: ['koko', 'ここ'],
    takeout: ['takeout', 'take out', '持ち帰り'],
    dango: ['dango', '団子', 'お団子'],
    ikura: ['ikura', 'いくら'],
    hitotsu: ['hitotsu', 'ひとつ', '一つ'],
    mukashibanashi: ['mukashibanashi', '昔話'],
    hon: ['hon', '本'],
    'arimasu ka': ['arimasu ka', 'ありますか'],
    kyoto: ['kyoto', '京都'],
    sugoi: ['sugoi', 'すごい'],
    utsukushii: ['utsukushii', '美しい'],
    yomimasu: ['yomimasu', '読みます'],
  };
  return variants[key] ?? [key];
};

export class LearningEvaluationEngine {
  evaluate(
    userInput: string,
    step: ScenarioStep,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    hintUsed = false,
  ): LearningEvidence {
    const input = normalize(userInput);
    if (!input) {
      return {
        isCorrect: false,
        score: 0,
        confidence: 0,
        matchedConcepts: [],
        missingConcepts: step.expectedConcepts,
        partialUnderstanding: false,
        hintDependency: hintUsed ? 'high' : 'none',
        difficulty,
        feedback: 'Give it a try! You can use the hint or a sample phrase as a model.',
        cassidyHint: step.hint,
      };
    }

    const matchedConcepts = step.expectedConcepts.filter((concept) =>
      conceptVariants(concept).some((variant) => input.includes(normalize(variant)))
    );
    const missingConcepts = step.expectedConcepts.filter((concept) => !matchedConcepts.includes(concept));

    const sampleMatch = step.sampleResponses.some((sample) => {
      const text = normalize(sample.text);
      const translation = normalize(sample.translation);
      return input === text || text.includes(input) || input.includes(text) || translation.includes(input);
    });

    const conceptCoverage = step.expectedConcepts.length
      ? matchedConcepts.length / step.expectedConcepts.length
      : 0;

    // Samples are strong evidence, while concept coverage supports natural variations.
    // Difficulty slightly raises the evidence threshold for an unassisted answer.
    const difficultyBonus = difficulty === 'advanced' ? 0.08 : difficulty === 'intermediate' ? 0.04 : 0;
    const strongEnough = sampleMatch || conceptCoverage >= Math.max(0.5, 0.6 + difficultyBonus);
    const partial = !strongEnough && conceptCoverage > 0;

    let score = sampleMatch ? 96 : Math.round(45 + conceptCoverage * 50);
    if (partial) score = Math.min(score, 74);
    if (hintUsed) score = Math.max(0, score - (strongEnough ? 8 : 5));
    score = Math.max(0, Math.min(100, score));

    const confidence = Math.max(0, Math.min(1,
      (sampleMatch ? 0.95 : 0.45 + conceptCoverage * 0.5) - (hintUsed ? 0.08 : 0)
    ));

    const hintDependency = !hintUsed ? 'none' : strongEnough ? 'light' : partial ? 'moderate' : 'high';

    if (strongEnough) {
      return {
        isCorrect: true,
        score,
        confidence,
        matchedConcepts,
        missingConcepts,
        partialUnderstanding: false,
        hintDependency,
        difficulty,
        feedback: hintUsed
          ? 'Nice work! The hint helped, and you still communicated the intended meaning.'
          : 'Great communication! Your response captured the intended meaning naturally.',
        cassidyHint: hintUsed ? 'Cassidy noticed you used a little support — that still counts as learning.' : 'Spot on! That sounded natural.',
        culturalInsight: 'Polite language and context matter as much as vocabulary in real conversations.',
      };
    }

    if (partial) {
      return {
        isCorrect: false,
        score,
        confidence,
        matchedConcepts,
        missingConcepts,
        partialUnderstanding: true,
        hintDependency,
        difficulty,
        feedback: `You caught part of the meaning. Try adding what is missing: ${missingConcepts.slice(0, 2).join(' / ')}.`,
        cassidyHint: step.hint,
        suggestedFollowUp: 'Try again using the hint, then put the idea into your own words.',
      };
    }

    return {
      isCorrect: false,
      score,
      confidence,
      matchedConcepts,
      missingConcepts,
      partialUnderstanding: false,
      hintDependency,
      difficulty,
      feedback: `Good attempt! Focus on the situation first, then try a natural response such as: ${step.sampleResponses[0]?.text ?? step.hint}`,
      cassidyHint: step.hint,
      suggestedFollowUp: 'Try again using the hint, or choose a sample phrase as a model.',
    };
  }
}

export const learningEvaluationEngine = new LearningEvaluationEngine();
