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
