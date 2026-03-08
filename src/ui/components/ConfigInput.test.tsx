// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigInput } from "./ConfigPanel.tsx";

afterEach(cleanup);

describe("ConfigInput", () => {
  function renderInput(overrides: Partial<Parameters<typeof ConfigInput>[0]> = {}) {
    const onCommit = vi.fn();
    const props = {
      label: "Deck size",
      value: 40,
      min: 5,
      max: 40,
      onCommit,
      disabled: false,
      ...overrides,
    };
    const result = render(<ConfigInput {...props} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    return { input, onCommit, result };
  }

  it("shows the current value", () => {
    const { input } = renderInput({ value: 30 });
    expect(input.value).toBe("30");
  });

  it("calls onCommit with parsed value on blur", () => {
    const { input, onCommit } = renderInput({ value: 40 });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith(25);
  });

  it("clamps values above max on commit", () => {
    const { input, onCommit } = renderInput({ value: 40, max: 40 });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "50" } });
    fireEvent.blur(input);
    expect(onCommit).not.toHaveBeenCalled(); // 50 clamped to 40, same as current value
    expect(input.value).toBe("40");
  });

  it("clamps values below min on commit", () => {
    const { input, onCommit } = renderInput({ value: 40, min: 5 });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith(5);
    // After commit, useEffect syncs draft back to prop value (40) since prop hasn't updated yet
    expect(input.value).toBe("40");
  });

  it("syncs back from external value when not editing", () => {
    const { input, result } = renderInput({ value: 40 });
    result.rerender(
      <ConfigInput
        label="Deck size"
        value={30}
        min={5}
        max={40}
        onCommit={vi.fn()}
        disabled={false}
      />,
    );
    expect(input.value).toBe("30");
  });

  it("does not sync external value while editing", () => {
    const { input, result } = renderInput({ value: 40 });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "2" } });
    result.rerender(
      <ConfigInput
        label="Deck size"
        value={30}
        min={5}
        max={40}
        onCommit={vi.fn()}
        disabled={false}
      />,
    );
    expect(input.value).toBe("2");
  });

  it("shows red border when value is out of range during typing", () => {
    const { input } = renderInput({ value: 40, min: 5, max: 40 });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "50" } });
    expect(input.className).toContain("border-stat-atk");
  });

  it("shows default border when value is in range during typing", () => {
    const { input } = renderInput({ value: 40, min: 5, max: 40 });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "20" } });
    expect(input.className).not.toContain("border-stat-atk");
    expect(input.className).toContain("border-border-subtle");
  });

  it("reverts to current value when NaN is committed", () => {
    const { input, onCommit } = renderInput({ value: 40 });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe("40");
  });
});
