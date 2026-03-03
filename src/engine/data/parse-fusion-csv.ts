import type { FusionDb, FusionMaterials } from "./card-model.ts";
import { parseCsvFusion } from "./csv-fusion-parser.ts";
import { type CsvColumnKey, readCol } from "./csv-utils.ts";

/**
 * Configuration for a single tier of fusion columns in the CSV
 */
interface TierColumnConfig {
  material1: CsvColumnKey;
  material2: CsvColumnKey;
  fusionName: CsvColumnKey;
  fusionAttack: CsvColumnKey;
  fusionDefense: CsvColumnKey;
  tier: number;
}

/**
 * Column configurations for each tier of fusions
 */
const columnsSetup: TierColumnConfig[] = [
  {
    material1: "B",
    material2: "C",
    fusionName: "E",
    fusionAttack: "F",
    fusionDefense: "G",
    tier: 1,
  },
  {
    material1: "E",
    material2: "I",
    fusionName: "K",
    fusionAttack: "L",
    fusionDefense: "M",
    tier: 2,
  },
  {
    material1: "K",
    material2: "O",
    fusionName: "Q",
    fusionAttack: "R",
    fusionDefense: "S",
    tier: 3,
  },
  {
    material1: "Q",
    material2: "U",
    fusionName: "W",
    fusionAttack: "X",
    fusionDefense: "Y",
    tier: 4,
  },
];

/**
 * Manages the state of CSV parsing, tracking last values seen for each column
 */
class CsvParserState {
  lastMaterial1: string | null = null;
  lastMaterial2: string | null = null;
  lastResult: string | null = null;
  lastAttack: string | null = null;
  lastDefense: string | null = null;

  reset(): void {
    this.lastMaterial1 = null;
    this.lastMaterial2 = null;
    this.lastResult = null;
    this.lastAttack = null;
    this.lastDefense = null;
  }

  getValueWithFallback(
    currentValue: string,
    lastValueKey: "lastMaterial1" | "lastMaterial2" | "lastResult" | "lastAttack" | "lastDefense",
  ): string {
    const lastValue = this[lastValueKey];

    if (!currentValue && lastValue) {
      return lastValue;
    } else if (currentValue) {
      this[lastValueKey] = currentValue;
      return currentValue;
    }

    return "";
  }
}

/**
 * Process fusion CSV content into structured data
 */
export function parseFusionCsv(csvContent: string): FusionDb {
  const lines = csvContent.split("\n").map((line) => line.split("\t"));

  // Skip header line
  const dataLines = lines.slice(1);

  const fusionsMap = new Map<string, FusionMaterials>();
  const state = new CsvParserState();

  for (const setup of columnsSetup) {
    for (const line of dataLines) {
      const lineData = processCsvLine(line, setup, state);

      if (!lineData) {
        continue;
      }

      try {
        const fusionResults = parseCsvFusion(lineData);

        if (fusionResults) {
          addFusionsToMap(fusionsMap, fusionResults);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Unknown error during fusion parsing");
      }
    }
  }

  return { fusions: Array.from(fusionsMap.values()) };
}

function processCsvLine(
  line: string[],
  setup: TierColumnConfig,
  state: CsvParserState,
): {
  material1: string;
  material2: string;
  fusionName: string;
  fusionAttack: string;
  fusionDefense: string;
} | null {
  if (isLineEmpty(line)) {
    state.reset();
    return null;
  }

  const material1 = state.getValueWithFallback(readCol(line, setup.material1), "lastMaterial1");
  const material2 = state.getValueWithFallback(readCol(line, setup.material2), "lastMaterial2");
  const fusionName = state.getValueWithFallback(readCol(line, setup.fusionName), "lastResult");
  const fusionAttack = state.getValueWithFallback(readCol(line, setup.fusionAttack), "lastAttack");
  const fusionDefense = state.getValueWithFallback(
    readCol(line, setup.fusionDefense),
    "lastDefense",
  );

  if (!material2 && !fusionName && !fusionAttack && !fusionDefense) {
    state.reset();
    return null;
  }

  if (!material1 || !material2 || !fusionName || !fusionAttack || !fusionDefense) {
    throw new Error("Missing data for a fusion");
  }

  return { material1, material2, fusionName, fusionAttack, fusionDefense };
}

function addFusionsToMap(
  fusionsMap: Map<string, FusionMaterials>,
  fusionResults: FusionMaterials[],
): void {
  for (const fusion of fusionResults) {
    const existingFusion = fusionsMap.get(fusion.name);

    if (existingFusion) {
      for (const materialKey of fusion.materials) {
        existingFusion.materials.add(materialKey);
      }
    } else {
      fusionsMap.set(fusion.name, fusion);
    }
  }
}

function isLineEmpty(line: string[]): boolean {
  return line.every((cell) => !cell?.trim());
}
