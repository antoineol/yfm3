import { useMemo } from "react";
import { useDeck } from "../../db/use-deck.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { PostDuelSuggestion } from "../hand/PostDuelSuggestion.tsx";
import { useAutoSyncHand } from "../hand/use-auto-sync-hand.ts";
import { usePostDuelSuggestion } from "../hand/use-post-duel-suggestion.ts";
import { DeckAnalyzer } from "./DeckAnalyzer.tsx";
import { SyncedShell } from "./SyncedShell.tsx";

/**
 * Duel tab entry. Dispatches between <DeckAnalyzer> (bridge disconnected, manual
 * hand/field builder) and <SyncedShell> (bridge connected, live duel HUD).
 *
 * Cross-mode concerns — hand auto-sync and post-duel suggestion hydration/display —
 * live here so they survive bridge disconnects and short reconnect gaps.
 */
export function DuelPage() {
  const bridge = useBridge();
  const deck = useDeck();
  const deckCardIds = useMemo(() => deck?.map((d) => d.cardId), [deck]);

  useAutoSyncHand(bridge);
  const postDuel = usePostDuelSuggestion(bridge, deckCardIds);

  const hasPostDuelContent =
    postDuel.state === "optimizing" ||
    postDuel.state === "result" ||
    postDuel.state === "no_change";

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-2">
      {hasPostDuelContent && <PostDuelSuggestion suggestion={postDuel} />}
      {bridge.status === "connected" ? (
        <SyncedShell hasPostDuelContent={hasPostDuelContent} />
      ) : (
        <DeckAnalyzer />
      )}
    </div>
  );
}
