// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CardDetailProvider, useCardDetail } from "../lib/card-detail-context.tsx";
import { CardName } from "./CardName.tsx";

afterEach(cleanup);

function LastOpened() {
  const { cardId } = useCardDetail();
  return <span data-testid="opened">{cardId ?? "none"}</span>;
}

function renderCardName(cardId = 1, name = "Baby Dragon") {
  return render(
    <CardDetailProvider>
      <CardName cardId={cardId} name={name} />
      <LastOpened />
    </CardDetailProvider>,
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
    render(
      <CardDetailProvider>
        <CardName cardId={1} className="text-gold" name="Test" />
      </CardDetailProvider>,
    );
    const btn = screen.getByRole("button", { name: "Test" });
    expect(btn.className).toContain("text-gold");
  });

  it("stops event propagation", () => {
    const parentClick = vi.fn();
    render(
      <CardDetailProvider>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: test wrapper */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: test wrapper */}
        <div onClick={parentClick}>
          <CardName cardId={1} name="Test" />
        </div>
      </CardDetailProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
