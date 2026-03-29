import { describe, expect, it } from "vitest";
import { resolveUserId } from "../../convex/authHelper.ts";

describe("resolveUserId", () => {
  it("returns the Clerk-backed token identifier for authenticated users", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => ({
          tokenIdentifier: "issuer|user-123",
        }),
      },
    } as Parameters<typeof resolveUserId>[0];

    await expect(resolveUserId(ctx)).resolves.toBe("issuer|user-123");
  });

  it("throws when there is no authenticated user and no anonymousId", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => null,
      },
    } as Parameters<typeof resolveUserId>[0];

    await expect(resolveUserId(ctx)).rejects.toThrow("Not authenticated");
  });

  it("returns anon:<uuid> when unauthenticated but anonymousId is provided", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => null,
      },
    } as Parameters<typeof resolveUserId>[0];

    const uuid = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
    await expect(resolveUserId(ctx, uuid)).resolves.toBe(`anon:${uuid}`);
  });

  it("prefers Clerk identity over anonymousId", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => ({
          tokenIdentifier: "issuer|user-123",
        }),
      },
    } as Parameters<typeof resolveUserId>[0];

    const uuid = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
    await expect(resolveUserId(ctx, uuid)).resolves.toBe("issuer|user-123");
  });

  it("rejects invalid anonymousId format", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => null,
      },
    } as Parameters<typeof resolveUserId>[0];

    await expect(resolveUserId(ctx, "not-a-uuid")).rejects.toThrow("Invalid anonymous ID format");
  });
});
