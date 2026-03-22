import { Dialog } from "../../components/Dialog.tsx";
import { BRIDGE_DOWNLOAD_URL, BRIDGE_MIN_VERSION } from "./bridge-constants.ts";

export function BridgeUpdateDialog({
  currentVersion,
  open,
  onClose,
}: {
  currentVersion: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog onClose={onClose} open={open} title="Bridge Update Available">
      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-950/20">
          <span className="inline-block size-2.5 rounded-full shrink-0 bg-yellow-400" />
          <p className="text-yellow-400/90">
            Installed: <strong>{currentVersion}</strong> — Latest:{" "}
            <strong>{BRIDGE_MIN_VERSION}</strong>
          </p>
        </div>

        <ol className="list-decimal ml-5 space-y-2 text-text-secondary">
          <li>Close the bridge window</li>
          <li>
            <a
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gold/15 text-gold text-xs font-medium hover:bg-gold/25 transition-colors"
              download
              href={BRIDGE_DOWNLOAD_URL}
              rel="noopener noreferrer"
            >
              Download the latest bridge
            </a>
          </li>
          <li>Replace the old folder with the new download</li>
          <li>
            Double-click <strong>start-bridge.bat</strong>
          </li>
        </ol>

        <button
          className="w-full mt-2 px-4 py-2 rounded-lg bg-surface-secondary text-text-secondary text-sm hover:text-text-primary transition-colors cursor-pointer"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}
