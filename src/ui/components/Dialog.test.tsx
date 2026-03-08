// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog.tsx";

// happy-dom may not implement showModal/close on HTMLDialogElement
beforeEach(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    });
  }
});

afterEach(cleanup);

describe("Dialog", () => {
  it("calls showModal when open becomes true", () => {
    const spy = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    render(
      <Dialog open={true} onClose={vi.fn()} title="Test">
        content
      </Dialog>,
    );
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("calls close when open becomes false", () => {
    const spy = vi.spyOn(HTMLDialogElement.prototype, "close");
    const { rerender } = render(
      <Dialog open={true} onClose={vi.fn()} title="Test">
        content
      </Dialog>,
    );
    rerender(
      <Dialog open={false} onClose={vi.fn()} title="Test">
        content
      </Dialog>,
    );
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Dialog open={true} onClose={onClose} title="Test">
        content
      </Dialog>,
    );
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });
});
