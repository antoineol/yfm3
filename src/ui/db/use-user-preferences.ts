import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { DECK_SIZE, DEFAULT_FUSION_DEPTH } from "../../engine/types/constants.ts";

type UserSettings = Doc<"userSettings">;

export type HandSourceMode = NonNullable<UserSettings["handSourceMode"]>;

export const DEFAULT_HAND_SOURCE_MODE: HandSourceMode = "all";

export function useUserModSettings() {
  return useQuery(api.userModSettings.getUserModSettings, {});
}

export function useDeckSize() {
  const prefs = useUserModSettings();
  return prefs?.deckSize ?? DECK_SIZE;
}

export function useFusionDepth() {
  const prefs = useUserModSettings();
  return prefs?.fusionDepth ?? DEFAULT_FUSION_DEPTH;
}

export function useUseEquipment() {
  const prefs = useUserModSettings();
  return prefs?.useEquipment ?? true;
}

// ── Global settings (from userSettings table) ───────────────────────

function useUserSettings() {
  return useQuery(api.userSettings.getUserSettings, {});
}

export function useHandSourceMode(): HandSourceMode {
  const settings = useUserSettings();
  return settings?.handSourceMode ?? DEFAULT_HAND_SOURCE_MODE;
}

export function useBridgeAutoSync() {
  const settings = useUserSettings();
  return settings?.bridgeAutoSync ?? false;
}

/** Raw tri-state: `undefined` = never chosen, `true` = auto-sync, `false` = manual.
 *  Returns `null` while the query is still loading. */
export function useBridgeAutoSyncSetting(): boolean | undefined | null {
  const settings = useUserSettings();
  if (settings === undefined) return null; // loading
  return settings?.bridgeAutoSync;
}

// ── Cheat mode settings (persisted in userSettings table) ─────────────

export type CheatView = "player" | "opponent";

export function useCheatMode(): boolean {
  const settings = useUserSettings();
  return settings?.cheatMode ?? false;
}

export function useCheatView(): CheatView {
  const settings = useUserSettings();
  return settings?.cheatView ?? "player";
}
