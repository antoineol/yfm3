import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.tsx";
import { convex } from "./core/convex-client.ts";
import { IdentityProvider } from "./core/identity-context.tsx";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPublishableKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

createRoot(root).render(
  <StrictMode>
    <ClerkProvider afterSignOutUrl="/" publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <IdentityProvider>
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
        </IdentityProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
);
