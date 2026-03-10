import { useCallback, useSyncExternalStore } from "react";

function getHash(): string {
  return window.location.hash.slice(1);
}

function subscribe(cb: () => void): () => void {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

/**
 * Sync selected tab with the URL hash (`#deck`, `#hand`, etc.).
 * Falls back to `defaultTab` when hash is empty or not in `validTabs`.
 */
export function useTabFromHash(validTabs: readonly string[], defaultTab: string) {
  const hash = useSyncExternalStore(subscribe, getHash, () => "");
  const tab = validTabs.includes(hash) ? hash : defaultTab;

  const setTab = useCallback((value: string | null) => {
    if (value == null) return;
    window.history.replaceState(null, "", `#${value}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  return [tab, setTab] as const;
}
