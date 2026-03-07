import { components } from './_generated/api';
import { type DataModel } from './_generated/dataModel';
import { TableAggregate } from '@convex-dev/aggregate';

// Create an aggregate for counting deck cards by user
export const deckAggregate = new TableAggregate<{
  Key: null;
  DataModel: DataModel;
  TableName: 'deck';
}>(components.deckAggregate, {
  sortKey: _doc => null,
});
