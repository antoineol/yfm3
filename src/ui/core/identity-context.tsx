import { useConvexAuth } from "convex/react";
import { createContext, type ReactNode, useContext, useMemo } from "react";

const STORAGE_KEY = "yfm_anonymous_id";

const IdentityContext = createContext<string | undefined>(undefined);

export function useAnonymousId(): string | undefined {
  return useContext(IdentityContext);
}

function getOrCreateAnonymousId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

/**
 * Provides anonymous identity for Convex queries.
 * Only mounted inside ConvexProviderWithClerk (see main.tsx Providers).
 */
export function IdentityProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const anonymousId = useMemo(
    () => (isAuthenticated ? undefined : getOrCreateAnonymousId()),
    [isAuthenticated],
  );
  return <IdentityContext.Provider value={anonymousId}>{children}</IdentityContext.Provider>;
}
