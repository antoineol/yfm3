/** Known mod identifiers (manual mode, UI dropdowns, CSV paths). */
export type KnownModId = "rp" | "vanilla";

/** Mod identifier — known mods or synthetic IDs for unknown mods in autosync. */
export type ModId = KnownModId | (string & {});

/** Metadata for a game mod/version. */
export interface ModConfig {
  id: KnownModId;
  name: string;
  megamorphId: number;
  /** First 16 bytes of the card stats table at PS1 RAM 0x1D4244, hex-encoded. */
  fingerprint: string;
  gameDownloadLabel: string;
  gameDownloadUrl: string;
}

/** Registry of all supported mods. */
export const MODS: Record<KnownModId, ModConfig> = {
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
export const DEFAULT_MOD: KnownModId = "vanilla";

/** Check if a mod ID is a known, registered mod. */
export function isKnownModId(value: string): value is KnownModId {
  return value in MODS;
}

/** Create a synthetic mod ID from a bridge fingerprint (for unknown mods). */
export function syntheticModId(fingerprint: string): string {
  return `mod-${fingerprint.slice(0, 12)}`;
}

/** Get megamorphId for a mod. Returns 657 (default) for unknown mods. */
export function getMegamorphId(modId: ModId): number {
  if (isKnownModId(modId)) return MODS[modId].megamorphId;
  return 657;
}

/** Find the mod that matches a RAM fingerprint, or null if unknown. */
export function modIdForFingerprint(fingerprint: string): KnownModId | null {
  for (const mod of Object.values(MODS)) {
    if (mod.fingerprint === fingerprint) return mod.id;
  }
  return null;
}
