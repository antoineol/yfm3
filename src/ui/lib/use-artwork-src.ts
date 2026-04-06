import { useBridgeOptional } from "./bridge-context.tsx";
import { artworkSrc, bridgeArtworkSrc } from "./format.ts";
import { useSelectedMod } from "./use-selected-mod.ts";

/** Returns a resolver that picks bridge artwork (dynamic) when available,
 *  falling back to static pre-extracted artwork. */
export function useArtworkSrc(): (cardId: number) => string {
  const bridge = useBridgeOptional();
  const modId = useSelectedMod();
  if (bridge?.gameData) return bridgeArtworkSrc;
  return (cardId: number) => artworkSrc(modId, cardId);
}
