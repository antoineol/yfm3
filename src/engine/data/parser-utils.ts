import type { CardKind } from "./card-model.ts";
import { cardKinds } from "./rp-types.ts";

export function isValidCardKind(kind: string): kind is CardKind {
  return cardKinds.includes(kind as CardKind);
}
