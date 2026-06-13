export type RankedPlay = {
  resultAtk: number;
  resultDef: number;
  consumedCardCount: number;
  remainingBest?: RankedPlay;
  consumedMaterialAtk?: number;
  consumedMaterialDef?: number;
};

export function compareRankedPlays(a: RankedPlay, b: RankedPlay): number {
  const resultAtkDiff = b.resultAtk - a.resultAtk;
  if (resultAtkDiff !== 0) return resultAtkDiff;

  const consumedCountDiff = a.consumedCardCount - b.consumedCardCount;
  if (consumedCountDiff !== 0) return consumedCountDiff;

  const resultDefDiff = b.resultDef - a.resultDef;
  if (resultDefDiff !== 0) return resultDefDiff;

  const remainingDiff = compareOptionalRankedPlay(a.remainingBest, b.remainingBest);
  if (remainingDiff !== 0) return remainingDiff;

  return compareStatsAsc(
    a.consumedMaterialAtk ?? 0,
    a.consumedMaterialDef ?? 0,
    b.consumedMaterialAtk ?? 0,
    b.consumedMaterialDef ?? 0,
  );
}

function compareOptionalRankedPlay(a: RankedPlay | undefined, b: RankedPlay | undefined): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return compareRankedPlays(a, b);
}

function compareStatsAsc(aAtk: number, aDef: number, bAtk: number, bDef: number): number {
  if (aAtk !== bAtk) return aAtk - bAtk;
  return aDef - bDef;
}
