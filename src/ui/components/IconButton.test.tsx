// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IconButton } from "./IconButton.tsx";

afterEach(cleanup);

describe("IconButton", () => {
  it("renders children", () => {
    render(<IconButton label="Test">icon</IconButton>);
    expect(screen.getByText("icon")).toBeTruthy();
  });

  it("applies aria-label", () => {
    render(<IconButton label="Close">x</IconButton>);
    expect(screen.getByLabelText("Close")).toBeTruthy();
  });

  it("forwards onClick", () => {
    const onClick = vi.fn();
    render(
      <IconButton label="Click me" onClick={onClick}>
        x
      </IconButton>,
    );
    fireEvent.click(screen.getByLabelText("Click me"));
    expect(onClick).toHaveBeenCalled();
  });

  it("merges className", () => {
    render(
      <IconButton className="extra-class" label="Test">
        x
      </IconButton>,
    );
    const button = screen.getByLabelText("Test");
    expect(button.className).toContain("extra-class");
    expect(button.className).toContain("size-8");
  });
});
