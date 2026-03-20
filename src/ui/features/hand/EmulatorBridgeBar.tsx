import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import type { HandCard } from "../../db/use-hand.ts";
import type { BridgeStatus, EmulatorBridge } from "../../lib/use-emulator-bridge.ts";

export function EmulatorBridgeBar({
  bridge,
  currentHand,
}: {
  bridge: EmulatorBridge;
  currentHand: HandCard[];
}) {
  const batchMigrateHand = useMutation(api.hand.batchMigrateHand);
  const lastSyncedRef = useRef("");

  const bridgeHandKey = bridge.hand.join(",");
  const currentHandKey = currentHand.map((c) => c.cardId).join(",");
  const handsDiffer = bridgeHandKey !== currentHandKey && bridge.hand.length > 0;

  // Auto-sync when bridge hand changes and differs from current hand
  const syncHand = useCallback(() => {
    if (bridge.hand.length === 0) return;

    const key = bridge.hand.join(",");
    if (key === lastSyncedRef.current) return;
    lastSyncedRef.current = key;

    void batchMigrateHand({
      handData: bridge.hand.map((cardId, i) => ({
        cardId,
        copyId: `emu-${String(i)}`,
        order: i,
      })),
    });
  }, [bridge.hand, batchMigrateHand]);

  // Auto-sync when in a duel and hand changes
  useEffect(() => {
    if (bridge.inDuel && handsDiffer) {
      syncHand();
    }
  }, [bridge.inDuel, handsDiffer, syncHand]);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-secondary text-xs">
      <StatusDot inDuel={bridge.inDuel} status={bridge.status} />
      <span className="text-text-muted">{statusLabel(bridge)}</span>
      {bridge.status === "connected" && bridge.inDuel && bridge.lp && (
        <span className="ml-auto text-text-muted tabular-nums">
          LP {String(bridge.lp[0])} vs {String(bridge.lp[1])}
        </span>
      )}
      {bridge.status === "connected" && handsDiffer && !bridge.inDuel && (
        <button
          className="ml-auto text-accent-primary hover:text-accent-hover transition-colors cursor-pointer"
          onClick={syncHand}
          type="button"
        >
          Sync hand
        </button>
      )}
    </div>
  );
}

function StatusDot({ status, inDuel }: { status: BridgeStatus; inDuel: boolean }) {
  const color =
    status === "connected" && inDuel
      ? "bg-green-400"
      : status === "connected"
        ? "bg-yellow-400"
        : status === "connecting"
          ? "bg-yellow-400 animate-pulse"
          : "bg-neutral-500";

  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function statusLabel(bridge: EmulatorBridge): string {
  if (bridge.status === "disconnected") return "Bridge offline";
  if (bridge.status === "connecting") return "Connecting to bridge...";
  if (!bridge.inDuel) return "Connected — waiting for duel";
  return `In duel — ${String(bridge.hand.length)} cards detected`;
}
