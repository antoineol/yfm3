import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

/** `null` when running without Convex (auto-sync-only deployment). */
export const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;
