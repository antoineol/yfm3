/** Read a JSON value from localStorage. Returns `null` on missing or corrupt data. */
export function readLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Write a JSON value to localStorage. */
export function writeLocal<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Remove a key from localStorage. */
export function removeLocal(key: string): void {
  localStorage.removeItem(key);
}
