import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { convex } from "./core/convex-client.ts";
import { CardDbProvider } from "./lib/card-db-context.tsx";
import "./index.css";
import App from "./App.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <CardDbProvider>
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
      </CardDbProvider>
    </ConvexAuthProvider>
  </StrictMode>,
);
