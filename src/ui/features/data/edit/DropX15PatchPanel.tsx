import { useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/Button.tsx";
import { loadBackupsAtom } from "./atoms.ts";
import { type DropX15Status, fetchDropX15Status, putDropX15Patch } from "./bridge-client.ts";

export function DropX15PatchPanel() {
  const [status, setStatus] = useState<DropX15Status | null>(null);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const loadBackups = useSetAtom(loadBackupsAtom);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchDropX15Status()
      .then((next) => {
        if (!alive) return;
        setStatus(next);
        setSelectedCount(defaultSelectedCount(next));
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        if (alive) toast.error(`Reward patch status unavailable: ${message}`);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function onApply() {
    if (
      !status?.supported ||
      selectedCount == null ||
      isSelectedRewardActive(status, selectedCount)
    ) {
      return;
    }
    if (!window.confirm(confirmMessage(status.cardDropCount, selectedCount))) return;

    setPending(true);
    try {
      const result = await putDropX15Patch(selectedCount);
      if (!result.ok) {
        const detail = result.reason ? ` (${result.reason})` : "";
        toast.error(`Reward patch failed: ${result.error}${detail}`);
        return;
      }
      setStatus({
        ...result.status,
        discFilename: status.discFilename,
        gameSerial: status.gameSerial,
      });
      setSelectedCount(defaultSelectedCount(result.status));
      await loadBackups();
      const backupPart = result.backup ? ` · backup ${result.backup.filename}` : "";
      const reloadPart = result.closedGame ? " Reload the game in DuckStation." : "";
      toast.success(
        `${rewardCount(result.status)}-card and starchip rewards enabled${backupPart}.${reloadPart}`,
        {
          duration: 10000,
        },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Reward patch failed: ${message}`);
    } finally {
      setPending(false);
    }
  }

  const badge = statusLabel(status, loading);
  const detail = statusDetail(status, loading);
  const availableCounts = status?.supported ? status.availableDropCounts : [];
  const canApply =
    status?.supported &&
    selectedCount != null &&
    !isSelectedRewardActive(status, selectedCount) &&
    !loading &&
    !pending;
  const optionButtons = useMemo(
    () =>
      availableCounts.map((count) => (
        <button
          aria-pressed={selectedCount === count}
          className={[
            "h-8 min-w-12 rounded-md border px-2.5 font-display text-xs uppercase tracking-widest transition-colors",
            selectedCount === count
              ? "border-gold bg-gold/15 text-gold"
              : "border-border-subtle bg-bg-panel text-text-muted hover:border-gold-dim hover:text-text-secondary",
          ].join(" ")}
          disabled={pending}
          key={count}
          onClick={() => setSelectedCount(count)}
          type="button"
        >
          x{count}
        </button>
      )),
    [availableCounts, pending, selectedCount],
  );

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
      {availableCounts.length > 0 && (
        <fieldset aria-label="Card drops per duel" className="flex flex-wrap items-center gap-1.5">
          {optionButtons}
        </fieldset>
      )}
      <Button
        className="min-w-20"
        disabled={!canApply}
        onClick={onApply}
        size="sm"
        variant="outline"
      >
        {pending ? "Applying..." : "Apply"}
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
  return {
    text: `${rewardCount(status)} rewards`,
    className: status.enabled
      ? "border-green-500/40 text-green-300"
      : "border-gold-dim/60 text-gold",
  };
}

function statusDetail(status: DropX15Status | null, loading: boolean): string {
  if (loading) return "Checking the active ISO patch state.";
  if (!status) return "Patch state could not be read.";
  if (!status.supported) return status.reason;
  const prefix = `${status.discFilename}: ${rewardCount(status)} card${rewardCount(status) === 1 ? "" : "s"} per duel.`;
  if (status.starchipMultiplier !== status.cardDropCount) {
    return `${prefix} Starchips are x${status.starchipMultiplier}; apply x${status.cardDropCount} to match them.`;
  }
  if (!status.availableDropCounts.includes(status.cardDropCount)) {
    return `${prefix} Choose a supported target to change it.`;
  }
  if (!isSelectedRewardActive(status, status.cardDropCount)) {
    return `${prefix} Apply x${status.cardDropCount} to refresh the reward patch.`;
  }
  return prefix;
}

function rewardCount(status: DropX15Status | null): number {
  return status?.supported ? status.cardDropCount : 15;
}

function defaultSelectedCount(status: DropX15Status): number | null {
  if (!status.supported) return null;
  return status.availableDropCounts.includes(status.cardDropCount) ? status.cardDropCount : null;
}

function isSelectedRewardActive(
  status: Extract<DropX15Status, { supported: true }>,
  count: number,
) {
  return (
    count === status.cardDropCount &&
    count === status.starchipMultiplier &&
    (status.enabled || count === 1)
  );
}

function confirmMessage(currentCount: number, nextCount: number): string {
  const longRewardWarning =
    nextCount >= 50 ? " Large reward counts can make the result sequence take much longer." : "";
  return (
    `Change card rewards from x${currentCount} to x${nextCount}? ` +
    "This edits the active disc image and creates an ISO backup. " +
    "If DuckStation is locking the image, the bridge will close the running game. " +
    `Any unsaved in-duel progress will be lost.${longRewardWarning}`
  );
}
