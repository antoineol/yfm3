// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CardSpec } from "../../engine/data/card-model.ts";
import { CardDbProvider } from "../lib/card-db-context.tsx";
import { CardAutocomplete, cardFilter } from "./CardAutocomplete.tsx";

afterEach(cleanup);

const testCards: CardSpec[] = [
  {
    id: 1,
    name: "Blue-Eyes White Dragon",
    kinds: ["Dragon"],
    color: "blue",
    attack: 3000,
    defense: 2500,
  },
  {
    id: 2,
    name: "Dark Magician",
    kinds: ["Spellcaster"],
    color: "blue",
    attack: 2500,
    defense: 2100,
  },
  {
    id: 3,
    name: "Red-Eyes Black Dragon",
    kinds: ["Dragon"],
    color: "red",
    attack: 2400,
    defense: 2000,
  },
];

function renderAutocomplete(props: Partial<Parameters<typeof CardAutocomplete>[0]> = {}) {
  const onSelect = props.onSelect ?? vi.fn();
  return render(
    <CardDbProvider>
      <CardAutocomplete cards={testCards} onSelect={onSelect} {...props} />
    </CardDbProvider>,
  );
}

describe("cardFilter", () => {
  const dragon: CardSpec = {
    id: 1,
    name: "Blue-Eyes White Dragon",
    kinds: ["Dragon"],
    color: "blue",
    attack: 3000,
    defense: 2500,
  };
  const magician: CardSpec = {
    id: 42,
    name: "Dark Magician",
    kinds: ["Spellcaster"],
    color: "blue",
    attack: 2500,
    defense: 2100,
  };

  it("matches everything when query is empty", () => {
    expect(cardFilter(dragon, "")).toBe(true);
    expect(cardFilter(magician, "")).toBe(true);
  });

  it("matches word-start tokens case-insensitively", () => {
    expect(cardFilter(dragon, "bl wh")).toBe(true);
    expect(cardFilter(dragon, "BL WH")).toBe(true);
    expect(cardFilter(dragon, "ey drag")).toBe(true);
  });

  it("rejects when no token matches any word or substring", () => {
    expect(cardFilter(dragon, "dark")).toBe(false);
    expect(cardFilter(dragon, "xyz")).toBe(false);
  });

  it("matches by card ID with a numeric query", () => {
    expect(cardFilter(magician, "42")).toBe(true);
    expect(cardFilter(dragon, "42")).toBe(false);
  });

  it("treats hyphenated name segments as separate words", () => {
    expect(cardFilter(dragon, "eyes")).toBe(true);
  });

  it("handles multi-token queries where each must match a different word start", () => {
    expect(cardFilter(magician, "dark mag")).toBe(true);
    expect(cardFilter(magician, "dark blue")).toBe(false);
  });

  it("ignores accents in card names and queries", () => {
    const accented: CardSpec = {
      id: 99,
      name: "Séance",
      kinds: ["Spellcaster"],
      attack: 0,
      defense: 0,
    };
    expect(cardFilter(accented, "seance")).toBe(true);
    expect(cardFilter(accented, "séance")).toBe(true);
  });

  it("falls back to substring match when word-start fails", () => {
    // "agon" doesn't start any word, but is a substring of "dragon"
    expect(cardFilter(dragon, "agon")).toBe(true);
  });
});

describe("CardAutocomplete", () => {
  it("renders the input with placeholder", () => {
    renderAutocomplete({ placeholder: "Find a card..." });
    expect(screen.getByPlaceholderText("Find a card...")).toBeTruthy();
  });

  it("renders with default placeholder", () => {
    renderAutocomplete();
    expect(screen.getByPlaceholderText("Search cards...")).toBeTruthy();
  });

  it("renders with disabled state", () => {
    renderAutocomplete({ disabled: true });
    const input = screen.getByPlaceholderText("Search cards...");
    expect(input).toBeTruthy();
    expect((input as HTMLInputElement).disabled).toBe(true);
  });

  it("uses all cards from CardDb when cards prop is omitted", () => {
    render(
      <CardDbProvider>
        <CardAutocomplete onSelect={vi.fn()} />
      </CardDbProvider>,
    );
    expect(screen.getByPlaceholderText("Search cards...")).toBeTruthy();
  });
});
