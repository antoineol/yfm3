import { PanelCard, PanelEmptyState } from "../../../components/panel-chrome.tsx";
import { useBridgeAutoSync } from "../../../db/use-user-preferences.ts";
import { useBridge } from "../../../lib/bridge-context.tsx";
import { DropPoolEditor } from "./DropPoolEditor.tsx";

export function DataEditPanel({
  onDuelistChange,
  selectedDuelistId,
}: {
  onDuelistChange: (id: number) => void;
  selectedDuelistId: number | undefined;
}) {
  const autoSyncOn = useBridgeAutoSync();
  const bridge = useBridge();
  const gameReady = autoSyncOn && bridge.detail === "ready";

  if (!autoSyncOn) {
    return (
      <PanelCard className="w-full max-w-5xl mx-auto">
        <PanelEmptyState
          subtitle="Turn on auto-sync (top bar) so the bridge can resolve and patch the running game's ISO."
          title="Auto-sync mode required"
        />
      </PanelCard>
    );
  }
  if (!gameReady) {
    return (
      <PanelCard className="w-full max-w-5xl mx-auto">
        <PanelEmptyState
          subtitle="Launch a game in DuckStation. Once the bridge has extracted the disc, this panel will populate."
          title="Waiting for a running game"
        />
      </PanelCard>
    );
  }
  if (!bridge.gameData) {
    return (
      <PanelCard className="w-full max-w-5xl mx-auto">
        <PanelEmptyState
          subtitle={
            bridge.gameDataError ??
            "The bridge is still reading the disc image. This takes a few seconds on first launch."
          }
          title="Reading disc image…"
        />
      </PanelCard>
    );
  }

  return (
    <PanelCard className="w-full max-w-5xl mx-auto">
      <DropPoolEditor
        gameData={bridge.gameData}
        onDuelistChange={onDuelistChange}
        selectedDuelistId={selectedDuelistId}
      />
    </PanelCard>
  );
}
