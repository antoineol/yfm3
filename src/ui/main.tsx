import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithAuth } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.tsx";
import { ClerkAuthBridge, NoAuthProvider } from "./core/app-auth.tsx";
import { convex, hasConvexUrl } from "./core/convex-client.ts";
import { IdentityProvider } from "./core/identity-context.tsx";
import "./index.css";
import { isAutoSyncMode } from "./lib/auto-sync-mode.ts";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

// Initial mode is captured once at module load. Toggling auto-sync triggers a
// page reload (see use-update-preferences) so the provider tree always matches
// the active mode.
const autoSyncOnBoot = isAutoSyncMode();

if (!autoSyncOnBoot && (!clerkPublishableKey || !hasConvexUrl)) {
  throw new Error("Manual mode requires VITE_CLERK_PUBLISHABLE_KEY and VITE_CONVEX_URL");
}

// Stub auth: keeps useConvexAuth() callable when Clerk isn't mounted, while
// guaranteeing the Convex client never sets a token (no auth network calls).
const useStubAuth = () => ({
  isLoading: false,
  isAuthenticated: false,
  fetchAccessToken: async () => null,
});

function Providers({ children }: { children: ReactNode }) {
  if (autoSyncOnBoot) {
    return (
      <ConvexProviderWithAuth client={convex} useAuth={useStubAuth}>
        <IdentityProvider>
          <NoAuthProvider>{children}</NoAuthProvider>
        </IdentityProvider>
      </ConvexProviderWithAuth>
    );
  }
  return (
    <ClerkProvider afterSignOutUrl="/" publishableKey={clerkPublishableKey as string}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <IdentityProvider>
          <ClerkAuthBridge>{children}</ClerkAuthBridge>
        </IdentityProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

createRoot(root).render(
  <StrictMode>
    <Providers>
      <App />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--color-bg-panel)",
            border: "1px solid var(--color-border-accent)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
          },
        }}
      />
    </Providers>
  </StrictMode>,
);
