import { useCallback, useEffect, useState } from "react";
import { EXTRA_GAME_VARIANTS, MODS } from "../../../engine/mods.ts";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import type { BridgeDetail } from "../../lib/bridge-message-processor.ts";
import {
  BIOS_EU_URL,
  BIOS_US_URL,
  BRIDGE_DOWNLOAD_URL,
  DUCKSTATION_URL,
} from "./bridge-constants.ts";
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

/**
 * Bridge "ready" means shared-memory card-stats are non-zero — not that disc
 * extraction finished. Until `gameData` actually arrives, we keep step 8
 * ("Load the game") active: the user hasn't completed the flow, whether
 * because the emulator is between loads (stale shared memory) or extraction
 * is still running in the background.
 */
function effectiveDetail(detail: BridgeDetail, hasGameData: boolean): BridgeDetail {
  if (detail === "ready" && !hasGameData) return "waiting_for_game";
  return detail;
}

export function BridgeSetupGuide() {
  const bridge = useBridge();
  const updatePreferences = useUpdatePreferences();
  const detail = effectiveDetail(bridge.detail, bridge.gameData !== null);

  const handleSwitchMode = useCallback(() => {
    updatePreferences({ bridgeAutoSync: null });
  }, [updatePreferences]);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {detail !== "waiting_for_game" && (
        <StatusBanner
          detail={detail}
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
  const detail = effectiveDetail(bridge.detail, bridge.gameData !== null);
  const states = stepStatesForDetail(detail);

  const step4 = downloaded && states[3] === STEP_ACTIVE ? STEP_DONE : states[3];
  const step7 = bridge.settingsPatched ? STEP_DONE : states[6];

  return (
    <div className="rounded-xl bg-bg-panel border border-border-subtle p-4 space-y-1">
      <p className="text-xs text-text-muted uppercase tracking-wide mb-3">Setup</p>

      <p className="text-xs text-text-muted mb-3">
        Requires <strong className="text-text-secondary">Windows</strong>.
      </p>

      <Step number={1} state={states[0]} title="Download the emulator">
        <DownloadLink href={DUCKSTATION_URL}>Download DuckStation</DownloadLink>
      </Step>

      <Step number={2} state={states[1]} title="Download a PS1 BIOS for the emulator">
        <div className="flex flex-wrap gap-2">
          <DownloadLink href={BIOS_US_URL}>PS1 BIOS (US)</DownloadLink>
          <DownloadLink href={BIOS_EU_URL}>PS1 BIOS (EU)</DownloadLink>
        </div>
      </Step>

      <Step number={3} state={states[2]} title="Download the game">
        <div className="flex flex-wrap gap-2">
          {Object.values(MODS).map((mod) => (
            <DownloadLink href={mod.gameDownloadUrl} key={mod.id}>
              {mod.name}
            </DownloadLink>
          ))}
          {EXTRA_GAME_VARIANTS.map((v) => (
            <DownloadLink href={v.gameDownloadUrl} key={v.name}>
              {v.name}
            </DownloadLink>
          ))}
        </div>
      </Step>

      <Step number={4} state={step4} title="Download the bridge to connect to the game">
        <DownloadLink download href={BRIDGE_DOWNLOAD_URL} onClick={() => setDownloaded(true)}>
          Download yfm-bridge
        </DownloadLink>
      </Step>

      <Step
        number={5}
        state={states[4]}
        title="Extract the zip and double-click start-bridge.bat"
      />

      <Step number={6} state={states[5]} title="Open DuckStation" />

      <Step
        number={7}
        state={step7}
        title={
          bridge.settingsPatched
            ? "Shared memory export enabled — restart DuckStation to apply"
            : "Enable shared memory export in DuckStation"
        }
      >
        {bridge.settingsPatched ? <RestartDuckStationButton /> : <DuckStationInstructions />}
      </Step>

      <Step number={8} state={states[7]} title="Load the game in DuckStation" />
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
