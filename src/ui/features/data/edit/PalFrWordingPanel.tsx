import { useSetAtom } from "jotai";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { BridgeCard } from "../../../../engine/worker/messages.ts";
import { Button } from "../../../components/Button.tsx";
import { Input } from "../../../components/Input.tsx";
import { loadBackupsAtom } from "./atoms.ts";
import {
  fetchPalFrWordingStatus,
  getCachedPalFrWordingStatus,
  type PalFrWordingEntry,
  type PalFrWordingStatus,
  primePalFrWordingStatusCache,
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
const WORDING_TABS = [
  { kind: "cardDescription", label: "Card descriptions" },
  { kind: "cardName", label: "Card names" },
  { kind: "script", label: "Dialogs" },
] as const satisfies readonly { kind: PalFrWordingEntry["kind"]; label: string }[];

export function PalFrWordingPage({
  backHref,
  cacheKey = "active",
  cards = [],
}: {
  backHref: string;
  cacheKey?: string;
  cards?: readonly BridgeCard[];
}) {
  const [status, setStatus] = useState<PalFrWordingStatus | null>(() =>
    getCachedPalFrWordingStatus(cacheKey),
  );
  const [loading, setLoading] = useState(() => getCachedPalFrWordingStatus(cacheKey) == null);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedKind, setSelectedKind] = useState<PalFrWordingEntry["kind"]>("cardDescription");
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    draftsFromStatus(getCachedPalFrWordingStatus(cacheKey)),
  );
  const loadBackups = useSetAtom(loadBackupsAtom);

  useEffect(() => {
    const cached = getCachedPalFrWordingStatus(cacheKey);
    if (cached) {
      setStatus(cached);
      setDrafts(draftsFromStatus(cached));
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setStatus(null);
    setDrafts({});
    fetchPalFrWordingStatus({ cacheKey })
      .then((next) => {
        if (!alive) return;
        setStatus(next);
        setDrafts(draftsFromStatus(next));
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
  }, [cacheKey]);

  const entries = status?.supported ? status.entries : [];
  const contexts = useMemo(() => buildEntryContexts(entries, cards), [entries, cards]);
  useEffect(() => {
    if (entries.length === 0 || entries.some((entry) => entry.kind === selectedKind)) return;
    const firstTabWithEntries = WORDING_TABS.find((tab) =>
      entries.some((entry) => entry.kind === tab.kind),
    );
    if (firstTabWithEntries) setSelectedKind(firstTabWithEntries.kind);
  }, [entries, selectedKind]);
  const visibleEntries = useMemo(
    () => entries.filter((entry) => entry.kind === selectedKind),
    [entries, selectedKind],
  );
  const filtered = useMemo(
    () => filterEntries(visibleEntries, query, contexts, drafts),
    [contexts, drafts, query, visibleEntries],
  );
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
      const nextStatus: PalFrWordingStatus = {
        ...status,
        entries: result.entries,
        glyphRenderingPatch: result.glyphRenderingPatch,
      };
      setStatus(nextStatus);
      primePalFrWordingStatusCache(cacheKey, nextStatus);
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
        <a
          className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          href={backHref}
          onClick={(event) => {
            if (hasUnsavedChanges && !window.confirm(DISCARD_MESSAGE)) event.preventDefault();
          }}
        >
          Back
        </a>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gold">
            PAL FR wording
          </h2>
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
          contexts={contexts}
          drafts={drafts}
          entries={entries}
          filtered={filtered}
          invalidEntryCount={invalidEntries.length}
          query={query}
          selectedKind={selectedKind}
          setDrafts={setDrafts}
          setQuery={setQuery}
          setSelectedKind={setSelectedKind}
        />
      )}
    </section>
  );
}

function WordingEditorBody({
  contexts,
  drafts,
  entries,
  filtered,
  invalidEntryCount,
  query,
  selectedKind,
  setDrafts,
  setSelectedKind,
  setQuery,
}: {
  contexts: ReadonlyMap<string, string>;
  drafts: Record<string, string>;
  entries: readonly PalFrWordingEntry[];
  filtered: readonly PalFrWordingEntry[];
  invalidEntryCount: number;
  query: string;
  selectedKind: PalFrWordingEntry["kind"];
  setDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  setSelectedKind: (kind: PalFrWordingEntry["kind"]) => void;
  setQuery: (query: string) => void;
}) {
  const editedCounts = useMemo(() => countEditedByKind(entries, drafts), [drafts, entries]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="inline-flex overflow-hidden rounded-md border border-border-subtle bg-bg-surface"
          role="tablist"
        >
          {WORDING_TABS.map((tab) => {
            const edited = editedCounts[tab.kind] ?? 0;
            return (
              <button
                className={`px-3 py-1.5 font-display text-[11px] uppercase tracking-widest transition-colors ${
                  selectedKind === tab.kind
                    ? "bg-bg-hover text-gold-bright"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                key={tab.kind}
                onClick={() => setSelectedKind(tab.kind)}
                role="tab"
                type="button"
              >
                {tab.label}
                {edited > 0 ? ` (${edited})` : ""}
              </button>
            );
          })}
        </div>
        <Input
          aria-label="Search PAL FR wording"
          className="h-8 max-w-md text-xs"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search text or context"
          value={query}
        />
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
              <th className="w-64 px-2 py-2 font-display">Context</th>
              <th className="px-2 py-2 font-display">Text</th>
              <th className="w-28 px-2 py-2 text-right font-display">Bytes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {filtered.map((entry) => (
              <WordingRow
                context={contexts.get(entry.id) ?? fallbackContext(entry)}
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
        <div className="grid grid-cols-[16rem_minmax(0,1fr)_7rem] border-b border-border-subtle bg-bg-panel px-2 py-2">
          <div className="h-3 w-20 animate-pulse rounded-full bg-border-subtle/70" />
          <div className="h-3 w-20 animate-pulse rounded-full bg-border-subtle/70" />
          <div className="ml-auto h-3 w-12 animate-pulse rounded-full bg-border-subtle/70" />
        </div>
        {LOADING_ROW_IDS.map((rowId) => (
          <div
            className="grid grid-cols-[16rem_minmax(0,1fr)_7rem] items-center gap-2 border-b border-border-subtle/50 px-2 py-2 last:border-b-0"
            key={rowId}
          >
            <div className="h-3 w-24 animate-pulse rounded-full bg-bg-elevated" />
            <div className="h-9 animate-pulse rounded-md border border-border-subtle bg-bg-elevated" />
            <div className="ml-auto h-3 w-12 animate-pulse rounded-full bg-bg-elevated" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WordingRow({
  context,
  draft,
  entry,
  onChange,
}: {
  context: string;
  draft: string;
  entry: PalFrWordingEntry;
  onChange: (text: string) => void;
}) {
  const encodedLength = estimateEncodedLength(draft);
  const overBudget = encodedLength > entry.maxByteLength;
  return (
    <tr className={draft !== entry.text ? "bg-bg-surface/50" : ""}>
      <td className="px-2 py-2 align-top text-text-secondary">{context}</td>
      <td className="px-2 py-1.5 align-top">
        <AutoGrowTextarea
          aria-label={`PAL FR wording text ${entry.id}`}
          onChange={(event) => onChange(event.currentTarget.value)}
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

function AutoGrowTextarea({
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  "aria-label": string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  });
  return (
    <textarea
      aria-label={ariaLabel}
      className="min-h-10 w-full resize-none overflow-hidden rounded-md border border-border-subtle bg-bg-elevated px-2 py-1.5 font-mono text-xs text-text-primary outline-none focus:border-gold-dim"
      onChange={onChange}
      ref={ref}
      rows={1}
      spellCheck={false}
      value={value}
    />
  );
}

function draftsFromStatus(status: PalFrWordingStatus | null): Record<string, string> {
  return status?.supported ? Object.fromEntries(status.entries.map((e) => [e.id, e.text])) : {};
}

function resetDrafts(
  entries: readonly PalFrWordingEntry[],
  setDrafts: (drafts: Record<string, string>) => void,
) {
  setDrafts(Object.fromEntries(entries.map((entry) => [entry.id, entry.text])));
}

function countEditedByKind(
  entries: readonly PalFrWordingEntry[],
  drafts: Record<string, string>,
): Partial<Record<PalFrWordingEntry["kind"], number>> {
  const counts: Partial<Record<PalFrWordingEntry["kind"], number>> = {};
  for (const entry of entries) {
    if ((drafts[entry.id] ?? entry.text) === entry.text) continue;
    counts[entry.kind] = (counts[entry.kind] ?? 0) + 1;
  }
  return counts;
}

function buildEntryContexts(
  entries: readonly PalFrWordingEntry[],
  cards: readonly BridgeCard[],
): ReadonlyMap<string, string> {
  const byId = new Map(cards.map((card) => [card.id, card]));
  return new Map(entries.map((entry) => [entry.id, contextForEntry(entry, byId)]));
}

function contextForEntry(
  entry: PalFrWordingEntry,
  cardsById: ReadonlyMap<number, BridgeCard>,
): string {
  if (entry.kind === "cardDescription") {
    const cardId = entry.entryIndex - 1;
    const card = cardsById.get(cardId);
    if (card) return compactParts(`#${cardId}`, card.name.trim(), shortCardType(card)).join(" · ");
    return `#${cardId}`;
  }
  if (entry.kind === "cardName") {
    const cardId = entry.entryIndex + 1;
    const card = cardsById.get(cardId);
    if (card) return compactParts(`#${cardId}`, shortCardType(card), atkDef(card)).join(" · ");
    return `#${cardId}`;
  }
  return fallbackContext(entry);
}

function fallbackContext(entry: PalFrWordingEntry): string {
  return entry.kind === "script" ? `Dialog ${entry.entryIndex + 1}` : `#${entry.entryIndex}`;
}

function compactParts(...parts: (string | undefined)[]): string[] {
  return parts.filter((part): part is string => Boolean(part));
}

function shortCardType(card: BridgeCard): string | undefined {
  return (card.typeLabel || card.type).trim() || undefined;
}

function atkDef(card: BridgeCard): string | undefined {
  return card.atk > 0 || card.def > 0 ? `${card.atk}/${card.def}` : undefined;
}

function filterEntries(
  entries: readonly PalFrWordingEntry[],
  query: string,
  contexts: ReadonlyMap<string, string>,
  drafts: Record<string, string>,
): PalFrWordingEntry[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [...entries];
  return entries.filter((entry) => {
    const context = contexts.get(entry.id) ?? fallbackContext(entry);
    return (
      (drafts[entry.id] ?? entry.text).toLocaleLowerCase().includes(needle) ||
      context.toLocaleLowerCase().includes(needle)
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
