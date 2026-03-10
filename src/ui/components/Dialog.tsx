import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";
import { CloseButton } from "./CloseButton.tsx";

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
        <BaseDialog.Popup className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-bg-panel border border-border-accent rounded-xl p-5 shadow-overlay max-w-md w-full focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <BaseDialog.Title className="font-display text-sm font-bold uppercase tracking-wide text-gold">
              {title}
            </BaseDialog.Title>
            <BaseDialog.Close render={<CloseButton label="Close" />} />
          </div>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
