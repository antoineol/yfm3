// @vitest-environment happy-dom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: vi.fn(),
}));

import { useAuthActions } from "@convex-dev/auth/react";
import { useGoogleSignIn } from "./use-google-sign-in.ts";

const mockUseAuthActions = useAuthActions as ReturnType<typeof vi.fn>;

afterEach(cleanup);

describe("useGoogleSignIn", () => {
  let mockSignIn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSignIn = vi.fn().mockResolvedValue(undefined);
    mockUseAuthActions.mockReturnValue({ signIn: mockSignIn });
  });

  it("starts with signingIn false and error null", () => {
    const { result } = renderHook(() => useGoogleSignIn());
    expect(result.current.signingIn).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets signingIn to true when handleSignIn is called", () => {
    const { result } = renderHook(() => useGoogleSignIn());
    act(() => result.current.handleSignIn());
    expect(result.current.signingIn).toBe(true);
  });

  it("sets error and resets signingIn on sign-in failure", async () => {
    mockSignIn.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useGoogleSignIn());

    await act(() => result.current.handleSignIn());

    expect(result.current.error).toBe("Sign-in failed. Please try again.");
    expect(result.current.signingIn).toBe(false);
  });

  it("clears previous error when handleSignIn is called again", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("fail"));
    const { result } = renderHook(() => useGoogleSignIn());

    await act(() => result.current.handleSignIn());
    expect(result.current.error).not.toBeNull();

    mockSignIn.mockResolvedValue(undefined);
    act(() => result.current.handleSignIn());
    expect(result.current.error).toBeNull();
  });
});
