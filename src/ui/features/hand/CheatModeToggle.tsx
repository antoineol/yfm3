import { useAtom, useSetAtom } from "jotai";
import { cheatModeAtom, cheatViewAtom } from "../../lib/atoms.ts";

/** Compact Millennium Eye toggle for the header bar. */
export function CheatModeToggle() {
  const [active, setActive] = useAtom(cheatModeAtom);
  const setCheatView = useSetAtom(cheatViewAtom);

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    if (next) setCheatView("opponent");
  };

  return (
    <button
      aria-label={active ? "Disable cheat mode" : "Enable cheat mode"}
      aria-pressed={active}
      className={`fm-cheat-btn ${active ? "fm-cheat-btn--active" : ""}`}
      onClick={handleToggle}
      type="button"
    >
      <span className="fm-cheat-btn-eye">
        <img
          alt=""
          className="fm-cheat-btn-img fm-cheat-btn-img--static"
          src="/images/cheat-mode/cheat-mode-millenium-eye.webp"
        />
        <img
          alt=""
          className="fm-cheat-btn-img fm-cheat-btn-img--active"
          src="/images/cheat-mode/cheat-mode-millenium-eye-active.webp"
        />
        <img
          alt=""
          className="fm-cheat-btn-img fm-cheat-btn-img--animated"
          src="/images/cheat-mode/cheat-mode-millenium-eye-hovered.webp"
        />
      </span>
      <span className="fm-cheat-btn-label">Cheat mode</span>
    </button>
  );
}
