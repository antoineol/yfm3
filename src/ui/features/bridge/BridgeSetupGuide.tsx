import { useCallback, useEffect, useState } from "react";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { BRIDGE_DOWNLOAD_URL } from "./bridge-constants.ts";
import {
  DownloadLink,
  DuckStationInstructions,
  STEP_ACTIVE,
  STEP_DONE,
  StatusBanner,
  Step,
  SwitchModeLink,
  stepStatesForDetail,
  Troubleshooting,
} from "./setup-steps.tsx";

export function BridgeSetupGuide() {
  const bridge = useBridge();
  const updatePreferences = useUpdatePreferences();

  const handleSwitchMode = useCallback(() => {
    updatePreferences({ bridgeAutoSync: null });
  }, [updatePreferences]);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {bridge.detail !== "waiting_for_game" && (
        <StatusBanner
          detail={bridge.detail}
          detailMessage={bridge.detailMessage}
          settingsPatched={bridge.settingsPatched}
        />
      )}
      <SetupSteps />
      <Troubleshooting />
      <SwitchModeLink onClick={handleSwitchMode} />
    </div>
  );
}

function SetupSteps() {
  const bridge = useBridge();
  const [downloaded, setDownloaded] = useState(false);
  const states = stepStatesForDetail(bridge.detail);

  const step1 = downloaded && states[0] === STEP_ACTIVE ? STEP_DONE : states[0];
  const step4 = bridge.settingsPatched ? STEP_DONE : states[3];

  return (
    <div className="rounded-xl bg-bg-panel border border-border-subtle p-4 space-y-1">
      <p className="text-xs text-text-muted uppercase tracking-wide mb-3">Setup</p>

      <p className="text-xs text-text-muted mb-3">
        Requires <strong className="text-text-secondary">Windows</strong> and{" "}
        <strong className="text-text-secondary">DuckStation</strong> emulator.
      </p>

      <Step number={1} state={step1} title="Download the bridge">
        <DownloadLink download href={BRIDGE_DOWNLOAD_URL} onClick={() => setDownloaded(true)}>
          Download yfm-bridge
        </DownloadLink>
      </Step>

      <Step
        number={2}
        state={states[1]}
        title="Extract the zip and double-click start-bridge.bat"
      />

      <Step number={3} state={states[2]} title="Open DuckStation" />

      <Step
        number={4}
        state={step4}
        title={
          bridge.settingsPatched
            ? "Shared memory export enabled — restart DuckStation to apply"
            : "Enable shared memory export in DuckStation"
        }
      >
        {bridge.settingsPatched ? <RestartDuckStationButton /> : <DuckStationInstructions />}
      </Step>

      <Step number={5} state={states[4]} title="Load the game in DuckStation" />
    </div>
  );
}

function RestartDuckStationButton() {
  const bridge = useBridge();
  const [sent, setSent] = useState(false);

  // Reset when the bridge reports that restart failed
  useEffect(() => {
    if (bridge.restartFailed) setSent(false);
  }, [bridge.restartFailed]);

  const handleRestart = useCallback(() => {
    if (!window.confirm("Restart DuckStation now?\n\nAny unsaved progress will be lost.")) return;
    bridge.restartEmulator();
    setSent(true);
  }, [bridge]);

  if (sent) {
    return <p className="mt-1 text-xs text-text-muted">Restarting DuckStation...</p>;
  }

  return (
    <div>
      <button
        className="mt-1 px-3 py-1.5 rounded-md bg-gold/15 text-gold text-xs font-medium hover:bg-gold/25 transition-colors cursor-pointer"
        onClick={handleRestart}
        type="button"
      >
        Restart DuckStation
      </button>
      {bridge.restartFailed && (
        <p className="mt-1 text-xs text-red-400">
          Restart failed. Try restarting DuckStation manually.
        </p>
      )}
    </div>
  );
}
