import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { OptimizeDeckParallelResult } from "../../engine/index-browser.ts";

export const userIdAtom = atomWithStorage("yfm3_user_id", "user_1750627178536_oh9nqp874");
export const isOptimizingAtom = atom(false);
export const resultAtom = atom<OptimizeDeckParallelResult | null>(null);
