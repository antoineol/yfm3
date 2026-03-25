import { useBridgeAutoSync, useBridgeAutoSyncSetting } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { useHasUserData } from "../../lib/use-has-user-data.ts";
import { BridgeSetupGuide } from "../bridge/BridgeSetupGuide.tsx";
import { OnboardingModeChooser } from "./OnboardingModeChooser.tsx";
import { OnboardingSetup } from "./OnboardingSetup.tsx";

export function useShowOnboarding(): boolean {
  const bridgeAutoSync = useBridgeAutoSync();
  const bridgeAutoSyncSetting = useBridgeAutoSyncSetting();
  const bridge = useBridge();
  const hasUserData = useHasUserData();

  const showModeChooser = bridgeAutoSyncSetting === undefined;
  const showBridgeSetup = bridgeAutoSync && bridge.detail !== "ready";
  const showFullAutoSetup = showBridgeSetup && !hasUserData;
  return showModeChooser || showFullAutoSetup || showBridgeSetup;
}

export function TabOnboardingGate({ children }: { children: React.ReactNode }) {
  const bridgeAutoSync = useBridgeAutoSync();
  const bridgeAutoSyncSetting = useBridgeAutoSyncSetting();
  const bridge = useBridge();
  const hasUserData = useHasUserData();

  const showModeChooser = bridgeAutoSyncSetting === undefined;
  const showBridgeSetup = bridgeAutoSync && bridge.detail !== "ready";
  const showFullAutoSetup = showBridgeSetup && !hasUserData;

  if (showModeChooser) return <OnboardingModeChooser />;
  if (showFullAutoSetup) return <OnboardingSetup />;
  if (showBridgeSetup) return <BridgeSetupGuide />;
  return children;
}
