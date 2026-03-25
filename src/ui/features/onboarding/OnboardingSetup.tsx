import { useCallback, useState } from "react";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { BRIDGE_DOWNLOAD_URL } from "../bridge/bridge-constants.ts";
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
} from "../bridge/setup-steps.tsx";

export function OnboardingSetup() {
  const bridge = useBridge();
  const updatePreferences = useUpdatePreferences();
  const isWaiting = bridge.detail === "waiting_for_game";
  const [downloadedBridge, setDownloadedBridge] = useState(false);

  const handleSwitchMode = useCallback(() => {
    updatePreferences({ bridgeAutoSync: null });
  }, [updatePreferences]);

  const bridgeStates = stepStatesForDetail(bridge.detail);
  const bridgeStep1 =
    downloadedBridge && bridgeStates[0] === STEP_ACTIVE ? STEP_DONE : bridgeStates[0];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <StatusBanner detail={bridge.detail} detailMessage={bridge.detailMessage} />

      {isWaiting ? (
        <WaitingForGamePanel onReconnect={bridge.scan} />
      ) : (
        <>
          <div className="rounded-xl bg-bg-panel border border-border-subtle p-4 space-y-1">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-3">Setup</p>

            <Step number={1} state={bridgeStep1} title="Download the bridge">
              <DownloadLink
                download
                href={BRIDGE_DOWNLOAD_URL}
                onClick={() => setDownloadedBridge(true)}
              >
                Download yfm-bridge
              </DownloadLink>
            </Step>

            <Step
              number={2}
              state={bridgeStates[1]}
              title="Extract the zip and double-click start-bridge.bat"
            />

            <Step number={3} state={bridgeStates[2]} title="Open DuckStation and load the game" />

            <Step
              number={4}
              state={bridgeStates[3]}
              title="Enable shared memory export in DuckStation"
            >
              <DuckStationInstructions />
            </Step>
          </div>

          <Troubleshooting />
        </>
      )}

      <SwitchModeLink onClick={handleSwitchMode} />
    </div>
  );
}
