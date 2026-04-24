import { useBridgeAutoSync, useBridgeAutoSyncSetting } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import type { BridgeState } from "../../lib/bridge-message-processor.ts";
import { BridgeRestartingIndicator } from "../bridge/BridgeRestartingIndicator.tsx";
import { BridgeSetupGuide } from "../bridge/BridgeSetupGuide.tsx";
import { OnboardingModeChooser } from "./OnboardingModeChooser.tsx";

/**
 * In auto-sync mode, "setup complete" requires both a ready bridge AND actual
 * game data extracted from disc. The bridge broadcasts `detail: "ready"` as
 * soon as RAM card-stats are non-zero, which can happen before `acquireGameData`
 * finishes — and can stay true even when no game is running (DuckStation's
 * shared memory keeps the last session's card-stats). Without the gameData
 * check we'd drop the user onto a "Loading card data..." spinner instead of a
 * useful step guide.
 */
function needsBridgeSetup(bridgeAutoSync: boolean, bridge: BridgeState): boolean {
  if (!bridgeAutoSync) return false;
  if (bridge.detail !== "ready") return true;
  return !bridge.gameData;
}

export function useShowOnboarding(): boolean {
  const bridgeAutoSync = useBridgeAutoSync();
  const bridgeAutoSyncSetting = useBridgeAutoSyncSetting();
  const bridge = useBridge();

  const showModeChooser = bridgeAutoSyncSetting === undefined;
  return showModeChooser || needsBridgeSetup(bridgeAutoSync, bridge);
}

export function TabOnboardingGate({ children }: { children: React.ReactNode }) {
  const bridgeAutoSync = useBridgeAutoSync();
  const bridgeAutoSyncSetting = useBridgeAutoSyncSetting();
  const bridge = useBridge();

  const showModeChooser = bridgeAutoSyncSetting === undefined;
  const showBridgeSetup = needsBridgeSetup(bridgeAutoSync, bridge);

  if (showModeChooser) return <OnboardingModeChooser />;
  if (bridge.updating) return <BridgeRestartingIndicator />;
  if (showBridgeSetup) return <BridgeSetupGuide />;
  return children;
}
