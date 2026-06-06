import { useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/Button.tsx";
import { Dialog } from "../../../components/Dialog.tsx";
import { Input } from "../../../components/Input.tsx";
import { loadBackupsAtom } from "./atoms.ts";
import {
  fetchPalFrWordingStatus,
  type PalFrWordingEntry,
  type PalFrWordingStatus,
  putPalFrWordingEntries,
} from "./bridge-client.ts";

const CONFIRM_MESSAGE =
  "Saving will close the running game in DuckStation if needed so the PAL FR wording and live glyph renderer patch can be written to the ISO.\n\n" +
  "Any unsaved in-duel progress will be lost. Continue?";

export function PalFrWordingDialogButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-2 py-1 font-display text-[11px] uppercase tracking-widest text-text-primary transition-colors hover:bg-bg-hover cursor-pointer"
        onClick={() => setOpen(true)}
        type="button"
      >
        PAL FR wording
      </button>
      <Dialog
        onClose={() => setOpen(false)}
        open={open}
        popupClassName="fixed inset-3 z-50 bg-bg-panel border border-border-accent rounded-xl p-5 shadow-overlay focus:outline-none sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[calc(100dvh-2rem)] sm:w-[min(96vw,72rem)] sm:-translate-x-1/2 sm:-translate-y-1/2"
        title="PAL FR wording"
      >
        <PalFrWordingEditor active={open} />
      </Dialog>
    </>
  );
}

function PalFrWordingEditor({ active }: { active: boolean }) {
  const [status, setStatus] = useState<PalFrWordingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const loadBackups = useSetAtom(loadBackupsAtom);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    setLoading(true);
    fetchPalFrWordingStatus()
      .then((next) => {
        if (!alive) return;
        setStatus(next);
        setDrafts(
          next.supported ? Object.fromEntries(next.entries.map((e) => [e.id, e.text])) : {},
        );
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        if (alive) toast.error(`PAL FR wording unavailable: ${message}`);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [active]);

  const entries = status?.supported ? status.entries : [];
  const filtered = useMemo(() => filterEntries(entries, query), [entries, query]);
  const changes = useMemo(
    () =>
      entries
        .map((entry) => ({ entry, text: drafts[entry.id] ?? entry.text }))
        .filter(({ entry, text }) => text !== entry.text),
    [drafts, entries],
  );
  const invalidEntries = entries.filter(
    (entry) => estimateEncodedLength(drafts[entry.id] ?? entry.text) > entry.maxByteLength,
  );
  const glyphPatchPending = Boolean(status?.supported && !status.glyphRenderingPatch.applied);
  const canSave =
    status?.supported === true &&
    !pending &&
    invalidEntries.length === 0 &&
    (changes.length > 0 || glyphPatchPending);

  async function onSave() {
    if (!status?.supported || !canSave) return;
    if (!window.confirm(CONFIRM_MESSAGE)) return;
    setPending(true);
    try {
      const result = await putPalFrWordingEntries(
        changes.map(({ entry, text }) => ({ entryId: entry.id, text })),
      );
      if (!result.ok) {
        const detail = result.reason ? ` (${result.reason})` : "";
        toast.error(`Wording patch failed: ${result.error}${detail}`);
        return;
      }
      setStatus({
        ...status,
        entries: result.entries,
        glyphRenderingPatch: result.glyphRenderingPatch,
      });
      setDrafts(Object.fromEntries(result.entries.map((entry) => [entry.id, entry.text])));
      await loadBackups();
      const backupPart = result.backup ? ` · backup ${result.backup.filename}` : "";
      const glyphPart = result.glyphRenderingPatch.changed ? " Glyph renderer patched." : "";
      const reloadPart = result.closedGame ? " Reload the game in DuckStation." : "";
      toast.success(`PAL FR wording saved${backupPart}.${glyphPart}${reloadPart}`, {
        duration: 10000,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Wording patch failed: ${message}`);
    } finally {
      setPending(false);
    }
  }

  if (loading) return <p className="py-8 text-sm text-text-muted">Checking the active disc.</p>;
  if (!status?.supported) {
    return (
      <p className="py-8 text-sm text-text-muted">
        {status?.reason ?? "Patch state could not be read."}
      </p>
    );
  }

  return (
    <div className="flex max-h-[calc(100dvh-8rem)] min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          aria-label="Search PAL FR wording"
          className="h-8 max-w-md text-xs"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search text, type, or offset"
          value={query}
        />
        <div className="min-w-0 flex-1 text-xs text-text-muted">
          {status.discFilename} · {entries.length} entries
          {glyphPatchPending ? " · glyph renderer patch pending" : ""}
        </div>
        <Button
          disabled={pending || changes.length === 0}
          onClick={() => resetDrafts(entries, setDrafts)}
          size="sm"
          variant="ghost"
        >
          Reset
        </Button>
        <Button disabled={!canSave} onClick={onSave} size="sm" variant="outline">
          {pending ? "Saving..." : `Save${changes.length > 0 ? ` · ${changes.length}` : ""}`}
        </Button>
      </div>
      {invalidEntries.length > 0 && (
        <p className="rounded-md border border-red-400/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">
          {invalidEntries.length} entr{invalidEntries.length === 1 ? "y is" : "ies are"} over
          budget.
        </p>
      )}
      <div className="min-h-0 overflow-auto rounded-md border border-border-subtle">
        <table className="w-full min-w-[56rem] border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-bg-panel text-[11px] uppercase tracking-widest text-text-muted">
            <tr className="border-b border-border-subtle">
              <th className="w-36 px-2 py-2 font-display">Type</th>
              <th className="w-28 px-2 py-2 font-display">Offset</th>
              <th className="px-2 py-2 font-display">Text</th>
              <th className="w-28 px-2 py-2 text-right font-display">Bytes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {filtered.map((entry) => (
              <WordingRow
                draft={drafts[entry.id] ?? entry.text}
                entry={entry}
                key={entry.id}
                onChange={(text) => setDrafts((current) => ({ ...current, [entry.id]: text }))}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-3 py-8 text-sm text-text-muted">No matching entries.</p>
        )}
      </div>
    </div>
  );
}

function WordingRow({
  draft,
  entry,
  onChange,
}: {
  draft: string;
  entry: PalFrWordingEntry;
  onChange: (text: string) => void;
}) {
  const encodedLength = estimateEncodedLength(draft);
  const overBudget = encodedLength > entry.maxByteLength;
  return (
    <tr className={draft !== entry.text ? "bg-bg-surface/50" : ""}>
      <td className="px-2 py-2 align-top text-text-secondary">{kindLabel(entry.kind)}</td>
      <td className="px-2 py-2 align-top font-mono text-[11px] text-text-muted">
        0x{entry.offset.toString(16)}
      </td>
      <td className="px-2 py-1.5 align-top">
        <textarea
          aria-label={`PAL FR wording text ${entry.id}`}
          className="min-h-10 w-full resize-y rounded-md border border-border-subtle bg-bg-elevated px-2 py-1.5 font-mono text-xs text-text-primary outline-none focus:border-gold-dim"
          onChange={(event) => onChange(event.currentTarget.value)}
          spellCheck={false}
          value={draft}
        />
      </td>
      <td
        className={`px-2 py-2 text-right align-top font-mono text-[11px] ${
          overBudget ? "text-red-300" : "text-text-muted"
        }`}
      >
        {encodedLength}/{entry.maxByteLength}
      </td>
    </tr>
  );
}

function resetDrafts(
  entries: readonly PalFrWordingEntry[],
  setDrafts: (drafts: Record<string, string>) => void,
) {
  setDrafts(Object.fromEntries(entries.map((entry) => [entry.id, entry.text])));
}

function filterEntries(entries: PalFrWordingEntry[], query: string): PalFrWordingEntry[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return entries;
  return entries.filter((entry) => {
    const offset = `0x${entry.offset.toString(16)}`;
    return (
      entry.text.toLocaleLowerCase().includes(needle) ||
      offset.includes(needle) ||
      kindLabel(entry.kind).toLocaleLowerCase().includes(needle)
    );
  });
}

function estimateEncodedLength(text: string): number {
  let length = 0;
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/’/g, "'");
  for (let i = 0; i < normalized.length; i++) {
    if (normalized[i] === "{") {
      const close = normalized.indexOf("}", i + 1);
      if (close !== -1) {
        const token = normalized.slice(i + 1, close).trim();
        const bytes = estimateTokenLength(token);
        if (bytes != null) {
          length += bytes;
          i = close;
          continue;
        }
      }
    }
    length += normalized[i] === "…" ? 3 : 1;
  }
  return length;
}

function estimateTokenLength(token: string): number | null {
  const parts = token.split(/\s+/).filter(Boolean);
  if (parts.length === 1 && /^[0-9a-f]{1,2}$/i.test(parts[0] ?? "")) return 1;
  if (
    parts.length === 3 &&
    parts[0]?.toLowerCase() === "f8" &&
    /^[0-9a-f]{1,2}$/i.test(parts[1] ?? "") &&
    /^[0-9a-f]{1,2}$/i.test(parts[2] ?? "")
  ) {
    return 3;
  }
  return null;
}

function kindLabel(kind: PalFrWordingEntry["kind"]): string {
  if (kind === "cardDescription") return "Card description";
  if (kind === "cardName") return "Card name";
  return "Script";
}
