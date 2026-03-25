import { components } from './_generated/api';
import { type DataModel } from './_generated/dataModel';
import { TableAggregate } from '@convex-dev/aggregate';

// Create an aggregate for counting deck cards, scoped by (userId, mod).
// Key is "userId:mod" to partition counts per user per mod.
export const deckAggregate = new TableAggregate<{
  Key: string;
  DataModel: DataModel;
  TableName: 'deck';
}>(components.deckAggregate, {
  sortKey: (doc) => `${doc.userId}:${doc.mod}`,
});

/** Build the aggregate key for a given user and mod. */
export function deckAggregateKey(userId: string, mod: string): string {
  return `${userId}:${mod}`;
}
