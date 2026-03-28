import { useBridgeAutoSync, useBridgeAutoSyncSetting } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { BridgeRestartingIndicator } from "../bridge/BridgeRestartingIndicator.tsx";
import { BridgeSetupGuide } from "../bridge/BridgeSetupGuide.tsx";
import { OnboardingModeChooser } from "./OnboardingModeChooser.tsx";

export function useShowOnboarding(): boolean {
  const bridgeAutoSync = useBridgeAutoSync();
  const bridgeAutoSyncSetting = useBridgeAutoSyncSetting();
  const bridge = useBridge();

  const showModeChooser = bridgeAutoSyncSetting === undefined;
  const showBridgeSetup = bridgeAutoSync && bridge.detail !== "ready";
  return showModeChooser || showBridgeSetup;
}

export function TabOnboardingGate({ children }: { children: React.ReactNode }) {
  const bridgeAutoSync = useBridgeAutoSync();
  const bridgeAutoSyncSetting = useBridgeAutoSyncSetting();
  const bridge = useBridge();

  const showModeChooser = bridgeAutoSyncSetting === undefined;
  const showBridgeSetup = bridgeAutoSync && bridge.detail !== "ready";

  if (showModeChooser) return <OnboardingModeChooser />;
  if (bridge.updating) return <BridgeRestartingIndicator />;
  if (showBridgeSetup) return <BridgeSetupGuide />;
  return children;
}
