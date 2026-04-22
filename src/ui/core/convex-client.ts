import { ConvexReactClient } from "convex/react";

// The client is constructed eagerly but doesn't open a WebSocket until the
// first non-skip useQuery/useMutation runs. Auto-sync mode keeps every Convex
// hook in skip state, so an unreachable URL produces zero network traffic.
const convexUrl =
  (import.meta.env.VITE_CONVEX_URL as string | undefined) ?? "https://offline.invalid";

export const convex = new ConvexReactClient(convexUrl);

/** True when a real Convex deployment URL is configured. */
export const hasConvexUrl = !!import.meta.env.VITE_CONVEX_URL;
