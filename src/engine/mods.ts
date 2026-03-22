/** Identifier for a game mod/version. */
export type ModId = "rp" | "vanilla";

/** Metadata for a game mod/version. */
export interface ModConfig {
  id: ModId;
  name: string;
  megamorphId: number;
  bridgeSupported: boolean;
}

/** Registry of all supported mods. */
export const MODS: Record<ModId, ModConfig> = {
  rp: {
    id: "rp",
    name: "Remastered Perfected",
    megamorphId: 657,
    bridgeSupported: true,
  },
  vanilla: {
    id: "vanilla",
    name: "Vanilla",
    megamorphId: 657,
    bridgeSupported: false,
  },
};

/** Default mod when none is selected. */
export const DEFAULT_MOD: ModId = "rp";
