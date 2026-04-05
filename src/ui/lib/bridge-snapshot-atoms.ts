import { atom, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import type { TargetRank } from "../../engine/ranking/rank-spectrum.ts";
import { DECK_SIZE, DEFAULT_FUSION_DEPTH } from "../../engine/types/constants.ts";
import type { CheatView, HandSourceMode } from "../db/use-user-preferences.ts";
import { readLocal, writeLocal } from "./local-store.ts";

// ── Collection & deck snapshot ──────────────────────────────────────

export const bridgeCollectionAtom = atom<Record<number, number> | null>(null);
export const bridgeDeckAtom = atom<number[] | null>(null);

export function collectionKey(modId: string) {
  return `yfm_bridge_collection:${modId}`;
}
export function deckKey(modId: string) {
  return `yfm_bridge_deck:${modId}`;
}

// ── Local settings ──────────────────────────────────────────────────

export interface LocalSettings {
  deckSize: number;
  fusionDepth: number;
  useEquipment: boolean;
  terrain: number;
  handSourceMode: HandSourceMode;
  cheatMode: boolean;
  cheatView: CheatView;
  targetRank: TargetRank;
}

const LOCAL_SETTINGS_DEFAULTS: LocalSettings = {
  deckSize: DECK_SIZE,
  fusionDepth: DEFAULT_FUSION_DEPTH,
  useEquipment: true,
  terrain: 0,
  handSourceMode: "all",
  cheatMode: false,
  cheatView: "player",
  targetRank: "S-POW",
};

function hydrateLocalSettings(): LocalSettings {
  return {
    deckSize: readLocal<number>("yfm_settings:deckSize") ?? LOCAL_SETTINGS_DEFAULTS.deckSize,
    fusionDepth:
      readLocal<number>("yfm_settings:fusionDepth") ?? LOCAL_SETTINGS_DEFAULTS.fusionDepth,
    useEquipment:
      readLocal<boolean>("yfm_settings:useEquipment") ?? LOCAL_SETTINGS_DEFAULTS.useEquipment,
    terrain: readLocal<number>("yfm_settings:terrain") ?? LOCAL_SETTINGS_DEFAULTS.terrain,
    handSourceMode:
      readLocal<HandSourceMode>("yfm_settings:handSourceMode") ??
      LOCAL_SETTINGS_DEFAULTS.handSourceMode,
    cheatMode: readLocal<boolean>("yfm_settings:cheatMode") ?? LOCAL_SETTINGS_DEFAULTS.cheatMode,
    cheatView: readLocal<CheatView>("yfm_settings:cheatView") ?? LOCAL_SETTINGS_DEFAULTS.cheatView,
    targetRank:
      readLocal<TargetRank>("yfm_settings:targetRank") ?? LOCAL_SETTINGS_DEFAULTS.targetRank,
  };
}

export const localSettingsAtom = atom<LocalSettings>(hydrateLocalSettings());

/** Persist all local settings to localStorage. */
export function persistLocalSettings(settings: LocalSettings): void {
  writeLocal("yfm_settings:deckSize", settings.deckSize);
  writeLocal("yfm_settings:fusionDepth", settings.fusionDepth);
  writeLocal("yfm_settings:useEquipment", settings.useEquipment);
  writeLocal("yfm_settings:terrain", settings.terrain);
  writeLocal("yfm_settings:handSourceMode", settings.handSourceMode);
  writeLocal("yfm_settings:cheatMode", settings.cheatMode);
  writeLocal("yfm_settings:cheatView", settings.cheatView);
  writeLocal("yfm_settings:targetRank", settings.targetRank);
}

// ── CPU swap detections ─────────────────────────────────────────────

export interface CpuSwap {
  slotIndex: number;
  fromCardId: number;
  toCardId: number;
  timestamp: number;
}

export const localCpuSwapsAtom = atom<CpuSwap[]>([]);

// ── Post-duel suggestion ────────────────────────────────────────────

export interface LocalPostDuelSuggestion {
  deck: number[];
  expectedAtk: number;
  currentDeckScore: number | null;
  improvement: number | null;
  elapsedMs: number;
  currentDeck: number[];
}

export function postDuelSuggestionKey(modId: string) {
  return `yfm_settings:postDuelSuggestion:${modId}`;
}

// ── Hydration hook ──────────────────────────────────────────────────

/** One-time hydration: loads bridge snapshot from localStorage into atoms. */
export function useHydrateBridgeSnapshot(modId: string) {
  const setCollection = useSetAtom(bridgeCollectionAtom);
  const setDeck = useSetAtom(bridgeDeckAtom);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const savedCollection = readLocal<Record<number, number>>(collectionKey(modId));
    const savedDeck = readLocal<number[]>(deckKey(modId));
    if (savedCollection) setCollection(savedCollection);
    if (savedDeck) setDeck(savedDeck);
  }, [modId, setCollection, setDeck]);
}
