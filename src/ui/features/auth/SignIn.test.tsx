// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/clerk-react", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { SignIn } from "./SignIn.tsx";

afterEach(cleanup);

describe("SignIn", () => {
  it("renders the sign-in button", () => {
    render(<SignIn />);
    expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeDefined();
  });

  it("renders the product title", () => {
    render(<SignIn />);
    expect(screen.getByText("YFM Deck Optimizer")).toBeDefined();
  });

  it("does not render a local sign-in error message", () => {
    render(<SignIn />);
    expect(screen.queryByText("Sign-in failed. Please try again.")).toBeNull();
  });
});
