import { useBridge } from "../../lib/bridge-context.tsx";

/**
 * Shows a warning when the bridge is connected but failed to acquire
 * game data (fusion/equip tables) from the disc image.
 * The optimizer still works via CSV fallback, so this is a soft warning.
 */
export function GameDataErrorBanner() {
  const bridge = useBridge();

  if (bridge.detail !== "ready" || !bridge.gameDataError) return null;

  return (
    <div className="mx-3 mt-2 flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-950/30 border border-yellow-900/40">
      <span className="inline-block size-2.5 rounded-full shrink-0 bg-yellow-400" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-yellow-400">Game data unavailable</p>
        <p className="mt-0.5 text-xs text-text-muted whitespace-pre-line">{bridge.gameDataError}</p>
      </div>
    </div>
  );
}
