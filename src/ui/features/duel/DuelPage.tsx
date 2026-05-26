import { useBridge } from "../../lib/bridge-context.tsx";
import { PostDuelSuggestion } from "../hand/PostDuelSuggestion.tsx";
import { useAutoSyncHand } from "../hand/use-auto-sync-hand.ts";
import { isConfirmedActiveBridgeDuel } from "../hand/use-duel-collection-tracker.ts";
import type { PostDuelSuggestion as PostDuelSuggestionState } from "../hand/use-post-duel-suggestion.ts";
import { DeckAnalyzer } from "./DeckAnalyzer.tsx";
import { SyncedShell } from "./SyncedShell.tsx";

/**
 * Duel tab entry. Dispatches between <DeckAnalyzer> (bridge disconnected, manual
 * hand/field builder) and <SyncedShell> (bridge connected, live duel HUD).
 *
 * Hand auto-sync and post-duel suggestion display live here; the post-duel
 * detector itself is app-wide so it keeps watching while another tab is active.
 */
export function DuelPage({ postDuel }: { postDuel: PostDuelSuggestionState }) {
  const bridge = useBridge();

  useAutoSyncHand(bridge);

  const hasPostDuelContent =
    !isConfirmedActiveBridgeDuel(bridge) &&
    (postDuel.state === "optimizing" ||
      postDuel.state === "result" ||
      postDuel.state === "no_change");

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
