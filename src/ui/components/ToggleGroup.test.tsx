// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToggleGroup } from "./ToggleGroup.tsx";

afterEach(cleanup);

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
];

describe("ToggleGroup", () => {
  it("renders all options", () => {
    render(<ToggleGroup onChange={vi.fn()} options={options} value="a" />);
    expect(screen.getByText("Option A")).toBeTruthy();
    expect(screen.getByText("Option B")).toBeTruthy();
  });

  it("calls onChange with the clicked option value", () => {
    const onChange = vi.fn();
    render(<ToggleGroup onChange={onChange} options={options} value="a" />);
    fireEvent.click(screen.getByText("Option B"));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
