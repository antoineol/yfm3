// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createStore, Provider, useAtomValue } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addCard, createCardDb } from "../../engine/data/game-db.ts";
import { openCardIdAtom } from "../lib/atoms.ts";
import { CardDbProvider } from "../lib/card-db-context.tsx";
import { CardName } from "./CardName.tsx";

afterEach(cleanup);

function LastOpened() {
  const cardId = useAtomValue(openCardIdAtom);
  return <span data-testid="opened">{cardId ?? "none"}</span>;
}

function renderCardName(cardId = 1, name = "Baby Dragon") {
  const store = createStore();
  return render(
    <Provider store={store}>
      <CardName cardId={cardId} name={name} />
      <LastOpened />
    </Provider>,
  );
}

describe("CardName", () => {
  it("renders the card name as a button", () => {
    renderCardName(1, "Baby Dragon");
    expect(screen.getByRole("button", { name: "Baby Dragon" })).toBeTruthy();
  });

  it("opens card detail on click", () => {
    renderCardName(42, "Dark Magician");
    expect(screen.getByTestId("opened").textContent).toBe("none");
    fireEvent.click(screen.getByRole("button", { name: "Dark Magician" }));
    expect(screen.getByTestId("opened").textContent).toBe("42");
  });

  it("applies custom className", () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <CardName cardId={1} className="text-gold" name="Test" />
      </Provider>,
    );
    const btn = screen.getByRole("button", { name: "Test" });
    expect(btn.className).toContain("text-gold");
  });

  it("uses contrast-safe label color from card metadata", () => {
    const store = createStore();
    const cardDb = createCardDb();
    addCard(cardDb, {
      id: 337,
      name: "Raigeki",
      kinds: [],
      cardType: "Magic",
      isMonster: false,
      color: "green",
      labelColor: "blue",
      attack: 0,
      defense: 0,
    });

    render(
      <Provider store={store}>
        <CardDbProvider cardDb={cardDb}>
          <CardName cardId={337} name="Raigeki" />
        </CardDbProvider>
      </Provider>,
    );

    expect(screen.getByRole("button", { name: "Raigeki" }).style.color).toBe("#6aa8ff");
  });

  it("accepts an explicit label color without card database context", () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <CardName cardId={1} labelColor="red" name="Test" />
      </Provider>,
    );

    expect(screen.getByRole("button", { name: "Test" }).style.color).toBe("#ff5a5f");
  });

  it("stops event propagation", () => {
    const parentClick = vi.fn();
    const store = createStore();
    render(
      <Provider store={store}>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: test wrapper */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: test wrapper */}
        <div onClick={parentClick}>
          <CardName cardId={1} name="Test" />
        </div>
      </Provider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
