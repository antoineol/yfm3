/**
 * Fractional ordering utilities for efficient list reordering without cascading updates
 *
 * Benefits:
 * - Only the moved item needs updating
 * - No cascading database updates when removing items
 * - Efficient for real-time collaboration
 * - High precision allows many operations before needing renormalization
 */

/**
 * Generate the next order value for appending to the end of a list
 */
export function getNextOrder(existingOrders: number[]): number {
  if (existingOrders.length === 0) return 0.5;
  const maxOrder = Math.max(...existingOrders);
  return (maxOrder + 1) / 2;
}

/**
 * Generate an order value between two existing orders
 * Used for inserting items at specific positions
 */
export function getOrderBetween(before: number | null, after: number | null): number {
  if (before === null && after === null) return 0.5;
  if (before === null) return after! / 2;
  if (after === null) return (before + 1) / 2;
  return (before + after) / 2;
}

/**
 * Generate evenly spaced orders for a list of items
 * Useful for batch operations like replacing entire lists
 */
export function generateEvenlySpacedOrders(count: number): number[] {
  const orders: number[] = [];
  for (let i = 0; i < count; i++) {
    orders.push((i + 1) / (count + 1));
  }
  return orders;
}

/**
 * Check if orders need renormalization (when precision gets too high)
 * Returns true if any order is getting close to floating point precision limits
 */
export function needsRenormalization(orders: number[]): boolean {
  // Check if any order has more than 10 decimal places
  // This is conservative - JS floats can handle more, but this prevents issues
  return orders.some(order => {
    const str = order.toString();
    const decimalIndex = str.indexOf('.');
    return decimalIndex >= 0 && str.length - decimalIndex - 1 > 10;
  });
}

/**
 * Renormalize a list of orders to evenly spaced values
 * Use when precision gets too high to prevent floating point issues
 */
export function renormalizeOrders(items: { id: string; order: number }[]): { id: string; newOrder: number }[] {
  // Sort by current order
  const sorted = [...items].sort((a, b) => a.order - b.order);

  // Generate new evenly spaced orders
  const newOrders = generateEvenlySpacedOrders(sorted.length);

  return sorted.map((item, index) => ({
    id: item.id,
    newOrder: newOrders[index] ?? 0.5, // Fallback to middle if somehow undefined
  }));
}
