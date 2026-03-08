// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./use-google-sign-in.ts", () => ({
  useGoogleSignIn: vi.fn(),
}));

import { SignIn } from "./SignIn.tsx";
import { useGoogleSignIn } from "./use-google-sign-in.ts";

const mockUseGoogleSignIn = useGoogleSignIn as ReturnType<typeof vi.fn>;

afterEach(cleanup);

describe("SignIn", () => {
  it("renders sign-in button when not signing in", () => {
    mockUseGoogleSignIn.mockReturnValue({ signingIn: false, error: null, handleSignIn: vi.fn() });
    render(<SignIn />);
    expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeDefined();
  });

  it("renders signing-in state", () => {
    mockUseGoogleSignIn.mockReturnValue({ signingIn: true, error: null, handleSignIn: vi.fn() });
    render(<SignIn />);
    const btn = screen.getByRole("button", { name: /signing in/i });
    expect(btn).toBeDefined();
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  it("renders error message when error is present", () => {
    mockUseGoogleSignIn.mockReturnValue({
      signingIn: false,
      error: "Sign-in failed. Please try again.",
      handleSignIn: vi.fn(),
    });
    render(<SignIn />);
    expect(screen.getByText("Sign-in failed. Please try again.")).toBeDefined();
  });

  it("hides error message when no error", () => {
    mockUseGoogleSignIn.mockReturnValue({ signingIn: false, error: null, handleSignIn: vi.fn() });
    render(<SignIn />);
    expect(screen.queryByText("Sign-in failed. Please try again.")).toBeNull();
  });
});
