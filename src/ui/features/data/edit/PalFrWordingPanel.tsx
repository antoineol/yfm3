import { useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/Button.tsx";
import { Input } from "../../../components/Input.tsx";
import { loadBackupsAtom } from "./atoms.ts";
import {
  fetchPalFrWordingStatus,
  type PalFrWordingEntry,
  type PalFrWordingStatus,
  putPalFrWordingEntry,
} from "./bridge-client.ts";

export function PalFrWordingPanel() {
  const [status, setStatus] = useState<PalFrWordingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const loadBackups = useSetAtom(loadBackupsAtom);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchPalFrWordingStatus()
      .then((next) => {
        if (!alive) return;
        setStatus(next);
        const first = next.supported ? next.entries[0] : null;
        setSelectedId(first?.id ?? null);
        setDraft(first?.text ?? "");
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
  const selected = entries.find((entry) => entry.id === selectedId) ?? filtered[0] ?? null;
  const encodedLength = estimateEncodedLength(draft);
  const overBudget = selected ? encodedLength > selected.maxByteLength : false;
  const dirty = selected ? draft !== selected.text : false;
  const canApply = Boolean(selected && dirty && !overBudget && !pending);

  function selectEntry(entry: PalFrWordingEntry) {
    setSelectedId(entry.id);
    setDraft(entry.text);
  }

  async function onApply() {
    if (!selected || !canApply) return;
    if (!window.confirm(confirmMessage(selected))) return;

    setPending(true);
    try {
      const result = await putPalFrWordingEntry(selected.id, draft);
      if (!result.ok) {
        const detail = result.reason ? ` (${result.reason})` : "";
        toast.error(`Wording patch failed: ${result.error}${detail}`);
        return;
      }
      setStatus((current) => replaceEntry(current, result.entry));
      setDraft(result.entry.text);
      await loadBackups();
      const backupPart = result.backup ? ` · backup ${result.backup.filename}` : "";
      const reloadPart = result.closedGame ? " Reload the game in DuckStation." : "";
      toast.success(`Wording entry patched${backupPart}.${reloadPart}`, { duration: 10000 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Wording patch failed: ${message}`);
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <section className="border-b border-border-subtle bg-bg-surface/45 px-3 py-2">
        <PanelTitle detail="Checking the active disc." label="PAL FR wording" state="Checking" />
      </section>
    );
  }

  if (!status?.supported) {
    return (
      <section className="border-b border-border-subtle bg-bg-surface/45 px-3 py-2">
        <PanelTitle
          detail={status?.reason ?? "Patch state could not be read."}
          label="PAL FR wording"
          state="Unsupported"
        />
      </section>
    );
  }

  return (
    <section className="border-b border-border-subtle bg-bg-surface/45 px-3 py-3">
      <PanelTitle
        detail={`${status.discFilename}: ${entries.length} editable entries. Longer text must fit the selected entry budget.`}
        label="PAL FR wording"
        state="Experimental"
      />
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          <Input
            aria-label="Search PAL FR wording"
            className="h-8 text-xs"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search text or offset"
            value={query}
          />
          <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-border-subtle">
            {filtered.slice(0, 80).map((entry) => (
              <button
                className={`block w-full border-b border-border-subtle/50 px-2 py-1.5 text-left text-xs last:border-b-0 hover:bg-bg-hover ${
                  entry.id === selected?.id
                    ? "bg-bg-hover text-text-primary"
                    : "text-text-secondary"
                }`}
                key={entry.id}
                onClick={() => selectEntry(entry)}
                type="button"
              >
                <span className="font-mono text-[10px] text-text-muted">
                  {kindLabel(entry.kind)} · 0x{entry.offset.toString(16)}
                </span>
                <span className="mt-0.5 block truncate">{entry.text}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-3 text-xs text-text-muted">No matching entries.</p>
            )}
          </div>
        </div>
        <div className="min-w-0">
          {selected && (
            <>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
                <span className="font-mono">
                  0x{selected.offset.toString(16)} · {kindLabel(selected.kind)}
                </span>
                <span className={overBudget ? "text-red-300" : "text-text-muted"}>
                  {encodedLength}/{selected.maxByteLength} bytes
                </span>
              </div>
              <textarea
                aria-label="PAL FR wording text"
                className="min-h-36 w-full resize-y rounded-md border border-border-subtle bg-bg-elevated px-2 py-2 font-mono text-xs text-text-primary outline-none focus:border-gold-dim"
                onChange={(event) => setDraft(event.currentTarget.value)}
                spellCheck={false}
                value={draft}
              />
              <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                <Button
                  disabled={!dirty || pending}
                  onClick={() => setDraft(selected.text)}
                  size="sm"
                  variant="ghost"
                >
                  Reset
                </Button>
                <Button disabled={!canApply} onClick={onApply} size="sm" variant="outline">
                  {pending ? "Applying..." : "Apply"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function PanelTitle({ detail, label, state }: { detail: string; label: string; state: string }) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-xs font-semibold uppercase tracking-widest text-gold-dim">
          {label}
        </span>
        <span className="rounded-md border border-border-subtle px-2 py-0.5 font-display text-[11px] uppercase tracking-widest text-text-muted">
          {state}
        </span>
      </div>
      <p className="mt-1 truncate text-xs text-text-muted">{detail}</p>
    </div>
  );
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

function replaceEntry(
  status: PalFrWordingStatus | null,
  entry: PalFrWordingEntry,
): PalFrWordingStatus | null {
  if (!status?.supported) return status;
  return {
    ...status,
    entries: status.entries.map((current) => (current.id === entry.id ? entry : current)),
  };
}

function estimateEncodedLength(text: string): number {
  let length = 0;
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/’/g, "'")
    .replace(/…/g, "...");
  for (let i = 0; i < normalized.length; i++) {
    if (normalized[i] === "{") {
      const close = normalized.indexOf("}", i + 1);
      if (close !== -1) {
        const token = normalized.slice(i + 1, close).trim();
        const parts = token.split(/\s+/).filter(Boolean);
        if (parts.length === 3 && parts[0]?.toLowerCase() === "f8") {
          length += 3;
          i = close;
          continue;
        }
        if (parts.length === 1 && /^[0-9a-fA-F]{1,2}$/.test(parts[0] ?? "")) {
          length += 1;
          i = close;
          continue;
        }
      }
    }
    length += 1;
  }
  return length;
}

function kindLabel(kind: PalFrWordingEntry["kind"]): string {
  if (kind === "cardDescription") return "Description";
  if (kind === "cardName") return "Card name";
  return "Script";
}

function confirmMessage(entry: PalFrWordingEntry): string {
  return (
    `Patch ${kindLabel(entry.kind).toLowerCase()} at 0x${entry.offset.toString(16)}? ` +
    "This edits the active disc image and creates an ISO backup. " +
    "If DuckStation is locking the image, the bridge will close the running game."
  );
}
