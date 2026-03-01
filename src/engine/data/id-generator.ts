let nextId = 1000;

export function generateNextId(): number {
  return nextId++;
}

export function resetIdGenerator(startId = 1000): void {
  nextId = startId;
}
