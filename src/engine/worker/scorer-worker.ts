import { getConfig, setConfig } from "../config.ts";
import { ensureCsvLoaded, initializeBuffersBrowser } from "../initialize-buffers-browser.ts";
import { mulberry32 } from "../mulberry32.ts";
import { cleanupDeckAgainstCurrent } from "../optimizer/diff-cleanup.ts";
import { computeInitialScores } from "../scoring/compute-initial-scores.ts";
import { DeltaEvaluator } from "../scoring/delta-evaluator.ts";
import { exactScore } from "../scoring/exact-scorer.ts";
import { FusionScorer } from "../scoring/fusion-scorer.ts";
import type { OptBuffers } from "../types/buffers.ts";
import type { ScorerInit, ScorerResult } from "./messages.ts";

self.onmessage = async (e: MessageEvent<ScorerInit>) => {
  const {
    collection,
    deck,
    cleanupAgainstDeck,
    cleanupBudgetMs = 0,
    config,
    modId,
    gameData,
  } = e.data;
  setConfig(config);
  await ensureCsvLoaded(modId);

  const collectionMap = new Map(
    Object.entries(collection).map(([id, qty]) => [Number(id), qty as number]),
  );
  const buf = initializeBuffersBrowser(collectionMap, mulberry32(42), modId, gameData);
  if (!getConfig().useEquipment) buf.equipCompat.fill(0);
  applyDeck(buf, deck);

  const scorer = new FusionScorer();
  let cleanupElapsedMs: number | undefined;
  if (cleanupAgainstDeck && cleanupBudgetMs > 0) {
    const cleanupStartedAt = performance.now();
    const score = computeInitialScores(buf, scorer);
    cleanupDeckAgainstCurrent(
      buf,
      scorer,
      new DeltaEvaluator(),
      cleanupAgainstDeck,
      score,
      cleanupStartedAt + cleanupBudgetMs,
    );
    cleanupElapsedMs = performance.now() - cleanupStartedAt;
  }

  const expectedAtk = exactScore(buf, scorer);

  const result: ScorerResult = {
    type: "SCORE_RESULT",
    expectedAtk,
    deck: cleanupAgainstDeck ? Array.from(buf.deck.subarray(0, buf.scoringSlots)) : undefined,
    cleanupElapsedMs,
  };
  self.postMessage(result);
};

function applyDeck(buf: OptBuffers, deck: readonly number[]): void {
  buf.deck.fill(0);
  buf.cardCounts.fill(0);
  for (let i = 0; i < deck.length && i < buf.deck.length; i++) {
    const cardId = deck[i] ?? 0;
    buf.deck[i] = cardId;
    if (cardId > 0) buf.cardCounts[cardId] = (buf.cardCounts[cardId] ?? 0) + 1;
  }
}
