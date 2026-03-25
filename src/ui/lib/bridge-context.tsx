import { createContext, useContext } from "react";
import type { EmulatorBridge } from "./use-emulator-bridge.ts";

const BridgeContext = createContext<EmulatorBridge | null>(null);

export function BridgeProvider({
  bridge,
  children,
}: {
  bridge: EmulatorBridge;
  children: React.ReactNode;
}) {
  return <BridgeContext value={bridge}>{children}</BridgeContext>;
}

export function useBridge(): EmulatorBridge {
  const ctx = useContext(BridgeContext);
  if (!ctx) throw new Error("useBridge must be used within a BridgeProvider");
  return ctx;
}
