import { DECK_SIZE, DEFAULT_FUSION_DEPTH } from "./types/constants.ts";

/** Engine-wide configuration. Mutable at module level — safe for single-user apps. */
export interface EngineConfig {
  deckSize: number;
  fusionDepth: number;
  useEquipment: boolean;
}

const defaults: Readonly<EngineConfig> = {
  deckSize: DECK_SIZE,
  fusionDepth: DEFAULT_FUSION_DEPTH,
  useEquipment: true,
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
