import { useBridgeOptional } from "./bridge-context.tsx";
import { artworkSrc, bridgeArtworkSrc } from "./format.ts";
import { useSelectedMod } from "./use-selected-mod.ts";

/** Returns a resolver that picks bridge artwork (dynamic) when available,
 *  falling back to static pre-extracted artwork. */
export function useArtworkSrc(): (cardId: number) => string {
  const bridge = useBridgeOptional();
  const modId = useSelectedMod();
  const artworkKey = bridge?.gameData?.artworkKey;
  if (artworkKey) return (cardId: number) => bridgeArtworkSrc(artworkKey, cardId);
  return (cardId: number) => artworkSrc(modId, cardId);
}
