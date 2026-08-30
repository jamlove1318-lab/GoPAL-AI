import { worldStateEngine } from './worldStateEngine';
import { WorldVisualConsequence } from './worldVisualConsequenceEngine';

/** Turns persistent visual changes into discoverable parts of the living world. */
export async function noticeWorldConsequence(consequence: WorldVisualConsequence) {
  const key = `consequence:${consequence.id}:noticed`;
  await worldStateEngine.mark(key);

  if (consequence.kind === 'library_clue') {
    await worldStateEngine.mark('resident:emi:clue-noticed');
  }

  if (consequence.kind === 'cafe_guest') {
    await worldStateEngine.mark('resident:ren:guest-noticed');
  }

  if (consequence.kind === 'market_lanterns') {
    await worldStateEngine.mark('resident:kenji:market-change-noticed');
  }

  return key;
}
