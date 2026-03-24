/** Format a card ID as a zero-padded 3-digit string (e.g. 7 → "007"). */
export function formatCardId(id: number): string {
  return String(id).padStart(3, "0");
}

/** Build the artwork URL for a card, versioned by mod. */
export function artworkSrc(modId: string, cardId: number): string {
  return `/images/artwork/${modId}/${formatCardId(cardId)}.webp`;
}

export const DROP_TOTAL = 2048;

/** Format a raw drop weight (out of 2048) as a percentage string, or "—" for zero. */
export function formatRate(raw: number): string {
  if (raw === 0) return "—";
  return `${((raw / DROP_TOTAL) * 100).toFixed(1)}%`;
}
