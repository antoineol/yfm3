// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog.tsx";

afterEach(cleanup);

describe("Dialog", () => {
  it("renders children when open", () => {
    render(
      <Dialog onClose={vi.fn()} open={true} title="Test">
        dialog content
      </Dialog>,
    );
    expect(screen.getByText("dialog content")).toBeTruthy();
  });

  it("does not render when closed", () => {
    render(
      <Dialog onClose={vi.fn()} open={false} title="Test">
        dialog content
      </Dialog>,
    );
    expect(screen.queryByText("dialog content")).toBeNull();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Dialog onClose={onClose} open={true} title="Test">
        content
      </Dialog>,
    );
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("displays the title", () => {
    render(
      <Dialog onClose={vi.fn()} open={true} title="Settings">
        content
      </Dialog>,
    );
    expect(screen.getByText("Settings")).toBeTruthy();
  });
});
