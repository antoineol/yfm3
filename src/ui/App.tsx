import { useAtomValue, useSetAtom } from "jotai";
import { CollectionPanel } from "./components/CollectionPanel.tsx";
import { ConfigPanel } from "./components/ConfigPanel.tsx";
import { DeckPanel } from "./components/DeckPanel.tsx";
import { ResultPanel } from "./components/ResultPanel.tsx";
import { userIdAtom } from "./lib/atoms.ts";

export default function App() {
  const userId = useAtomValue(userIdAtom);
  const setUserId = useSetAtom(userIdAtom);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <h1 className="text-xl font-bold mb-4">YFM Deck Optimizer</h1>
      <label className="mb-4 flex items-center gap-2 text-sm">
        User ID:
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="px-2 py-1 bg-gray-800 border border-gray-600 rounded w-64"
          placeholder="Enter user ID"
        />
      </label>
      <ConfigPanel />
      <div className="flex gap-6">
        <div className="flex-1">
          <CollectionPanel />
        </div>
        <div className="flex-1">
          <DeckPanel />
        </div>
        <div className="flex-1">
          <ResultPanel />
        </div>
      </div>
    </div>
  );
}
