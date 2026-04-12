import { useCheatMode, useCheatView } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { CheatViewSwitch } from "../hand/CheatViewSwitch.tsx";
import { CpuCheatBanner } from "../hand/CpuCheatBanner.tsx";
import { EmulatorBridgeBar } from "../hand/EmulatorBridgeBar.tsx";
import { RankTracker } from "../hand/RankTracker.tsx";
import { useCheatViewAutoSwitch } from "../hand/use-cheat-view-auto-switch.ts";
import { useSyncCpuSwaps } from "../hand/use-sync-cpu-swaps.ts";
import { DuelEnded } from "./DuelEnded.tsx";
import { OpponentDuelView } from "./OpponentDuelView.tsx";
import { PlayerDuelView } from "./PlayerDuelView.tsx";
import { WaitingForDuel } from "./WaitingForDuel.tsx";

/** Renders synced-mode chrome and dispatches the body (player / opponent / waiting / ended). */
export function SyncedShell({ hasPostDuelContent }: { hasPostDuelContent: boolean }) {
  const bridge = useBridge();
  const cheatMode = useCheatMode();
  const cheatView = useCheatView();

  useSyncCpuSwaps();
  useCheatViewAutoSwitch();

  const showOpponent = bridge.inDuel && cheatMode && cheatView === "opponent";
  const showPlayer = bridge.inDuel && !showOpponent;
  const showIdle = !bridge.inDuel && !hasPostDuelContent;

  return (
    <>
      <EmulatorBridgeBar />
      <RankTracker />
      {showIdle &&
        (bridge.phase === "ended" ? (
          <DuelEnded lp={bridge.lp} stats={bridge.stats} />
        ) : (
          <WaitingForDuel />
        ))}
      <CpuCheatBanner />
      <CheatViewSwitch />
      {showOpponent && <OpponentDuelView />}
      {showPlayer && <PlayerDuelView />}
    </>
  );
}
