import { useMutation } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api.js";
import type { Collection } from "../../../engine/data/card-model.ts";
import type { OptimizeDeckParallelResult } from "../../../engine/index-browser.ts";
import { optimizeDeckParallel } from "../../../engine/index-browser.ts";
import {
  useDeckSize,
  useFusionDepth,
  useUseEquipment,
  useUserPreferences,
} from "../../db/use-user-preferences.ts";
import {
  type PostDuelState,
  postDuelCurrentDeckAtom,
  postDuelLiveBestScoreAtom,
  postDuelProgressAtom,
  postDuelResultAtom,
  postDuelStateAtom,
} from "../../lib/atoms.ts";
import type { EmulatorBridge } from "../../lib/use-emulator-bridge.ts";
import { useSelectedMod } from "../../lib/use-selected-mod.ts";

/** Time budget for post-duel optimization (shorter than manual 15s). */
const POST_DUEL_TIME_LIMIT = 10_000;

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
 * Detect when a duel is active and the collection changes (cards won),
 * then automatically run a full deck re-optimization and surface the result.
 *
 * State machine:
 *   idle → duel_active → optimizing → result | no_change
 *
 * `inDuel` is true whenever the duel-phase byte is a recognized mid-duel
 * value (CLEANUP through POST_BATTLE). The game progresses to DUEL_END /
 * RESULTS at end-of-duel, so `inDuel` goes false reliably. We trigger on
 * collection change WHILE in duel_active (the game writes all 15 loot
 * cards atomically in a single RAM update).
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

  const deckSize = useDeckSize();
  const fusionDepth = useFusionDepth();
  const useEquipment = useUseEquipment();
  const modId = useSelectedMod();
  const prefs = useUserPreferences();
  const savePreferences = useMutation(api.userPreferences.updatePreferences);

  const wasInDuelRef = useRef(false);
  const preDuelCollectionRef = useRef<Record<number, number> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasFiredRef = useRef(false);
  // Snapshot of bridge data captured when collection changes during duel.
  const pendingOptRef = useRef<{ collection: Record<number, number>; deck: number[] } | null>(null);
  const hydratedRef = useRef(false);

  // ── Hydrate from Convex on mount ────────────────────────────────
  useEffect(() => {
    if (hydratedRef.current) return;
    if (state !== "idle") return;
    if (prefs === undefined) return; // still loading

    const saved = prefs?.postDuelSuggestion;
    hydratedRef.current = true;
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
  }, [state, prefs, setState, setResult, setCurrentDeck]);

  // ── Dismiss callback ───────────────────────────────────────────
  const dismiss = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setResult(null);
    setCurrentDeck([]);
    setProgress(0);
    setLiveBestScore(0);
    setState("idle");
    preDuelCollectionRef.current = null;
    pendingOptRef.current = null;
    hasFiredRef.current = false;
    void savePreferences({ postDuelSuggestion: null });
  }, [setState, setResult, setCurrentDeck, setProgress, setLiveBestScore, savePreferences]);

  // ── State machine: track inDuel transitions ────────────────────
  useEffect(() => {
    const isInDuel = bridge.inDuel;
    const wasInDuel = wasInDuelRef.current;
    wasInDuelRef.current = isInDuel;

    // Diagnostic: log every inDuel change
    if (isInDuel !== wasInDuel) {
      console.log(
        `[PostDuel] inDuel: ${String(wasInDuel)} → ${String(isInDuel)}, phase: ${bridge.phase}`,
      );
    }

    // Transition: entering a duel (inDuel goes false→true)
    if (isInDuel && !wasInDuel) {
      console.log(`[PostDuel] Duel started — phase: ${bridge.phase}`);
      // Abort any running optimization from a previous duel
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      pendingOptRef.current = null;

      preDuelCollectionRef.current = bridge.collection ? { ...bridge.collection } : null;
      hasFiredRef.current = false;
      setResult(null);
      setCurrentDeck([]);
      setProgress(0);
      setLiveBestScore(0);
      setState("duel_active");
      void savePreferences({ postDuelSuggestion: null });
    }
  }, [
    bridge.inDuel,
    bridge.phase,
    bridge.collection,
    setState,
    setResult,
    setCurrentDeck,
    setProgress,
    setLiveBestScore,
    savePreferences,
  ]);

  // ── State machine: collection changes during duel → optimize ───
  // The game writes all 15 loot cards atomically. No debounce needed.
  // We trigger only once per duel via hasFiredRef.
  useEffect(() => {
    if (state !== "duel_active") return;
    if (hasFiredRef.current) return;
    if (!bridge.collection || !preDuelCollectionRef.current) return;

    const newCards = findNewCards(preDuelCollectionRef.current, bridge.collection);
    if (newCards.length === 0) return;

    console.log(
      `[PostDuel] Collection changed during duel: ${String(newCards.length)} new card(s)`,
    );
    hasFiredRef.current = true;

    // Snapshot data for optimization
    if (bridge.collection && bridge.deckDefinition) {
      pendingOptRef.current = {
        collection: { ...bridge.collection },
        deck: [...bridge.deckDefinition],
      };
    }

    setState("optimizing");
  }, [state, bridge.collection, bridge.deckDefinition, setState]);

  // ── State machine: run optimization ────────────────────────────
  useEffect(() => {
    if (state !== "optimizing") return;
    const snapshot = pendingOptRef.current;
    if (!snapshot) {
      setState("idle");
      return;
    }

    // Verify we have enough cards for a deck
    let totalCards = 0;
    for (const count of Object.values(snapshot.collection)) {
      totalCards += count;
    }
    if (totalCards < deckSize) {
      setState("idle");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const col: Collection = new Map(
      Object.entries(snapshot.collection).map(([id, qty]) => [Number(id), qty]),
    );

    const deckForOpt = snapshot.deck.filter((id) => id > 0);
    setCurrentDeck(deckForOpt);

    optimizeDeckParallel(col, {
      timeLimit: POST_DUEL_TIME_LIMIT,
      signal: controller.signal,
      currentDeck: deckForOpt.length === deckSize ? deckForOpt : undefined,
      deckSize,
      fusionDepth,
      useEquipment,
      modId,
      onProgress: (p, bestScore) => {
        setProgress(p);
        setLiveBestScore(bestScore);
      },
    })
      .then((res) => {
        if (controller.signal.aborted) return;

        const hasImprovement = res.improvement != null && res.improvement > 0;
        setResult(res);
        setState(hasImprovement ? "result" : "no_change");
        void savePreferences({
          postDuelSuggestion: {
            deck: res.deck,
            expectedAtk: res.expectedAtk,
            currentDeckScore: res.currentDeckScore ?? null,
            improvement: res.improvement ?? null,
            elapsedMs: res.elapsedMs,
            currentDeck: deckForOpt,
          },
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState("idle");
        }
      })
      .finally(() => {
        setProgress(0);
        setLiveBestScore(0);
        abortControllerRef.current = null;
        pendingOptRef.current = null;
      });

    return () => {
      controller.abort();
    };
  }, [
    state,
    deckSize,
    fusionDepth,
    useEquipment,
    modId,
    setState,
    setResult,
    setCurrentDeck,
    setProgress,
    setLiveBestScore,
    savePreferences,
  ]);

  // ── React to Convex deck changes while showing result ─────────
  // Convex subscriptions only fire on actual data changes, so no
  // manual deduplication is needed (unlike bridge polling).
  useEffect(() => {
    if (state !== "result" || !result || !deckCardIds) return;

    if (decksMatch(deckCardIds, result.deck)) {
      // All suggestions applied — auto-dismiss
      dismiss();
      return;
    }

    // Deck changed but doesn't fully match suggestion — update diff
    if (!decksMatch(deckCardIds, currentDeck)) {
      setCurrentDeck(deckCardIds);
      void savePreferences({
        postDuelSuggestion: {
          deck: result.deck,
          expectedAtk: result.expectedAtk,
          currentDeckScore: result.currentDeckScore ?? null,
          improvement: result.improvement ?? null,
          elapsedMs: result.elapsedMs,
          currentDeck: deckCardIds,
        },
      });
    }
  }, [state, result, deckCardIds, currentDeck, dismiss, setCurrentDeck, savePreferences]);

  // ── Cleanup on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

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

/** Find card IDs whose quantity increased between two collection snapshots. */
export function findNewCards(
  before: Record<number, number>,
  after: Record<number, number>,
): number[] {
  const newCards: number[] = [];
  for (const [idStr, qty] of Object.entries(after)) {
    const id = Number(idStr);
    const prevQty = before[id] ?? 0;
    if (qty > prevQty) {
      newCards.push(id);
    }
  }
  return newCards;
}
