import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
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
      </CardDbProvider>
    </ConvexAuthProvider>
  </StrictMode>,
);
