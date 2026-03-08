import { useAuthActions } from "@convex-dev/auth/react";

export function Header() {
  const { signOut } = useAuthActions();
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-bold">YFM Deck Optimizer</h1>
      <button
        type="button"
        onClick={() => void signOut()}
        className="text-sm text-gray-400 hover:text-gray-200"
      >
        Sign out
      </button>
    </div>
  );
}
