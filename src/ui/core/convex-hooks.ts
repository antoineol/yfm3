import { useConvexAuth, useMutation, useQuery } from "convex/react";
import type { FunctionReference, FunctionReturnType } from "convex/server";
import { useCallback } from "react";
import { useAnonymousId } from "./identity-context.tsx";

// Strip `anonymousId` from a Convex function's args type.
type StripAuth<Args> = Omit<Args, "anonymousId">;

/**
 * Wrapper around Convex `useQuery` that injects `anonymousId` for anonymous users.
 * When Clerk-authenticated, `anonymousId` is `undefined` and the backend uses the JWT.
 *
 * Queries are skipped while auth state is loading to avoid a race where
 * `isAuthenticated` flips before the JWT reaches the Convex server.
 */
export function useAuthQuery<Q extends FunctionReference<"query">>(
  query: Q,
  args?: StripAuth<Q["_args"]> | "skip",
): Q["_returnType"] | undefined {
  const anonymousId = useAnonymousId();
  const { isLoading } = useConvexAuth();
  const shouldSkip = isLoading || args === "skip";
  // biome-ignore lint/suspicious/noExplicitAny: Convex generic constraints require cast for injected anonymousId
  return useQuery(query, (shouldSkip ? "skip" : { ...(args ?? {}), anonymousId }) as any);
}

/**
 * Wrapper around Convex `useMutation` that injects `anonymousId` for anonymous users.
 * Returns a function with the same signature minus the `anonymousId` arg.
 */
export function useAuthMutation<M extends FunctionReference<"mutation">>(
  mutation: M,
): (args?: StripAuth<M["_args"]>) => Promise<FunctionReturnType<M>> {
  const anonymousId = useAnonymousId();
  const mutate = useMutation(mutation);
  // biome-ignore lint/suspicious/noExplicitAny: Convex generic constraints require cast for injected anonymousId
  return useCallback(((args: any) => mutate({ ...(args ?? {}), anonymousId })) as any, [
    mutate,
    anonymousId,
  ]);
}
