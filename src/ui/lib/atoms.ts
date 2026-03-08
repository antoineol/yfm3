import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { OptimizeDeckParallelResult } from "../../engine/index-browser.ts";
import { DECK_SIZE } from "../../engine/types/constants.ts";

export const userIdAtom = atomWithStorage("yfm3_user_id", "");
export const deckSizeAtom = atom(DECK_SIZE);
export const isOptimizingAtom = atom(false);
export const resultAtom = atom<OptimizeDeckParallelResult | null>(null);
