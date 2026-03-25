import { useCallback, useState } from "react";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useBridgeAutoSync } from "../../db/use-user-preferences.ts";
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
  WaitingForGamePanel,
} from "./setup-steps.tsx";

export function BridgeSetupGuide() {
  const bridge = useBridge();
  const bridgeAutoSync = useBridgeAutoSync();
  const updatePreferences = useUpdatePreferences();
  const isWaiting = bridge.detail === "waiting_for_game";

  const handleDisableSync = useCallback(() => {
    updatePreferences({ bridgeAutoSync: !bridgeAutoSync });
  }, [bridgeAutoSync, updatePreferences]);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <StatusBanner detail={bridge.detail} detailMessage={bridge.detailMessage} />
      {isWaiting ? (
        <WaitingForGamePanel onReconnect={bridge.scan} />
      ) : (
        <>
          <SetupSteps />
          <Troubleshooting />
        </>
      )}
      <SwitchModeLink label="Disable auto-sync" onClick={handleDisableSync} />
    </div>
  );
}

function SetupSteps() {
  const bridge = useBridge();
  const [downloaded, setDownloaded] = useState(false);
  const states = stepStatesForDetail(bridge.detail);

  const step1 = downloaded && states[0] === STEP_ACTIVE ? STEP_DONE : states[0];

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

      <Step number={4} state={states[3]} title="Enable shared memory export in DuckStation">
        <DuckStationInstructions />
      </Step>
    </div>
  );
}
