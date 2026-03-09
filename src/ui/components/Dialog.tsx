import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  return (
    <BaseDialog.Root onOpenChange={(v) => !v && onClose()} open={open}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
        <BaseDialog.Popup className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-accent rounded-xl p-5 shadow-[0_0_60px_rgba(0,0,0,0.5)] max-w-md w-full focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <BaseDialog.Title className="font-display text-sm font-bold uppercase tracking-wide text-gold">
              {title}
            </BaseDialog.Title>
            <BaseDialog.Close
              aria-label="Close"
              className="flex items-center justify-center size-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
            >
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </BaseDialog.Close>
          </div>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
