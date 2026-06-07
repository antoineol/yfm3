import { useSetAtom } from "jotai";
import type {
  ChangeEvent,
  CSSProperties,
  FormEvent,
  ClipboardEvent as ReactClipboardEvent,
} from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  "Saving will close the running game in DuckStation so PAL FR wording offsets can be rebuilt safely in the ISO.\n\n" +
  "Any unsaved in-duel progress will be lost. Continue?";
const DISCARD_MESSAGE = "Discard unsaved PAL FR wording changes?";
const LOADING_ROW_IDS = [
  "name-a",
  "name-b",
  "description-a",
  "description-b",
  "description-c",
  "description-d",
] as const;
const WORDING_TABS = [
  { kind: "cardName", label: "Card names", tab: "names" },
  { kind: "cardDescription", label: "Card descriptions", tab: "descriptions" },
] as const satisfies readonly {
  kind: PalFrWordingEntry["kind"];
  label: string;
  tab: WordingTab;
}[];

type WordingTab = "names" | "descriptions";
const WORDING_TAB_CONSTRAINTS: Record<WordingTab, WordingTabConstraints> = {
  names: { maxEntryLength: 33, maxLineLength: 33, maxLines: 1 },
  descriptions: { maxEntryLength: 124, maxLineLength: 29 },
};
type DirtyDraft = {
  kind: PalFrWordingEntry["kind"];
  text: string;
};
type WordingTabConstraints = {
  maxEntryLength: number;
  maxLineLength: number;
  maxLines?: number;
};
type WordingRowProps = {
  constraints: WordingTabConstraints;
  context: string;
  entry: PalFrWordingEntry;
  initialText: string;
  onDraftChange: (entry: PalFrWordingEntry, text: string) => void;
};

export function PalFrWordingPage({
  backHref,
  cacheKey = "active",
  cards = [],
  selectedTab = "names",
  tabHrefFor = (tab) => `#data/edit/wording/${tab}`,
}: {
  backHref: string;
  cacheKey?: string;
  cards?: readonly BridgeCard[];
  selectedTab?: WordingTab;
  tabHrefFor?: (tab: WordingTab) => string;
}) {
  const [status, setStatus] = useState<PalFrWordingStatus | null>(() =>
    getCachedPalFrWordingStatus(cacheKey),
  );
  const [loading, setLoading] = useState(() => getCachedPalFrWordingStatus(cacheKey) == null);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState("");
  const [dirtyDrafts, setDirtyDrafts] = useState<Record<string, DirtyDraft>>({});
  const [resetVersion, setResetVersion] = useState(0);
  const loadBackups = useSetAtom(loadBackupsAtom);

  useEffect(() => {
    const cached = getCachedPalFrWordingStatus(cacheKey);
    if (cached) {
      setStatus(cached);
      setDirtyDrafts({});
      setResetVersion((version) => version + 1);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setStatus(null);
    setDirtyDrafts({});
    setResetVersion((version) => version + 1);
    fetchPalFrWordingStatus({ cacheKey })
      .then((next) => {
        if (!alive) return;
        setStatus(next);
        setDirtyDrafts({});
        setResetVersion((version) => version + 1);
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
  const selectedKind = kindForTab(selectedTab);
  const visibleEntries = useMemo(
    () => entries.filter((entry) => entry.kind === selectedKind),
    [entries, selectedKind],
  );
  const selectedConstraints = WORDING_TAB_CONSTRAINTS[selectedTab];
  const filtered = useMemo(
    () => filterEntries(visibleEntries, query, contexts, dirtyDrafts),
    [contexts, dirtyDrafts, query, visibleEntries],
  );
  const changes = useMemo(
    () =>
      entries
        .map((entry) => ({ entry, text: dirtyDrafts[entry.id]?.text ?? entry.text }))
        .filter(({ entry, text }) => text !== entry.text),
    [dirtyDrafts, entries],
  );
  const glyphPatchPending = Boolean(status?.supported && !status.glyphRenderingPatch.applied);
  const hasUnsavedChanges = changes.length > 0;
  const canSave =
    status?.supported === true && !pending && (changes.length > 0 || glyphPatchPending);

  const onDraftChange = useCallback((entry: PalFrWordingEntry, text: string) => {
    setDirtyDrafts((current) => {
      if (text === entry.text) {
        if (!current[entry.id]) return current;
        const next = { ...current };
        delete next[entry.id];
        return next;
      }
      const previous = current[entry.id];
      if (previous?.text === text) return current;
      return {
        ...current,
        [entry.id]: {
          kind: entry.kind,
          text,
        },
      };
    });
  }, []);

  const onReset = useCallback(() => {
    setDirtyDrafts({});
    setResetVersion((version) => version + 1);
  }, []);

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
      setDirtyDrafts({});
      setResetVersion((version) => version + 1);
      await loadBackups();
      const backupPart = result.backup ? ` · backup ${result.backup.filename}` : "";
      const reloadPart = result.closedGame ? " Reload the game in DuckStation." : "";
      toast.success(`PAL FR wording saved${backupPart}.${reloadPart}`, {
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
              onClick={onReset}
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
        <WordingLoadingState constraints={selectedConstraints} />
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
          constraints={selectedConstraints}
          contexts={contexts}
          dirtyDrafts={dirtyDrafts}
          filtered={filtered}
          onDraftChange={onDraftChange}
          query={query}
          resetVersion={resetVersion}
          selectedTab={selectedTab}
          setQuery={setQuery}
          tabHrefFor={tabHrefFor}
        />
      )}
    </section>
  );
}

function WordingEditorBody({
  contexts,
  constraints,
  dirtyDrafts,
  filtered,
  onDraftChange,
  query,
  resetVersion,
  selectedTab,
  setQuery,
  tabHrefFor,
}: {
  contexts: ReadonlyMap<string, string>;
  constraints: WordingTabConstraints;
  dirtyDrafts: Record<string, DirtyDraft>;
  filtered: readonly PalFrWordingEntry[];
  onDraftChange: (entry: PalFrWordingEntry, text: string) => void;
  query: string;
  resetVersion: number;
  selectedTab: WordingTab;
  setQuery: (query: string) => void;
  tabHrefFor: (tab: WordingTab) => string;
}) {
  const editedCounts = useMemo(() => countEditedByKind(dirtyDrafts), [dirtyDrafts]);

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
              <a
                className={`px-3 py-1.5 font-display text-[11px] uppercase tracking-widest transition-colors ${
                  selectedTab === tab.tab
                    ? "bg-bg-hover text-gold-bright"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                href={tabHrefFor(tab.tab)}
                key={tab.kind}
                role="tab"
              >
                {tab.label}
                {edited > 0 ? ` (${edited})` : ""}
              </a>
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
      <div className="min-h-0 overflow-auto rounded-md border border-border-subtle">
        <table className="w-auto max-w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-bg-panel text-[11px] uppercase tracking-widest text-text-muted">
            <tr className="border-b border-border-subtle">
              <th className="w-64 px-2 py-2 font-display">Context</th>
              <th className="px-2 py-2 font-display" style={textColumnStyle(constraints)}>
                Text
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {filtered.map((entry) => (
              <WordingRow
                constraints={constraints}
                context={contexts.get(entry.id) ?? fallbackContext(entry)}
                entry={entry}
                initialText={dirtyDrafts[entry.id]?.text ?? entry.text}
                key={`${entry.id}:${resetVersion}`}
                onDraftChange={onDraftChange}
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

function WordingLoadingState({ constraints }: { constraints: WordingTabConstraints }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-8 overflow-hidden rounded-md border border-border-subtle bg-bg-surface">
          <div className="w-28 animate-pulse border-r border-border-subtle bg-bg-elevated" />
          <div className="w-36 animate-pulse bg-bg-elevated/70" />
        </div>
        <div className="h-8 w-full max-w-md animate-pulse rounded-md border border-border-subtle bg-bg-elevated" />
      </div>
      <div className="min-h-0 overflow-hidden rounded-md border border-border-subtle">
        <table className="w-auto max-w-full border-collapse text-left text-xs">
          <thead className="bg-bg-panel text-[11px] uppercase tracking-widest text-text-muted">
            <tr className="border-b border-border-subtle">
              <th className="w-64 px-2 py-2 font-display">
                <div className="h-3 w-16 animate-pulse rounded-full bg-border-subtle/70" />
              </th>
              <th className="px-2 py-2 font-display" style={textColumnStyle(constraints)}>
                <div className="h-3 w-10 animate-pulse rounded-full bg-border-subtle/70" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {LOADING_ROW_IDS.map((rowId) => (
              <tr key={rowId}>
                <td className="px-2 py-2 align-top">
                  <div className="h-3 w-28 animate-pulse rounded-full bg-bg-elevated" />
                </td>
                <td className="px-2 py-1.5 align-top" style={textColumnStyle(constraints)}>
                  <div
                    className="h-10 animate-pulse rounded-md border border-border-subtle bg-bg-elevated"
                    style={textAreaStyle(constraints)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const WordingRow = memo(function WordingRow({
  constraints,
  context,
  entry,
  initialText,
  onDraftChange,
}: WordingRowProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dirty, setDirty] = useState(() => initialText !== entry.text);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.value = initialText;
    resizeTextarea(node);
    setDirty(initialText !== entry.text);
  }, [entry.text, initialText]);

  function onTextBeforeInput(event: FormEvent<HTMLTextAreaElement>) {
    const nativeEvent = event.nativeEvent as InputEvent;
    if (nativeEvent.inputType?.startsWith("delete")) return;
    const insertion = insertedTextForInput(nativeEvent);
    if (insertion == null) return;
    const nextText = textAfterSelection(event.currentTarget, insertion);
    if (violatesTextConstraints(nextText, constraints)) event.preventDefault();
  }

  function onTextPaste(event: ReactClipboardEvent<HTMLTextAreaElement>) {
    const pasted = event.clipboardData.getData("text");
    if (!pasted) return;
    const nextText = textAfterSelection(event.currentTarget, pasted);
    if (!violatesTextConstraints(nextText, constraints)) return;
    event.preventDefault();
    const constrainedText = applyTextConstraints(nextText, constraints);
    event.currentTarget.value = constrainedText;
    const cursor = Math.min(
      event.currentTarget.selectionStart + pasted.length,
      constrainedText.length,
    );
    event.currentTarget.setSelectionRange(cursor, cursor);
    commitText(event.currentTarget, constrainedText);
  }

  function onTextChange(event: ChangeEvent<HTMLTextAreaElement>) {
    let text = event.currentTarget.value;
    const constrainedText = applyTextConstraints(text, constraints);
    if (constrainedText !== text) {
      text = constrainedText;
      event.currentTarget.value = constrainedText;
      const cursor = Math.min(event.currentTarget.selectionStart, constrainedText.length);
      event.currentTarget.setSelectionRange(cursor, cursor);
    }
    commitText(event.currentTarget, text);
  }

  function commitText(node: HTMLTextAreaElement, text: string) {
    resizeTextarea(node);
    setDirty(text !== entry.text);
    onDraftChange(entry, text);
  }

  return (
    <tr className={dirty ? "bg-bg-surface/50" : ""}>
      <td className="px-2 py-2 align-top text-text-secondary">{context}</td>
      <td className="px-2 py-1.5 align-top">
        <textarea
          aria-label={`PAL FR wording text ${entry.id}`}
          className="min-h-10 w-full resize-none overflow-hidden rounded-md border border-border-subtle bg-bg-elevated px-2 py-1.5 font-mono text-xs text-text-primary outline-none focus:border-gold-dim"
          defaultValue={initialText}
          maxLength={constraints.maxEntryLength}
          onBeforeInput={onTextBeforeInput}
          onChange={onTextChange}
          onPaste={onTextPaste}
          ref={textareaRef}
          rows={1}
          spellCheck={false}
          style={textAreaStyle(constraints)}
        />
      </td>
    </tr>
  );
}, areWordingRowPropsEqual);

function areWordingRowPropsEqual(previous: WordingRowProps, next: WordingRowProps): boolean {
  return (
    previous.context === next.context &&
    previous.constraints === next.constraints &&
    previous.entry === next.entry &&
    previous.onDraftChange === next.onDraftChange
  );
}

function textColumnStyle(constraints: WordingTabConstraints): CSSProperties {
  return {
    width: `${fieldColumns(constraints)}ch`,
  };
}

function textAreaStyle(constraints: WordingTabConstraints): CSSProperties {
  return {
    maxWidth: "100%",
    width: `${fieldColumns(constraints)}ch`,
  };
}

function fieldColumns(constraints: WordingTabConstraints): number {
  return Math.min(40, Math.max(12, constraints.maxLineLength + 2));
}

function resizeTextarea(node: HTMLTextAreaElement) {
  node.style.height = "auto";
  node.style.height = `${node.scrollHeight}px`;
}

function insertedTextForInput(event: InputEvent): string | null {
  if (event.inputType === "insertFromPaste") return null;
  if (event.inputType === "insertLineBreak" || event.inputType === "insertParagraph") return "\n";
  if (event.data != null) return event.data;
  return null;
}

function textAfterSelection(node: HTMLTextAreaElement, insertion: string): string {
  const start = node.selectionStart ?? node.value.length;
  const end = node.selectionEnd ?? start;
  return `${node.value.slice(0, start)}${insertion}${node.value.slice(end)}`;
}

function violatesTextConstraints(text: string, constraints: WordingTabConstraints): boolean {
  return applyTextConstraints(text, constraints) !== normalizeLineEndings(text);
}

function applyTextConstraints(text: string, constraints: WordingTabConstraints): string {
  const lines = normalizeLineEndings(text).split("\n");
  const visibleLines = constraints.maxLines == null ? lines : lines.slice(0, constraints.maxLines);
  return visibleLines
    .map((line) => line.slice(0, constraints.maxLineLength))
    .join("\n")
    .slice(0, constraints.maxEntryLength);
}

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function countEditedByKind(
  dirtyDrafts: Record<string, DirtyDraft>,
): Partial<Record<PalFrWordingEntry["kind"], number>> {
  const counts: Partial<Record<PalFrWordingEntry["kind"], number>> = {};
  for (const draft of Object.values(dirtyDrafts)) {
    counts[draft.kind] = (counts[draft.kind] ?? 0) + 1;
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
    if (card) return compactParts(`#${cardId}`, card.name.trim()).join(" · ");
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
  return `#${entry.entryIndex}`;
}

function kindForTab(tab: WordingTab): PalFrWordingEntry["kind"] {
  if (tab === "names") return "cardName";
  return "cardDescription";
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
  dirtyDrafts: Record<string, DirtyDraft>,
): PalFrWordingEntry[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [...entries];
  return entries.filter((entry) => {
    const context = contexts.get(entry.id) ?? fallbackContext(entry);
    return (
      (dirtyDrafts[entry.id]?.text ?? entry.text).toLocaleLowerCase().includes(needle) ||
      context.toLocaleLowerCase().includes(needle)
    );
  });
}
