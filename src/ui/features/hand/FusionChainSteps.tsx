import type { FusionStep } from "../../../engine/fusion-chain-finder.ts";
import { CardName } from "../../components/CardName.tsx";
import { useCardDb } from "../../lib/card-db-context.tsx";

const STEP_NUMBERS = ["\u2460", "\u2461", "\u2462", "\u2463", "\u2464"];

export type MaterialLine = {
  cardId: number;
  resultCardId?: number;
  fromField?: boolean;
};

export function extractMaterialLines(
  steps: FusionStep[],
  fieldMaterialCardIds?: number[],
): MaterialLine[] {
  const fieldSet = fieldMaterialCardIds ? new Set(fieldMaterialCardIds) : undefined;
  const lines: MaterialLine[] = [];

  for (const [i, step] of steps.entries()) {
    if (i === 0) {
      lines.push({
        cardId: step.material1CardId,
        ...(fieldSet?.has(step.material1CardId) ? { fromField: true } : {}),
      });
      lines.push({ cardId: step.material2CardId, resultCardId: step.resultCardId });
    } else {
      const prev = steps[i - 1];
      if (!prev) continue;
      const newMaterialId =
        step.material1CardId === prev.resultCardId ? step.material2CardId : step.material1CardId;
      lines.push({ cardId: newMaterialId, resultCardId: step.resultCardId });
    }
  }

  return lines;
}

export function FusionChainSteps({
  steps,
  equipCardIds,
  fieldMaterialCardIds,
}: {
  steps: FusionStep[];
  equipCardIds: number[];
  fieldMaterialCardIds: number[];
}) {
  const cardDb = useCardDb();
  const getName = (id: number) => cardDb.cardsById.get(id)?.name ?? `#${String(id)}`;
  const lines = extractMaterialLines(steps, fieldMaterialCardIds);
  const stepCount = lines.length;
  const isDirectPlay = steps.length === 0 && equipCardIds.length === 0;

  return (
    <div className="flex flex-col gap-0.5">
      {isDirectPlay && (
        <p className="text-xs text-text-secondary leading-relaxed flex items-baseline gap-1.5">
          <span className="text-gold font-bold text-xs w-4 shrink-0 text-center select-none">
            {STEP_NUMBERS[0]}
          </span>
          <span className="text-amber-400 text-xs font-semibold">Direct</span>
        </p>
      )}
      {lines.map((line, i) => (
        <p
          className="text-xs text-text-secondary leading-relaxed flex items-baseline gap-1.5"
          key={`${String(i)}-${String(line.cardId)}`}
        >
          <span className="text-gold font-bold text-xs w-4 shrink-0 text-center select-none">
            {STEP_NUMBERS[i] ?? String(i + 1)}
          </span>
          {line.fromField && <span className="text-sky-400 text-xs font-semibold">Field</span>}
          <CardName
            cardId={line.cardId}
            className="text-text-primary"
            name={getName(line.cardId)}
          />
          {line.resultCardId !== undefined && (
            <>
              <span className="text-gold-dim mx-0.5">{"\u2192"}</span>
              <CardName
                cardId={line.resultCardId}
                className="text-gold"
                name={getName(line.resultCardId)}
              />
            </>
          )}
        </p>
      ))}
      {equipCardIds.map((eqId, i) => (
        <p
          className="text-xs text-text-secondary leading-relaxed flex items-baseline gap-1.5"
          key={`eq-${String(eqId)}-${String(i)}`}
        >
          <span className="text-gold font-bold text-xs w-4 shrink-0 text-center select-none">
            {STEP_NUMBERS[stepCount + i] ?? String(stepCount + i + 1)}
          </span>
          <span className="text-emerald-400 text-xs">Equip</span>
          <CardName cardId={eqId} className="text-text-primary" name={getName(eqId)} />
        </p>
      ))}
    </div>
  );
}
