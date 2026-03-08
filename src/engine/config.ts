import { DECK_SIZE } from "./types/constants.ts";

/** Engine-wide configuration. Mutable at module level — safe for single-user apps. */
export interface EngineConfig {
  deckSize: number;
}

const defaults: Readonly<EngineConfig> = { deckSize: DECK_SIZE };

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
