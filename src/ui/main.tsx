import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.tsx";
import { convex } from "./core/convex-client.ts";
import { IdentityProvider } from "./core/identity-context.tsx";
import "./index.css";
import { isAutoSyncMode } from "./lib/auto-sync-mode.ts";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

// Convex+Clerk are required in manual mode but optional in auto-sync-only deployments
if (!clerkPublishableKey && !isAutoSyncMode()) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

function Providers({ children }: { children: ReactNode }) {
  // Convex+Clerk providers are always mounted when env vars are present.
  // In auto-sync mode, all Convex queries are skipped via "skip" — no
  // network requests are made, but hooks remain callable.
  if (convex && clerkPublishableKey) {
    return (
      <ClerkProvider afterSignOutUrl="/" publishableKey={clerkPublishableKey}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <IdentityProvider>{children}</IdentityProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  }
  // Future: auto-sync-only deployment without Convex/Clerk.
  // Components that call useConvexAuth / useClerk unconditionally
  // (e.g. Header) would need wrapper guards before this path works.
  return <>{children}</>;
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
