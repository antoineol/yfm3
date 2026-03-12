// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CardActionButton } from "./CardActionButton.tsx";

afterEach(cleanup);

describe("CardActionButton", () => {
  it("uses flex centering classes for icon content", () => {
    render(
      <CardActionButton title="Add copy" variant="add">
        +
      </CardActionButton>,
    );

    const button = screen.getByRole("button", { name: "+" });
    expect(button.className).toContain("inline-flex");
    expect(button.className).toContain("items-center");
    expect(button.className).toContain("justify-center");
  });

  it("forwards onClick", () => {
    const onClick = vi.fn();
    render(
      <CardActionButton onClick={onClick} title="Dismiss" variant="dismiss">
        ×
      </CardActionButton>,
    );

    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
