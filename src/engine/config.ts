import { MODS } from "./mods.ts";
import { DECK_SIZE, DEFAULT_FUSION_DEPTH } from "./types/constants.ts";

/** Engine-wide configuration. Mutable at module level — safe for single-user apps. */
export interface EngineConfig {
  deckSize: number;
  fusionDepth: number;
  useEquipment: boolean;
  megamorphId: number;
  /** Terrain ID for field power bonuses (0 = none, 1–6 = Forest..Dark). */
  terrain: number;
}

const defaults: Readonly<EngineConfig> = {
  deckSize: DECK_SIZE,
  fusionDepth: DEFAULT_FUSION_DEPTH,
  useEquipment: true,
  megamorphId: MODS.rp.megamorphId,
  terrain: 0,
};

const config: EngineConfig = { ...defaults };

/** Current engine configuration (read-only view). */
export function getConfig(): Readonly<EngineConfig> {
  return config;
}

/** Partially update the engine configuration. */
export function setConfig(patch: Partial<EngineConfig>): void {
  Object.assign(config, patch);
}

/** Restore all configuration to defaults. Useful for test isolation. */
export function resetConfig(): void {
  Object.assign(config, defaults);
}
