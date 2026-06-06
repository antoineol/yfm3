import { fieldBonus } from "../../../engine/data/field-bonus.ts";
import type { BridgeCard } from "../../../engine/worker/messages.ts";
import { CardName } from "../../components/CardName.tsx";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useCheatMode, useCheatView } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";
import type { BridgeState } from "../../lib/bridge-message-processor.ts";
import type {
  DuelCursorTarget,
  FieldCard,
  OpponentPoolCard,
} from "../../lib/bridge-state-interpreter.ts";
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
          <>
            <OpponentPoolMaxStats bridge={bridge} />
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
          </>
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

export function focusedStatsForDisplay(
  bridge: BridgeState,
  focused: BridgeCard,
): { atk: number; def: number } | null {
  if (focused.atk <= 0 && focused.def <= 0) return null;

  const fieldCard = fieldCardForTarget(bridge, bridge.cursorTarget);
  if (!fieldCard) return { atk: focused.atk, def: focused.def };

  const bonus = fieldBonus(bridge.stats?.terrain ?? 0, focused.type);
  return {
    atk: Math.max(0, fieldCard.atk + bonus),
    def: Math.max(0, fieldCard.def + bonus),
  };
}

export function opponentPoolMaxStats(bridge: BridgeState): { atk: number; def: number } | null {
  if (!bridge.gameData) return null;

  const cardsById = new Map(bridge.gameData.cards.map((card) => [card.id, card]));
  const poolCards = opponentPoolCards(bridge);
  if (poolCards.length === 0) return null;

  let atk = 0;
  let def = 0;
  let foundCard = false;
  for (const poolCard of poolCards) {
    const card = cardsById.get(poolCard.cardId);
    if (!card) continue;

    foundCard = true;
    const bonus = fieldBonus(bridge.stats?.terrain ?? 0, card.type);
    atk = Math.max(atk, Math.max(0, card.atk + bonus));
    def = Math.max(def, Math.max(0, card.def + bonus));
  }

  return foundCard ? { atk, def } : null;
}

export function duelFocusRowVisible(bridge: BridgeState, cheatMode: boolean): boolean {
  return bridge.inDuel && bridge.phase !== "ended" && cheatMode;
}

function opponentPoolCards(bridge: BridgeState): OpponentPoolCard[] {
  return [
    ...bridge.opponentHandPool.filter((card): card is OpponentPoolCard => card != null),
    ...bridge.opponentReservePool,
  ];
}

function FocusedCardTarget({ bridge, cheatMode }: { bridge: BridgeState; cheatMode: boolean }) {
  const resolveArtwork = useArtworkSrc();
  const focused = focusedCardForDisplay(bridge, cheatMode);
  const prediction = predictFocusedBattle(bridge);
  const stats = focused ? focusedStatsForDisplay(bridge, focused) : null;

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
            {stats ? (
              <>
                <span className="fm-duel-focused-atk">{String(stats.atk)}</span>
                <span className="fm-duel-focused-separator">/</span>
                <span className="fm-duel-focused-def">{String(stats.def)}</span>
              </>
            ) : (
              <span>{focused.typeLabel || focused.type || "Magic"}</span>
            )}
          </div>
        </div>
      </div>
      <BattlePredictionPill prediction={prediction} />
    </div>
  );
}

function fieldCardForTarget(
  bridge: BridgeState,
  target: DuelCursorTarget | null,
): FieldCard | null {
  if (!target) return null;
  const field = target.zone === "playerField" ? bridge.field : bridge.opponentField;
  if (target.zone !== "playerField" && target.zone !== "opponentField") return null;
  return (
    field.find((fc, i) => fc.cardId === target.cardId && (fc.slotIndex ?? i) === target.index) ??
    field.find((fc) => fc.cardId === target.cardId) ??
    null
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

export function OpponentPoolMaxStats({ bridge }: { bridge: BridgeState }) {
  const stats = opponentPoolMaxStats(bridge);
  if (!stats) return null;

  return (
    <figure
      className="fm-opponent-pool-max"
      title="Max ATK / DEF the opponent can play from its pool."
    >
      <figcaption className="fm-opponent-pool-max-header">
        <span aria-hidden="true" className="fm-opponent-pool-max-icon" />
        <span className="fm-opponent-pool-max-caption">MAX</span>
        <span className="sr-only">opponent pool maximum</span>
      </figcaption>
      <div className="fm-opponent-pool-max-values">
        <span className="fm-opponent-pool-max-item">
          <span className="fm-opponent-pool-max-label">ATK</span>
          <span className="fm-opponent-pool-max-value fm-duel-focused-atk">
            {String(stats.atk)}
          </span>
        </span>
        <span className="fm-opponent-pool-max-item">
          <span className="fm-opponent-pool-max-label">DEF</span>
          <span className="fm-opponent-pool-max-value fm-duel-focused-def">
            {String(stats.def)}
          </span>
        </span>
      </div>
    </figure>
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
