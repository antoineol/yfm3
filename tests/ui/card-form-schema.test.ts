import { describe, expect, it } from "vitest";
import { cardFormSchema } from "../../src/ui/features/data/card-form-schema.ts";

describe("cardFormSchema", () => {
  const valid = {
    cardId: 1,
    name: "Dragon",
    attack: 1200,
    defense: 900,
    kind1: "Dragon",
    kind2: "",
    kind3: "",
    color: "red",
  };

  it("accepts valid card data", () => {
    expect(cardFormSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts zero cardId", () => {
    expect(cardFormSchema.safeParse({ ...valid, cardId: 0 }).success).toBe(true);
  });

  it("rejects negative cardId", () => {
    expect(cardFormSchema.safeParse({ ...valid, cardId: -1 }).success).toBe(false);
  });

  it("rejects non-integer cardId", () => {
    expect(cardFormSchema.safeParse({ ...valid, cardId: 1.5 }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(cardFormSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...noName } = valid;
    expect(cardFormSchema.safeParse(noName).success).toBe(false);
  });

  it("accepts zero attack", () => {
    expect(cardFormSchema.safeParse({ ...valid, attack: 0 }).success).toBe(true);
  });

  it("rejects negative attack", () => {
    expect(cardFormSchema.safeParse({ ...valid, attack: -100 }).success).toBe(false);
  });

  it("rejects empty string for numeric fields", () => {
    expect(cardFormSchema.safeParse({ ...valid, cardId: "" }).success).toBe(false);
    expect(cardFormSchema.safeParse({ ...valid, attack: "" }).success).toBe(false);
    expect(cardFormSchema.safeParse({ ...valid, defense: "" }).success).toBe(false);
  });

  it("rejects NaN for numeric fields", () => {
    expect(cardFormSchema.safeParse({ ...valid, cardId: NaN }).success).toBe(false);
  });

  it("requires kind1", () => {
    expect(cardFormSchema.safeParse({ ...valid, kind1: "" }).success).toBe(false);
    expect(cardFormSchema.safeParse({ ...valid, kind1: undefined }).success).toBe(false);
  });

  it("accepts optional kind2/kind3/color as undefined", () => {
    const result = cardFormSchema.safeParse({
      cardId: 1,
      name: "Dragon",
      attack: 1200,
      defense: 900,
      kind1: "Dragon",
    });
    expect(result.success).toBe(true);
  });
});
