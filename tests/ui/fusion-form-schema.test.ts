import { describe, expect, it } from "vitest";
import { fusionFormSchema } from "../../src/ui/features/data/fusion-form-schema.ts";

describe("fusionFormSchema", () => {
  const valid = {
    materialA: "Dragon",
    materialB: "Eagle",
    resultName: "Sky Dragon",
    resultAttack: 2100,
    resultDefense: 1500,
  };

  it("accepts valid fusion data", () => {
    expect(fusionFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty materialA", () => {
    expect(fusionFormSchema.safeParse({ ...valid, materialA: "" }).success).toBe(false);
  });

  it("rejects empty materialB", () => {
    expect(fusionFormSchema.safeParse({ ...valid, materialB: "" }).success).toBe(false);
  });

  it("rejects empty resultName", () => {
    expect(fusionFormSchema.safeParse({ ...valid, resultName: "" }).success).toBe(false);
  });

  it("rejects negative resultAttack", () => {
    expect(fusionFormSchema.safeParse({ ...valid, resultAttack: -1 }).success).toBe(false);
  });

  it("rejects non-integer resultDefense", () => {
    expect(fusionFormSchema.safeParse({ ...valid, resultDefense: 1.5 }).success).toBe(false);
  });

  it("accepts zero attack and defense", () => {
    const result = fusionFormSchema.safeParse({ ...valid, resultAttack: 0, resultDefense: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const { resultName: _, ...noResult } = valid;
    expect(fusionFormSchema.safeParse(noResult).success).toBe(false);
  });
});
