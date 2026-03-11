import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useLastAddedCard() {
  return useQuery(api.collection.getLastAddedCard, {});
}
