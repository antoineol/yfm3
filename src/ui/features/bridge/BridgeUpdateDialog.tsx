import { Dialog } from "../../components/Dialog.tsx";
import { Spinner } from "../../components/Loader.tsx";
import { useBridge } from "../../lib/bridge-context.tsx";
import { BRIDGE_DOWNLOAD_URL, BRIDGE_MIN_VERSION } from "./bridge-constants.ts";

export function BridgeUpdateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const bridge = useBridge();

  return (
    <Dialog onClose={onClose} open={open} title="Bridge Update">
      <div className="space-y-4 text-sm">
        {bridge.version && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-950/20">
            <span className="inline-block size-2.5 rounded-full shrink-0 bg-yellow-400" />
            <p className="text-yellow-400/90">
              Installed: <strong>{bridge.version}</strong> — Latest:{" "}
              <strong>{BRIDGE_MIN_VERSION}</strong>
            </p>
          </div>
        )}

        {bridge.updating ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Spinner className="size-5 text-gold" />
            <p className="text-text-secondary">Restarting bridge&hellip;</p>
          </div>
        ) : bridge.updateStaged ? (
          <>
            <p className="text-text-muted text-xs text-center">
              Update downloaded — restart will only take a few seconds.
            </p>
            <button
              className="w-full px-4 py-2.5 rounded-lg bg-green-400/15 text-green-400 text-sm font-medium hover:bg-green-400/25 transition-colors cursor-pointer"
              onClick={() => bridge.updateAndRestart()}
              type="button"
            >
              Restart to update
            </button>
          </>
        ) : bridge.stageFailed ? (
          <>
            <button
              className="w-full px-4 py-2.5 rounded-lg bg-gold/15 text-gold text-sm font-medium hover:bg-gold/25 transition-colors cursor-pointer"
              onClick={() => bridge.updateAndRestart()}
              type="button"
            >
              Update &amp; Restart
            </button>
            <details className="text-text-muted">
              <summary className="text-xs cursor-pointer hover:text-text-secondary transition-colors">
                Manual update
              </summary>
              <ol className="list-decimal ml-5 mt-2 space-y-2 text-text-secondary">
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
            </details>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <Spinner className="size-5 text-yellow-400" />
            <p className="text-text-secondary">Downloading update&hellip;</p>
          </div>
        )}

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
