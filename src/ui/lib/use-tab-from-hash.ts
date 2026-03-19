import { useCallback, useSyncExternalStore } from "react";

function getHash(): string {
  return window.location.hash.slice(1);
}

function subscribe(cb: () => void): () => void {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

/** Raw hash access — returns the full string after `#` and a setter. */
export function useHash() {
  const hash = useSyncExternalStore(subscribe, getHash, () => "");

  const setHash = useCallback((value: string) => {
    window.history.replaceState(null, "", `#${value}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  return [hash, setHash] as const;
}

/**
 * Sync selected tab with the URL hash (`#deck`, `#hand`, `#data/duelists/5`, …).
 * Matches on the first path segment so `#data/duelists/5` resolves to tab `"data"`.
 * Falls back to `defaultTab` when hash is empty or not in `validTabs`.
 */
export function useTabFromHash(validTabs: readonly string[], defaultTab: string) {
  const [hash, setHash] = useHash();
  const firstSegment = hash.split("/")[0] ?? "";
  const tab = validTabs.includes(firstSegment) ? firstSegment : defaultTab;

  const setTab = useCallback(
    (value: string | null) => {
      if (value == null) return;
      setHash(value);
    },
    [setHash],
  );

  return [tab, setTab] as const;
}
