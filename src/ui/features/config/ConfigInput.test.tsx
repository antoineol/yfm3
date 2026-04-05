// @vitest-environment happy-dom
import { zodResolver } from "@hookform/resolvers/zod";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { afterEach, describe, expect, it } from "vitest";

import { Form } from "../../components/Form.tsx";
import { ConfigInput } from "./ConfigPanel.tsx";
import { type ConfigFormValues, configSchema } from "./config-schema.ts";

afterEach(cleanup);

describe("ConfigInput", () => {
  let formRef: UseFormReturn<ConfigFormValues>;

  function Wrapper({
    defaultValues = { deckSize: 40, fusionDepth: 3, useEquipment: true, terrain: 0 },
    disabled = false,
  }: {
    defaultValues?: ConfigFormValues;
    disabled?: boolean;
  }) {
    const form = useForm<ConfigFormValues>({
      resolver: zodResolver(configSchema),
      mode: "onChange",
      defaultValues,
    });
    formRef = form;

    return (
      <Form form={form}>
        <ConfigInput disabled={disabled} label="Deck size" name="deckSize" />
      </Form>
    );
  }

  function renderInput(overrides: { defaultValues?: ConfigFormValues; disabled?: boolean } = {}) {
    const result = render(<Wrapper {...overrides} />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    return { input, result, getForm: () => formRef };
  }

  it("shows the current value", () => {
    const { input } = renderInput({
      defaultValues: { deckSize: 30, fusionDepth: 3, useEquipment: true, terrain: 0 },
    });
    expect(input.value).toBe("30");
  });

  it("shows error border after invalid value", async () => {
    const { input } = renderInput();
    fireEvent.change(input, { target: { value: "50" } });
    await waitFor(() => {
      expect(input.className).toContain("border-stat-atk");
    });
  });

  it("shows default border with valid value", () => {
    const { input } = renderInput();
    expect(input.className).not.toContain("border-stat-atk");
    expect(input.className).toContain("border-border-subtle");
  });

  it("syncs from external value via form.reset", async () => {
    const { input, getForm } = renderInput();
    expect(input.value).toBe("40");
    getForm().reset({ deckSize: 30, fusionDepth: 3, useEquipment: true, terrain: 0 });
    await waitFor(() => {
      expect(input.value).toBe("30");
    });
  });

  it("keeps typed value after change", () => {
    const { input } = renderInput();
    fireEvent.change(input, { target: { value: "25" } });
    expect(input.value).toBe("25");
  });
});
