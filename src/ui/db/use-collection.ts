import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useCollection() {
  return useQuery(api.collection.getCollection, {});
}
