import { atom } from "jotai";
import type { CardId } from "../../engine/data/card-model.ts";
import type { OptimizeDeckParallelResult } from "../../engine/index-browser.ts";

export const isOptimizingAtom = atom(false);
export const resultAtom = atom<OptimizeDeckParallelResult | null>(null);
export const liveBestScoreAtom = atom(0);
export const liveBestDeckAtom = atom<number[]>([]);
/** Cached exact expected-ATK of the current (saved) deck. `null` = not yet computed / deck incomplete. */
export const currentDeckScoreAtom = atom<number | null>(null);

/** Card currently shown in the detail modal. `null` = modal closed. */
export const openCardIdAtom = atom<CardId | null>(null);

/** Active sub-tab within the Deck panel on mobile. */
export type DeckSubTab = "collection" | "deck" | "result";
export const deckSubTabAtom = atom<DeckSubTab>("collection");

// ── Post-duel suggestion atoms (persist across tab switches) ─────────

export type PostDuelState = "idle" | "duel_active" | "optimizing" | "result" | "no_change";

export const postDuelStateAtom = atom<PostDuelState>("idle");
export const postDuelResultAtom = atom<OptimizeDeckParallelResult | null>(null);
/** The deck that was current when the post-duel optimization started (needed to compute diff). */
export const postDuelCurrentDeckAtom = atom<number[]>([]);
export const postDuelProgressAtom = atom(0);
export const postDuelLiveBestScoreAtom = atom(0);
