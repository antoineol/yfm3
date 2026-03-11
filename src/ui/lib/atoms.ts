import { atom } from "jotai";
import type { OptimizeDeckParallelResult } from "../../engine/index-browser.ts";

export const isOptimizingAtom = atom(false);
export const resultAtom = atom<OptimizeDeckParallelResult | null>(null);
export const liveBestScoreAtom = atom(0);
