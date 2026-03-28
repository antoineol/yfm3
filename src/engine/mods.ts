/** Identifier for a game mod/version. */
export type ModId = "rp" | "vanilla";

/** Metadata for a game mod/version. */
export interface ModConfig {
  id: ModId;
  name: string;
  megamorphId: number;
  /** First 16 bytes of the card stats table at PS1 RAM 0x1D4244, hex-encoded. */
  fingerprint: string;
  gameDownloadLabel: string;
  gameDownloadUrl: string;
}

/** Registry of all supported mods. */
export const MODS: Record<ModId, ModConfig> = {
  vanilla: {
    id: "vanilla",
    name: "Original",
    megamorphId: 657,
    fingerprint: "2cf505025090090678c84412788c2001",
    gameDownloadLabel: "Download game",
    gameDownloadUrl: "https://www.rpgamers.fr/rom-923-yu-gi-oh-forbidden-memories.html",
  },
  rp: {
    id: "rp",
    name: "Remastered Perfected",
    megamorphId: 657,
    fingerprint: "788ce0008cf0e4005a78c4018290d500",
    gameDownloadLabel: "Download RP mod",
    gameDownloadUrl: "https://mega.nz/file/SwQwVb5a#1EdeL_Sb8mwvlRodT3sJ3loRjT1kjRfHcvP6eHH3sLo",
  },
};

/** Extra game variants that share a fingerprint with an existing mod (not selectable in manual mode). */
export const EXTRA_GAME_VARIANTS: readonly { name: string; gameDownloadUrl: string }[] = [
  {
    name: "15 cards drop",
    gameDownloadUrl: "https://www.mediafire.com/file/6dnbt49lt455ld2/15+card+mod.7z",
  },
];

/** Default mod when none is selected. */
export const DEFAULT_MOD: ModId = "vanilla";

/** Find the mod that matches a RAM fingerprint, or null if unknown. */
export function modIdForFingerprint(fingerprint: string): ModId | null {
  for (const mod of Object.values(MODS)) {
    if (mod.fingerprint === fingerprint) return mod.id;
  }
  return null;
}
