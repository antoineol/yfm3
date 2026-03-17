import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { IconButton } from "../../components/IconButton.tsx";
import { CardFormDialog } from "./CardFormDialog.tsx";
import type { CardFormValues } from "./card-form-schema.ts";

interface ReferenceCard {
  cardId: number;
  name: string;
  attack: number;
  defense: number;
  kind1?: string;
  kind2?: string;
  kind3?: string;
  color?: string;
}

interface CardsTableProps {
  cards: ReferenceCard[];
}

export function CardsTable({ cards }: CardsTableProps) {
  const deleteCard = useAction(api.referenceDataCrud.deleteCard);
  const [editCard, setEditCard] = useState<CardFormValues | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (card: ReferenceCard) => {
    if (!window.confirm(`Delete "${card.name}"?`)) return;
    setDeleting(card.cardId);
    try {
      await deleteCard({ cardId: card.cardId, name: card.name });
      toast.success("Card deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-bg-surface border-b border-border-subtle">
            <tr className="text-text-secondary text-xs uppercase tracking-wide">
              <th className="text-left py-2 px-1 font-normal">ID</th>
              <th className="text-left py-2 px-1 font-normal">Name</th>
              <th className="text-left py-2 px-2 font-normal">ATK</th>
              <th className="text-left py-2 px-2 font-normal">DEF</th>
              <th className="text-left py-2 px-1 font-normal hidden sm:table-cell">Kind1</th>
              <th className="text-left py-2 px-1 font-normal hidden sm:table-cell">Kind2</th>
              <th className="text-left py-2 px-1 font-normal hidden md:table-cell">Kind3</th>
              <th className="text-left py-2 px-1 font-normal hidden md:table-cell">Color</th>
              <th className="py-2 px-1 font-normal" />
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr
                className="border-t border-border-subtle/50 transition-colors duration-150 hover:bg-bg-hover even:bg-bg-surface/30"
                key={card.cardId}
              >
                <td className="py-1.5 px-1 font-mono text-xs text-text-muted">{card.cardId}</td>
                <td className="py-1.5 px-1 text-text-primary">{card.name}</td>
                <td className="py-1.5 px-2 font-mono font-bold text-stat-atk">{card.attack}</td>
                <td className="py-1.5 px-2 font-mono text-xs text-stat-def">{card.defense}</td>
                <td className="py-1.5 px-1 text-text-muted text-xs hidden sm:table-cell">
                  {card.kind1}
                </td>
                <td className="py-1.5 px-1 text-text-muted text-xs hidden sm:table-cell">
                  {card.kind2}
                </td>
                <td className="py-1.5 px-1 text-text-muted text-xs hidden md:table-cell">
                  {card.kind3}
                </td>
                <td className="py-1.5 px-1 text-text-muted text-xs hidden md:table-cell">
                  {card.color}
                </td>
                <td className="py-0.5 px-1">
                  <div className="flex items-center gap-1 justify-end">
                    <IconButton
                      className="size-9"
                      label="Edit"
                      onClick={() =>
                        setEditCard({
                          cardId: card.cardId,
                          name: card.name,
                          attack: card.attack,
                          defense: card.defense,
                          kind1: card.kind1 ?? "",
                          kind2: card.kind2 ?? "",
                          kind3: card.kind3 ?? "",
                          color: card.color ?? "",
                        })
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      className="size-9"
                      disabled={deleting === card.cardId}
                      label="Delete"
                      onClick={() => void handleDelete(card)}
                    >
                      <TrashIcon />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
            {cards.length === 0 && (
              <tr>
                <td className="py-8 text-center text-text-muted" colSpan={9}>
                  No cards yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <CardFormDialog
        defaultValues={editCard ?? undefined}
        mode="edit"
        onClose={() => setEditCard(null)}
        open={editCard !== null}
      />
    </>
  );
}

function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
