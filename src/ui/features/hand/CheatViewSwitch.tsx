import type { BridgeCard } from "../../../engine/worker/messages.ts";
import { CardName } from "../../components/CardName.tsx";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useCheatMode, useCheatView } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import type { BridgeState } from "../../lib/bridge-message-processor.ts";
import { formatCardId } from "../../lib/format.ts";
import { useArtworkSrc } from "../../lib/use-artwork-src.ts";
import { type BattlePrediction, predictFocusedBattle } from "../duel/battle-prediction.ts";

/** Focused-card strip plus Player / Opponent segmented switch during a duel. */
export function CheatViewSwitch() {
  const cheatMode = useCheatMode();
  const view = useCheatView();
  const save = useUpdatePreferences();
  const bridge = useBridge();
  const visible = duelFocusRowVisible(bridge, cheatMode);

  return (
    <div className={`fm-cheat-switch-wrap ${visible ? "fm-cheat-switch-wrap--open" : ""}`}>
      <div className="fm-duel-focus-row">
        <FocusedCardTarget bridge={bridge} cheatMode={cheatMode} />
        {cheatMode && (
          <div className="fm-cheat-switch">
            <SwitchOption
              active={view === "player"}
              label="Player"
              onClick={() => save({ cheatView: "player" })}
            />
            <SwitchOption
              active={view === "opponent"}
              label="Opponent"
              onClick={() => save({ cheatView: "opponent" })}
              variant="opponent"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function focusedCardForDisplay(bridge: BridgeState, cheatMode: boolean): BridgeCard | null {
  const target = bridge.cursorTarget;
  if (!duelFocusRowVisible(bridge, cheatMode) || !target) return null;
  return bridge.gameData?.cards.find((card) => card.id === target.cardId) ?? null;
}

export function duelFocusRowVisible(bridge: BridgeState, cheatMode: boolean): boolean {
  return bridge.inDuel && bridge.phase !== "ended" && cheatMode;
}

function FocusedCardTarget({ bridge, cheatMode }: { bridge: BridgeState; cheatMode: boolean }) {
  const resolveArtwork = useArtworkSrc();
  const focused = focusedCardForDisplay(bridge, cheatMode);
  const prediction = predictFocusedBattle(bridge);

  if (!focused) {
    return <div aria-hidden="true" className="fm-duel-focused-slot" />;
  }

  return (
    <div className="fm-duel-focused-slot">
      <div className="fm-duel-focused-card">
        <img
          alt=""
          className="fm-duel-focused-art"
          draggable={false}
          src={resolveArtwork(focused.id)}
        />
        <div className="min-w-0">
          <div className="fm-duel-focused-main">
            <span className="fm-duel-focused-id">#{formatCardId(focused.id)}</span>
            <CardName cardId={focused.id} className="fm-duel-focused-name" name={focused.name} />
          </div>
          <div className="fm-duel-focused-stats">
            {focused.atk > 0 || focused.def > 0 ? (
              <>
                <span className="fm-duel-focused-atk">{String(focused.atk)}</span>
                <span className="fm-duel-focused-separator">/</span>
                <span className="fm-duel-focused-def">{String(focused.def)}</span>
              </>
            ) : (
              <span>{focused.type || "Magic"}</span>
            )}
          </div>
        </div>
      </div>
      <BattlePredictionPill prediction={prediction} />
    </div>
  );
}

function BattlePredictionPill({ prediction }: { prediction: BattlePrediction | null }) {
  if (!prediction) return null;
  return (
    <div className={`fm-battle-prediction fm-battle-prediction--${prediction.outcome}`}>
      <span className="fm-battle-prediction-label">
        {battlePredictionLabel(prediction.outcome)}
      </span>
    </div>
  );
}

export function battlePredictionLabel(outcome: BattlePrediction["outcome"]): string {
  if (outcome === "win") return "Win";
  if (outcome === "bothDestroyed") return "Both destroyed";
  return "Lose";
}

function SwitchOption({
  label,
  active,
  onClick,
  variant,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "opponent";
}) {
  const activeClass = active
    ? variant === "opponent"
      ? "fm-cheat-switch-opt--active-opp"
      : "fm-cheat-switch-opt--active"
    : "";

  return (
    <button className={`fm-cheat-switch-opt ${activeClass}`} onClick={onClick} type="button">
      {label}
    </button>
  );
}
