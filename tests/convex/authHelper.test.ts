import { describe, expect, it } from "vitest";
import { requireAuth } from "../../convex/authHelper.ts";

describe("requireAuth", () => {
  it("returns the Clerk-backed token identifier for authenticated users", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => ({
          tokenIdentifier: "issuer|user-123",
        }),
      },
    } as Parameters<typeof requireAuth>[0];

    await expect(requireAuth(ctx)).resolves.toBe("issuer|user-123");
  });

  it("throws when there is no authenticated user", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => null,
      },
    } as Parameters<typeof requireAuth>[0];

    await expect(requireAuth(ctx)).rejects.toThrow("Not authenticated");
  });
});
