import { useSetAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/Button.tsx";
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
const DISCARD_MESSAGE = "Discard unsaved PAL FR wording changes?";
const LOADING_ROW_IDS = [
  "script-a",
  "script-b",
  "script-c",
  "name-a",
  "name-b",
  "description-a",
  "description-b",
  "description-c",
  "description-d",
] as const;

export function PalFrWordingPage({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState<PalFrWordingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const loadBackups = useSetAtom(loadBackupsAtom);

  useEffect(() => {
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
  }, []);

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
  const hasUnsavedChanges = changes.length > 0;
  const canSave =
    status?.supported === true &&
    !pending &&
    invalidEntries.length === 0 &&
    (changes.length > 0 || glyphPatchPending);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  function onBackClick() {
    if (hasUnsavedChanges && !window.confirm(DISCARD_MESSAGE)) return;
    onBack();
  }

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

  return (
    <section className="flex min-h-[38rem] flex-1 flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-3 py-3">
        <Button onClick={onBackClick} size="sm" variant="ghost">
          Back
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gold">
            PAL FR wording
          </h2>
          <p className="mt-0.5 truncate text-xs text-text-muted">
            {status?.supported
              ? `${status.discFilename} · ${entries.length} entries${
                  glyphPatchPending ? " · glyph renderer patch pending" : ""
                }`
              : "Active ISO text tables"}
          </p>
        </div>
        {status?.supported && (
          <>
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
          </>
        )}
      </header>

      {loading ? (
        <WordingLoadingState />
      ) : !status?.supported ? (
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="max-w-lg text-center">
            <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gold-dim" />
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-text-primary">
              PAL FR wording unavailable
            </h3>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              {status?.reason ?? "Patch state could not be read."}
            </p>
          </div>
        </div>
      ) : (
        <WordingEditorBody
          drafts={drafts}
          entries={entries}
          filtered={filtered}
          invalidEntryCount={invalidEntries.length}
          query={query}
          setDrafts={setDrafts}
          setQuery={setQuery}
        />
      )}
    </section>
  );
}

function WordingEditorBody({
  drafts,
  entries,
  filtered,
  invalidEntryCount,
  query,
  setDrafts,
  setQuery,
}: {
  drafts: Record<string, string>;
  entries: readonly PalFrWordingEntry[];
  filtered: readonly PalFrWordingEntry[];
  invalidEntryCount: number;
  query: string;
  setDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  setQuery: (query: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          aria-label="Search PAL FR wording"
          className="h-8 max-w-md text-xs"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search text, type, or offset"
          value={query}
        />
        <div className="min-w-0 flex-1 text-xs text-text-muted">
          {filtered.length}/{entries.length} shown
        </div>
      </div>
      {invalidEntryCount > 0 && (
        <p className="rounded-md border border-red-400/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">
          {invalidEntryCount} entr{invalidEntryCount === 1 ? "y is" : "ies are"} over budget.
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

function WordingLoadingState() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-8 w-full max-w-md animate-pulse rounded-md border border-border-subtle bg-bg-elevated" />
        <div className="h-3 w-44 animate-pulse rounded-full bg-border-subtle/70" />
      </div>
      <div className="overflow-hidden rounded-md border border-border-subtle">
        <div className="grid grid-cols-[9rem_7rem_minmax(0,1fr)_7rem] border-b border-border-subtle bg-bg-panel px-2 py-2">
          <div className="h-3 w-12 animate-pulse rounded-full bg-border-subtle/70" />
          <div className="h-3 w-16 animate-pulse rounded-full bg-border-subtle/70" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-border-subtle/70" />
          <div className="ml-auto h-3 w-12 animate-pulse rounded-full bg-border-subtle/70" />
        </div>
        {LOADING_ROW_IDS.map((rowId) => (
          <div
            className="grid grid-cols-[9rem_7rem_minmax(0,1fr)_7rem] items-center gap-2 border-b border-border-subtle/50 px-2 py-2 last:border-b-0"
            key={rowId}
          >
            <div className="h-3 w-24 animate-pulse rounded-full bg-bg-elevated" />
            <div className="h-3 w-16 animate-pulse rounded-full bg-bg-elevated" />
            <div className="h-9 animate-pulse rounded-md border border-border-subtle bg-bg-elevated" />
            <div className="ml-auto h-3 w-12 animate-pulse rounded-full bg-bg-elevated" />
          </div>
        ))}
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
