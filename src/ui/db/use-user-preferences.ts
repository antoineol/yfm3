import { useAtomValue } from "jotai";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { DECK_SIZE, DEFAULT_FUSION_DEPTH } from "../../engine/types/constants.ts";
import { useAuthQuery } from "../core/convex-hooks.ts";
import { getAutoSyncMode } from "../lib/auto-sync-mode.ts";
import {
  type CpuSwap,
  localCpuSwapsAtom,
  localSettingsAtom,
} from "../lib/bridge-snapshot-atoms.ts";

type UserSettings = Doc<"userSettings">;

export type HandSourceMode = NonNullable<UserSettings["handSourceMode"]>;

export const DEFAULT_HAND_SOURCE_MODE: HandSourceMode = "all";

// ── Bridge auto-sync (reads localStorage first, Convex fallback) ────

export function useBridgeAutoSync() {
  // Synchronous read on first render — available before Convex loads
  const [localMode] = useState(() => getAutoSyncMode());
  const settings = useUserSettings();
  // If localStorage says auto-sync, trust it immediately; otherwise fall back to Convex
  return localMode === true ? true : (settings?.bridgeAutoSync ?? false);
}

/** Raw tri-state: `undefined` = never chosen, `true` = auto-sync, `false` = manual.
 *  Returns `null` while the query is still loading. */
export function useBridgeAutoSyncSetting(): boolean | undefined | null {
  const [localMode] = useState(() => getAutoSyncMode());
  const settings = useUserSettings();
  if (localMode !== undefined) return localMode;
  if (settings === undefined) return null; // loading
  return settings?.bridgeAutoSync;
}

// ── Mod settings ────────────────────────────────────────────────────

export function useUserModSettings() {
  const autoSync = useBridgeAutoSync();
  return useAuthQuery(api.userModSettings.getUserModSettings, autoSync ? "skip" : undefined);
}

export function useDeckSize() {
  const autoSync = useBridgeAutoSync();
  const localSettings = useAtomValue(localSettingsAtom);
  const prefs = useUserModSettings();
  if (autoSync) return localSettings.deckSize ?? DECK_SIZE;
  return prefs?.deckSize ?? DECK_SIZE;
}

export function useFusionDepth() {
  const autoSync = useBridgeAutoSync();
  const localSettings = useAtomValue(localSettingsAtom);
  const prefs = useUserModSettings();
  if (autoSync) return localSettings.fusionDepth ?? DEFAULT_FUSION_DEPTH;
  return prefs?.fusionDepth ?? DEFAULT_FUSION_DEPTH;
}

export function useUseEquipment() {
  const autoSync = useBridgeAutoSync();
  const localSettings = useAtomValue(localSettingsAtom);
  const prefs = useUserModSettings();
  if (autoSync) return localSettings.useEquipment ?? true;
  return prefs?.useEquipment ?? true;
}

// ── Global settings (from userSettings table or local atoms) ────────

function useUserSettings() {
  const [localMode] = useState(() => getAutoSyncMode());
  return useAuthQuery(api.userSettings.getUserSettings, localMode === true ? "skip" : undefined);
}

export function useHandSourceMode(): HandSourceMode {
  const autoSync = useBridgeAutoSync();
  const localSettings = useAtomValue(localSettingsAtom);
  const settings = useUserSettings();
  if (autoSync) return localSettings.handSourceMode ?? DEFAULT_HAND_SOURCE_MODE;
  return settings?.handSourceMode ?? DEFAULT_HAND_SOURCE_MODE;
}

// ── Cheat mode settings ─────────────────────────────────────────────

export type CheatView = "player" | "opponent";

export function useCheatMode(): boolean {
  const autoSync = useBridgeAutoSync();
  const localSettings = useAtomValue(localSettingsAtom);
  const settings = useUserSettings();
  if (autoSync) return localSettings.cheatMode ?? false;
  return settings?.cheatMode ?? false;
}

export function useCheatView(): CheatView {
  const autoSync = useBridgeAutoSync();
  const localSettings = useAtomValue(localSettingsAtom);
  const settings = useUserSettings();
  if (autoSync) return localSettings.cheatView ?? "player";
  return settings?.cheatView ?? "player";
}

export function useCpuSwaps(): CpuSwap[] {
  const autoSync = useBridgeAutoSync();
  const localSwaps = useAtomValue(localCpuSwapsAtom);
  const settings = useUserSettings();
  if (autoSync) return localSwaps;
  return (settings?.cpuSwaps as CpuSwap[] | undefined) ?? [];
}
