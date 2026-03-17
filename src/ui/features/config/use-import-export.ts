import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { useDeck } from "../../db/use-deck.ts";
import { useOwnedCardTotals } from "../../db/use-owned-card-totals.ts";
import { type ImportExportData, importExportSchema } from "./import-export-schema.ts";

export function useImportExport() {
  const ownedCardTotals = useOwnedCardTotals();
  const deck = useDeck();
  const importMutation = useMutation(api.importExport.importData);

  const isExportReady = ownedCardTotals !== undefined && deck !== undefined;

  function handleExport() {
    if (!ownedCardTotals || !deck) return;

    const collectionIds = expandTotals(ownedCardTotals);
    const deckIds = deck.map((d) => d.cardId);

    const data: ImportExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      collection: collectionIds,
      deck: deckIds,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yfm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Collection and deck exported");
  }

  async function handleImport(file: File) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      toast.error("Invalid JSON file");
      return false;
    }

    const result = importExportSchema.safeParse(parsed);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      toast.error(`Invalid file: ${firstIssue?.message ?? "unknown error"}`);
      return false;
    }

    try {
      await importMutation({
        collection: result.data.collection,
        deck: result.data.deck,
      });
      toast.success("Collection and deck imported");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
      return false;
    }
  }

  return { handleExport, handleImport, isExportReady };
}

/** Expand { cardId: quantity } into a flat array of cardIds. */
export function expandTotals(totals: Record<number, number>): number[] {
  const ids: number[] = [];
  for (const [cardId, quantity] of Object.entries(totals)) {
    for (let i = 0; i < quantity; i++) {
      ids.push(Number(cardId));
    }
  }
  return ids;
}
