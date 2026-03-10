import { createContext, type ReactNode, useContext } from "react";
import type { CardDb } from "../../engine/data/game-db.ts";

const CardDbContext = createContext<CardDb | null>(null);

export function CardDbProvider({ cardDb, children }: { cardDb: CardDb; children: ReactNode }) {
  return <CardDbContext.Provider value={cardDb}>{children}</CardDbContext.Provider>;
}

export function useCardDb(): CardDb {
  const db = useContext(CardDbContext);
  if (!db) throw new Error("useCardDb must be used within a CardDbProvider");
  return db;
}
