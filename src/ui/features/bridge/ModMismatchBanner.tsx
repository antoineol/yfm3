import { MODS, modIdForFingerprint } from "../../../engine/mods.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { useSelectedMod, useSetSelectedMod } from "../../lib/use-selected-mod.ts";

/**
 * Shows a warning banner when the game running in DuckStation doesn't match
 * the mod selected in the app.
 */
export function ModMismatchBanner() {
  const bridge = useBridge();
  const selectedMod = useSelectedMod();
  const setSelectedMod = useSetSelectedMod();

  if (!bridge.modFingerprint) return null;

  const detectedMod = modIdForFingerprint(bridge.modFingerprint);
  if (!detectedMod || detectedMod === selectedMod) return null;

  const detectedName = MODS[detectedMod].name;

  return (
    <div className="mx-3 mt-2 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-950/30 border border-red-900/40">
      <span className="inline-block size-2.5 rounded-full shrink-0 bg-red-400" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-red-400">
          Wrong mod — DuckStation is running{" "}
          <strong className="text-red-300">{detectedName}</strong>
        </p>
      </div>
      <button
        className="shrink-0 px-3 py-1 rounded-md bg-red-400/15 text-red-400 text-xs font-medium hover:bg-red-400/25 transition-colors cursor-pointer"
        onClick={() => setSelectedMod({ selectedMod: detectedMod })}
        type="button"
      >
        Switch to {detectedName}
      </button>
    </div>
  );
}
