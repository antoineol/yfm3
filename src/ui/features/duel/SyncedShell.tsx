import { useCheatMode, useCheatView } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import { CheatViewSwitch } from "../hand/CheatViewSwitch.tsx";
import { EmulatorBridgeBar } from "../hand/EmulatorBridgeBar.tsx";
import { RankTracker } from "../hand/RankTracker.tsx";
import { useCheatViewAutoSwitch } from "../hand/use-cheat-view-auto-switch.ts";
import { DuelEnded } from "./DuelEnded.tsx";
import { OpponentAvailablePool } from "./OpponentAvailablePool.tsx";
import { OpponentDuelView } from "./OpponentDuelView.tsx";
import { PlayerDuelView } from "./PlayerDuelView.tsx";
import { WaitingForDuel } from "./WaitingForDuel.tsx";

/** Renders synced-mode chrome and dispatches the body (player / opponent / waiting / ended). */
export function SyncedShell({ hasPostDuelContent }: { hasPostDuelContent: boolean }) {
  const bridge = useBridge();
  const cheatMode = useCheatMode();
  const cheatView = useCheatView();

  useCheatViewAutoSwitch();

  const isEnded = bridge.phase === "ended";
  const isResultsScreen = bridge.inDuel && isEnded;
  const inActiveDuel = bridge.inDuel && !isEnded;
  const showEnded = isResultsScreen && !hasPostDuelContent;
  const showOpponent = inActiveDuel && cheatMode && cheatView === "opponent";
  const showPlayer = inActiveDuel && !showOpponent;
  const showIdle = !bridge.inDuel && !hasPostDuelContent;
  const terrain = bridge.stats?.terrain ?? 0;

  return (
    <>
      <EmulatorBridgeBar />
      {bridge.inDuel && <RankTracker />}
      {showEnded && <DuelEnded lp={bridge.lp} stats={bridge.stats} />}
      {showIdle && <WaitingForDuel />}
      {inActiveDuel && (
        <div
          aria-hidden={!cheatMode}
          className={`fm-opponent-pool-wrap ${cheatMode ? "fm-opponent-pool-wrap--open" : ""}`}
        >
          <div>
            <OpponentAvailablePool
              handCards={bridge.opponentHandPool}
              reserveCards={bridge.opponentReservePool}
              terrain={terrain}
            />
          </div>
        </div>
      )}
      {inActiveDuel && <CheatViewSwitch />}
      {showOpponent && <OpponentDuelView />}
      {showPlayer && <PlayerDuelView />}
    </>
  );
}
