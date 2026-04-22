import { useClerk } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { createContext, type ReactNode, useContext, useMemo } from "react";

/**
 * Abstraction over Clerk + Convex auth so the rest of the app can render
 * without those providers mounted (offline / auto-sync-only deployments).
 *
 * `hasAuthProvider` is true when Clerk is mounted: components must gate
 * Clerk-specific UI (e.g. <SignInButton>) on this flag.
 */
export type AppAuth = {
  isAuthenticated: boolean;
  signOut: () => Promise<void> | void;
  hasAuthProvider: boolean;
};

const NOOP_AUTH: AppAuth = {
  isAuthenticated: false,
  signOut: () => {},
  hasAuthProvider: false,
};

const AppAuthContext = createContext<AppAuth>(NOOP_AUTH);

export function useAppAuth(): AppAuth {
  return useContext(AppAuthContext);
}

/** Provides default no-auth values — used in auto-sync-only mode. */
export function NoAuthProvider({ children }: { children: ReactNode }) {
  return <AppAuthContext.Provider value={NOOP_AUTH}>{children}</AppAuthContext.Provider>;
}

/** Reads Clerk + Convex auth state and exposes it via {@link useAppAuth}.
 *  MUST be mounted inside ClerkProvider + ConvexProviderWithClerk. */
export function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { signOut } = useClerk();
  const { isAuthenticated } = useConvexAuth();
  const value = useMemo<AppAuth>(
    () => ({ isAuthenticated, signOut, hasAuthProvider: true }),
    [isAuthenticated, signOut],
  );
  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}
