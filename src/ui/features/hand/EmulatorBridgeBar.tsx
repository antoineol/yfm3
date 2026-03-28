import { useBridge } from "../../lib/bridge-context.tsx";

export function EmulatorBridgeBar() {
  const bridge = useBridge();

  // During a duel, phase/LP is shown in the header — nothing to render here.
  if (bridge.inDuel) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-secondary text-xs">
      <span className="inline-block w-2 h-2 rounded-full shrink-0 bg-green-400" />
      <span className="text-text-muted">Connected</span>
    </div>
  );
}
