// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Input } from "./Input.tsx";

afterEach(cleanup);

describe("Input", () => {
  it("renders with default border", () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId("input");
    expect(input.className).toContain("border-border-subtle");
    expect(input.className).not.toContain("border-stat-atk");
  });

  it("shows error border when error is true", () => {
    render(<Input data-testid="input" error />);
    const input = screen.getByTestId("input");
    expect(input.className).toContain("border-stat-atk");
    expect(input.className).not.toContain("border-border-subtle");
  });

  it("merges className", () => {
    render(<Input className="text-center font-mono" data-testid="input" />);
    const input = screen.getByTestId("input");
    expect(input.className).toContain("text-center");
    expect(input.className).toContain("font-mono");
  });

  it("handles disabled state", () => {
    render(<Input data-testid="input" disabled />);
    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
