/** Identifier for a game mod/version. */
export type ModId = "rp" | "vanilla";

/** Metadata for a game mod/version. */
export interface ModConfig {
  id: ModId;
  name: string;
  megamorphId: number;
  gameDownloadLabel: string;
  gameDownloadUrl: string;
}

/** Registry of all supported mods. */
export const MODS: Record<ModId, ModConfig> = {
  vanilla: {
    id: "vanilla",
    name: "Vanilla",
    megamorphId: 657,
    gameDownloadLabel: "Download game",
    gameDownloadUrl: "https://www.rpgamers.fr/rom-923-yu-gi-oh-forbidden-memories.html",
  },
  rp: {
    id: "rp",
    name: "Remastered Perfected",
    megamorphId: 657,
    gameDownloadLabel: "Download RP mod",
    gameDownloadUrl: "https://mega.nz/file/SwQwVb5a#1EdeL_Sb8mwvlRodT3sJ3loRjT1kjRfHcvP6eHH3sLo",
  },
};

/** Default mod when none is selected. */
export const DEFAULT_MOD: ModId = "vanilla";
