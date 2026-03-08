import { setConfig } from "../config.ts";
import { initializeBuffersBrowser } from "../initialize-buffers-browser.ts";
import { mulberry32 } from "../mulberry32.ts";
import { exactScore } from "../scoring/exact-scorer.ts";
import { FusionScorer } from "../scoring/fusion-scorer.ts";
import type { ScorerInit, ScorerResult } from "./messages.ts";

self.onmessage = (e: MessageEvent<ScorerInit>) => {
  const { collection, deck, config } = e.data;
  setConfig(config);

  const collectionMap = new Map(
    Object.entries(collection).map(([id, qty]) => [Number(id), qty as number]),
  );
  const buf = initializeBuffersBrowser(collectionMap, mulberry32(42));
  for (let i = 0; i < deck.length; i++) {
    buf.deck[i] = deck[i] ?? 0;
  }
  const scorer = new FusionScorer();
  const expectedAtk = exactScore(buf, scorer);

  const result: ScorerResult = {
    type: "SCORE_RESULT",
    expectedAtk,
  };
  self.postMessage(result);
};
