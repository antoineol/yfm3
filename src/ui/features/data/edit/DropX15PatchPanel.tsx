import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/Button.tsx";
import { loadBackupsAtom } from "./atoms.ts";
import { type DropX15Status, fetchDropX15Status, putDropX15Patch } from "./bridge-client.ts";

const CONFIRM_MESSAGE =
  "Patching 15-card drops will close the running game in DuckStation if the ISO is locked. " +
  "Any unsaved in-duel progress will be lost. Continue?";

export function DropX15PatchPanel() {
  const [status, setStatus] = useState<DropX15Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const loadBackups = useSetAtom(loadBackupsAtom);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchDropX15Status()
      .then((next) => {
        if (alive) setStatus(next);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        if (alive) toast.error(`15-drop status unavailable: ${message}`);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function onEnable() {
    if (!status?.supported || status.enabled) return;
    if (!window.confirm(CONFIRM_MESSAGE)) return;

    setPending(true);
    try {
      const result = await putDropX15Patch();
      if (!result.ok) {
        const detail = result.reason ? ` (${result.reason})` : "";
        toast.error(`15-drop patch failed: ${result.error}${detail}`);
        return;
      }
      setStatus({
        ...result.status,
        discFilename: status.discFilename,
        gameSerial: status.gameSerial,
      });
      await loadBackups();
      const backupPart = result.backup ? ` · backup ${result.backup.filename}` : "";
      const reloadPart = result.closedGame ? " Reload the game in DuckStation." : "";
      toast.success(`15-card drops enabled${backupPart}.${reloadPart}`, { duration: 10000 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`15-drop patch failed: ${message}`);
    } finally {
      setPending(false);
    }
  }

  const badge = statusLabel(status, loading);
  const disabled = loading || pending || !status?.supported || status.enabled;
  const detail = statusDetail(status, loading);

  return (
    <section className="flex flex-wrap items-center gap-3 px-3 py-2 border-b border-border-subtle bg-bg-surface/45">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-xs font-semibold uppercase tracking-widest text-gold-dim">
            Duel rewards
          </span>
          <span
            className={`rounded-md border px-2 py-0.5 text-[11px] font-display uppercase tracking-widest ${badge.className}`}
          >
            {badge.text}
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-text-muted">{detail}</p>
      </div>
      <Button
        disabled={disabled}
        onClick={onEnable}
        size="sm"
        variant={status?.enabled ? "ghost" : "outline"}
      >
        {pending ? "Patching..." : status?.enabled ? "15 drops active" : "Enable 15 drops"}
      </Button>
    </section>
  );
}

function statusLabel(
  status: DropX15Status | null,
  loading: boolean,
): { text: string; className: string } {
  if (loading) return { text: "Checking", className: "border-border-subtle text-text-muted" };
  if (!status) return { text: "Unknown", className: "border-border-subtle text-text-muted" };
  if (!status.supported)
    return { text: "Unsupported", className: "border-red-500/40 text-red-300" };
  if (status.enabled) return { text: "15 drops", className: "border-green-500/40 text-green-300" };
  return { text: "1 drop", className: "border-gold-dim/60 text-gold" };
}

function statusDetail(status: DropX15Status | null, loading: boolean): string {
  if (loading) return "Checking the active ISO patch state.";
  if (!status) return "Patch state could not be read.";
  if (!status.supported) return status.reason;
  if (status.enabled) return `${status.discFilename} is already patched.`;
  return `${status.discFilename} matches ${status.definitionName}.`;
}
