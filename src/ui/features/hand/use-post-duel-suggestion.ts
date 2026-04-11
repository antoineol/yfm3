import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import type { OptimizeDeckParallelResult } from "../../../engine/index-browser.ts";
import { modIdForFingerprint } from "../../../engine/mods.ts";
import { useBridgeAutoSync } from "../../db/use-user-preferences.ts";
import {
  type PostDuelState,
  postDuelCurrentDeckAtom,
  postDuelLiveBestScoreAtom,
  postDuelProgressAtom,
  postDuelResultAtom,
  postDuelStateAtom,
} from "../../lib/atoms.ts";
import type { EmulatorBridge } from "../../lib/bridge-message-processor.ts";
import {
  type LocalPostDuelSuggestion,
  postDuelSuggestionKey,
} from "../../lib/bridge-snapshot-atoms.ts";
import { readLocal, removeLocal, writeLocal } from "../../lib/local-store.ts";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";
import {
  type CollectionSnapshot,
  useDuelCollectionTracker,
} from "./use-duel-collection-tracker.ts";
import { useOptimizationRunner } from "./use-optimization-runner.ts";

export interface PostDuelSuggestion {
  state: PostDuelState;
  progress: number;
  liveBestScore: number;
  result: OptimizeDeckParallelResult | null;
  /** The deck that was current when optimization started (used to compute diff). */
  currentDeck: number[];
  dismiss: () => void;
}

/**
 * Detect when a duel ends and the collection changes (cards won),
 * then run a full deck re-optimization and surface the result.
 *
 * Composes:
 * - useDuelCollectionTracker — bridge monitoring (duel transitions + collection changes)
 * - useOptimizationRunner — worker lifecycle (abort, progress, result)
 */
export function usePostDuelSuggestion(
  bridge: EmulatorBridge,
  deckCardIds: number[] | undefined,
): PostDuelSuggestion {
  const state = useAtomValue(postDuelStateAtom);
  const setState = useSetAtom(postDuelStateAtom);
  const result = useAtomValue(postDuelResultAtom);
  const setResult = useSetAtom(postDuelResultAtom);
  const currentDeck = useAtomValue(postDuelCurrentDeckAtom);
  const setCurrentDeck = useSetAtom(postDuelCurrentDeckAtom);
  const progress = useAtomValue(postDuelProgressAtom);
  const setProgress = useSetAtom(postDuelProgressAtom);
  const liveBestScore = useAtomValue(postDuelLiveBestScoreAtom);
  const setLiveBestScore = useSetAtom(postDuelLiveBestScoreAtom);

  const modId = useSelectedMod();

  const saveSuggestion = useCallback(
    (suggestion: LocalPostDuelSuggestion | null) => {
      if (suggestion) {
        writeLocal(postDuelSuggestionKey(modId), suggestion);
      } else {
        removeLocal(postDuelSuggestionKey(modId));
      }
    },
    [modId],
  );

  // In autosync mode all game data is read dynamically — fingerprint/mismatch is meaningless.
  const autoSync = useBridgeAutoSync();
  const detectedMod =
    !autoSync && bridge.modFingerprint ? modIdForFingerprint(bridge.modFingerprint) : null;
  const modMismatch = detectedMod !== null && detectedMod !== modId;

  // Snapshot is managed here so tracker callbacks (called synchronously from
  // effects) batch state updates with Jotai atom writes in a single render.
  const [optimizationSnapshot, setOptimizationSnapshot] = useState<CollectionSnapshot | null>(null);

  // ── Tracker callbacks ──────────────────────────────────────────
  const handleDuelStart = useCallback(() => {
    setOptimizationSnapshot(null);
    setResult(null);
    setCurrentDeck([]);
    setProgress(0);
    setLiveBestScore(0);
    setState("duel_active");
    saveSuggestion(null);
  }, [setState, setResult, setCurrentDeck, setProgress, setLiveBestScore, saveSuggestion]);

  const handleNewCards = useCallback(
    (snapshot: CollectionSnapshot) => {
      setOptimizationSnapshot(snapshot);
      setCurrentDeck(snapshot.deck.filter((id) => id > 0));
      setState("optimizing");
    },
    [setState, setCurrentDeck],
  );

  useDuelCollectionTracker(bridge, modMismatch, handleDuelStart, handleNewCards);

  // ── Optimization callbacks ─────────────────────────────────────
  const handleComplete = useCallback(
    (res: OptimizeDeckParallelResult, deckForOpt: number[]) => {
      const hasImprovement = res.improvement != null && res.improvement > 0;
      setResult(res);
      setState(hasImprovement ? "result" : "no_change");
      saveSuggestion({
        deck: res.deck,
        expectedAtk: res.expectedAtk,
        currentDeckScore: res.currentDeckScore ?? null,
        improvement: res.improvement ?? null,
        elapsedMs: res.elapsedMs,
        currentDeck: deckForOpt,
      });
    },
    [setState, setResult, saveSuggestion],
  );

  const handleError = useCallback(() => {
    setState("idle");
  }, [setState]);

  const runner = useOptimizationRunner(
    optimizationSnapshot,
    { modId, gameData: bridge.gameData },
    { onComplete: handleComplete, onError: handleError },
  );

  // ── Hydrate from persisted state on mount ────────────────────
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (state !== "idle") return;
    hydratedRef.current = true;

    const saved = readLocal<LocalPostDuelSuggestion>(postDuelSuggestionKey(modId));
    if (!saved) return;

    const hasImprovement = saved.improvement != null && saved.improvement > 0;
    setResult({
      deck: saved.deck,
      expectedAtk: saved.expectedAtk,
      currentDeckScore: saved.currentDeckScore,
      improvement: saved.improvement,
      elapsedMs: saved.elapsedMs,
    });
    setCurrentDeck(saved.currentDeck);
    setState(hasImprovement ? "result" : "no_change");
  }, [state, modId, setState, setResult, setCurrentDeck]);

  // ── Dismiss ─────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    runner.abort();
    setOptimizationSnapshot(null);
    setResult(null);
    setCurrentDeck([]);
    setProgress(0);
    setLiveBestScore(0);
    setState("idle");
    saveSuggestion(null);
  }, [runner, setState, setResult, setCurrentDeck, setProgress, setLiveBestScore, saveSuggestion]);

  // ── React to deck changes while showing result ────────────────
  useEffect(() => {
    if (state !== "result" || !result || !deckCardIds) return;

    if (decksMatch(deckCardIds, result.deck)) {
      dismiss();
      return;
    }

    if (!decksMatch(deckCardIds, currentDeck)) {
      setCurrentDeck(deckCardIds);
      saveSuggestion({
        deck: result.deck,
        expectedAtk: result.expectedAtk,
        currentDeckScore: result.currentDeckScore ?? null,
        improvement: result.improvement ?? null,
        elapsedMs: result.elapsedMs,
        currentDeck: deckCardIds,
      });
    }
  }, [state, result, deckCardIds, currentDeck, dismiss, setCurrentDeck, saveSuggestion]);

  return { state, progress, liveBestScore, result, currentDeck, dismiss };
}

/** Check whether two decks contain the same cards (order-independent). */
export function decksMatch(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const countsA = new Map<number, number>();
  for (const id of a) countsA.set(id, (countsA.get(id) ?? 0) + 1);
  const countsB = new Map<number, number>();
  for (const id of b) countsB.set(id, (countsB.get(id) ?? 0) + 1);
  if (countsA.size !== countsB.size) return false;
  for (const [id, qty] of countsA) {
    if (countsB.get(id) !== qty) return false;
  }
  return true;
}
