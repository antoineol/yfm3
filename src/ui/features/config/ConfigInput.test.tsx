// @vitest-environment happy-dom
import { zodResolver } from "@hookform/resolvers/zod";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Form } from "../../components/Form.tsx";
import { ConfigInput } from "./ConfigPanel.tsx";
import { type ConfigFormValues, configSchema } from "./config-schema.ts";

afterEach(cleanup);

describe("ConfigInput", () => {
  let formRef: UseFormReturn<ConfigFormValues>;

  function Wrapper({
    defaultValues = { deckSize: 40, fusionDepth: 3, useEquipment: true },
    disabled = false,
    onBlur = vi.fn(),
  }: {
    defaultValues?: ConfigFormValues;
    disabled?: boolean;
    onBlur?: () => void;
  }) {
    const form = useForm<ConfigFormValues>({
      resolver: zodResolver(configSchema),
      mode: "onBlur",
      defaultValues,
    });
    formRef = form;

    return (
      <Form form={form}>
        <ConfigInput disabled={disabled} label="Deck size" name="deckSize" onBlur={onBlur} />
      </Form>
    );
  }

  function renderInput(
    overrides: { defaultValues?: ConfigFormValues; disabled?: boolean; onBlur?: () => void } = {},
  ) {
    const onBlur = overrides.onBlur ?? vi.fn();
    const result = render(<Wrapper {...overrides} onBlur={onBlur} />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    return { input, onBlur, result, getForm: () => formRef };
  }

  it("shows the current value", () => {
    const { input } = renderInput({
      defaultValues: { deckSize: 30, fusionDepth: 3, useEquipment: true },
    });
    expect(input.value).toBe("30");
  });

  it("calls onBlur callback on blur", () => {
    const { input, onBlur } = renderInput();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
  });

  it("does not save when value is above max", async () => {
    const onBlur = vi.fn();
    const { input } = renderInput({ onBlur });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "50" } });
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
    // Value stays in input (standard RHF: no revert)
    expect(input.value).toBe("50");
  });

  it("does not save when value is below min", async () => {
    const onBlur = vi.fn();
    const { input } = renderInput({ onBlur });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
    expect(input.value).toBe("3");
  });

  it("shows error border after blur with out-of-range value", async () => {
    const { input } = renderInput();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "50" } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(input.className).toContain("border-stat-atk");
    });
  });

  it("shows default border with valid value", () => {
    const { input } = renderInput();
    expect(input.className).not.toContain("border-stat-atk");
    expect(input.className).toContain("border-border-subtle");
  });

  it("does not show error border during typing (validation on blur only)", () => {
    const { input } = renderInput();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "50" } });
    // mode: 'onBlur' — no validation until blur
    expect(input.className).not.toContain("border-stat-atk");
    expect(input.className).toContain("border-border-subtle");
  });

  it("syncs from external value via form.reset", async () => {
    const { input, getForm } = renderInput();
    expect(input.value).toBe("40");
    getForm().reset({ deckSize: 30, fusionDepth: 3, useEquipment: true });
    await waitFor(() => {
      expect(input.value).toBe("30");
    });
  });

  it("keeps typed value after blur", () => {
    const { input } = renderInput();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.blur(input);
    expect(input.value).toBe("25");
  });

  it("does not save when value is empty", () => {
    const onBlur = vi.fn();
    const { input } = renderInput({ onBlur });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
    expect(input.value).toBe("");
  });
});
