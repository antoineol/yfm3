import { ConvexProvider } from "convex/react";
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
    <ConvexProvider client={convex}>
      <CardDbProvider>
        <App />
      </CardDbProvider>
    </ConvexProvider>
  </StrictMode>,
);
