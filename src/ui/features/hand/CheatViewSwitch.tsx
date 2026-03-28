import { useAtom, useAtomValue } from "jotai";
import { cheatModeAtom, cheatViewAtom } from "../../lib/atoms.ts";

/** Player / Opponent segmented switch. Animates in/out with cheat mode. */
export function CheatViewSwitch() {
  const cheatMode = useAtomValue(cheatModeAtom);
  const [view, setView] = useAtom(cheatViewAtom);

  return (
    <div className={`fm-cheat-switch-wrap ${cheatMode ? "fm-cheat-switch-wrap--open" : ""}`}>
      <div>
        <div className="fm-cheat-switch">
          <SwitchOption
            active={view === "player"}
            label="Player"
            onClick={() => setView("player")}
          />
          <SwitchOption
            active={view === "opponent"}
            label="Opponent"
            onClick={() => setView("opponent")}
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
