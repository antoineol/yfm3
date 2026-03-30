import { toast } from "sonner";
import { useUpdatePreferences } from "../../db/use-update-preferences.ts";
import { useCheatMode } from "../../db/use-user-preferences.ts";

/** Compact Millennium Eye toggle for the header bar. */
export function CheatModeToggle() {
  const active = useCheatMode();
  const save = useUpdatePreferences();

  const handleToggle = () => {
    const next = !active;
    save({ cheatMode: next });
    toast(next ? "Cheat mode enabled" : "Cheat mode disabled");
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
