import { useEffect, useState } from "react";

const LG_QUERY = "(min-width: 1024px)";

/** Returns `true` when the viewport is at least `lg` (1024px). */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && (window.matchMedia?.(LG_QUERY).matches ?? true),
  );

  useEffect(() => {
    const mq = window.matchMedia(LG_QUERY);
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}
