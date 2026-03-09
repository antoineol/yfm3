// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CardSpec } from "../../engine/data/card-model.ts";
import { CardDbProvider } from "../lib/card-db-context.tsx";
import { CardAutocomplete } from "./CardAutocomplete.tsx";

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
