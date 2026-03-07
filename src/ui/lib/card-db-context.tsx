import { createContext, type ReactNode, useContext } from "react";
import cardsCsvRaw from "../../../data/rp-cards.csv?raw";
import type { CardDb } from "../../engine/data/game-db.ts";
import { parseCardCsv } from "../../engine/data/parse-cards.ts";

const cardDb: CardDb = parseCardCsv(cardsCsvRaw);

const CardDbContext = createContext<CardDb>(cardDb);

export function CardDbProvider({ children }: { children: ReactNode }) {
  return <CardDbContext.Provider value={cardDb}>{children}</CardDbContext.Provider>;
}

export function useCardDb(): CardDb {
  return useContext(CardDbContext);
}
