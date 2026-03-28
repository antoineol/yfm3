import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useCheatMode, useCheatView } from "../../db/use-user-preferences.ts";
import { useBridge } from "../../lib/bridge-context.tsx";

/** Player / Opponent segmented switch. Animates in/out with cheat mode, only during a duel. */
export function CheatViewSwitch() {
  const cheatMode = useCheatMode();
  const view = useCheatView();
  const save = useUpdatePreferences();
  const bridge = useBridge();
  const visible = cheatMode && bridge.inDuel;

  return (
    <div className={`fm-cheat-switch-wrap ${visible ? "fm-cheat-switch-wrap--open" : ""}`}>
      <div>
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
      </div>
    </div>
  );
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
