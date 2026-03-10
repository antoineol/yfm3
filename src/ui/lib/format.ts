/** Format a card ID as a zero-padded 3-digit string (e.g. 7 → "007"). */
export function formatCardId(id: number): string {
  return String(id).padStart(3, "0");
}
