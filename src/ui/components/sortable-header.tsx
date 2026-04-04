export type SortDir = "asc" | "desc";
export type SortState<K extends string = string> = { key: K; dir: SortDir } | null;

/**
 * Cycle through: firstDir → opposite → null.
 * Switches to firstDir when toggling a different column.
 */
export function toggleSort<K extends string>(
  prev: SortState<K>,
  key: K,
  firstDir: SortDir = "desc",
): SortState<K> {
  const secondDir: SortDir = firstDir === "asc" ? "desc" : "asc";
  if (prev?.key !== key) return { key, dir: firstDir };
  if (prev.dir === firstDir) return { key, dir: secondDir };
  return null;
}

export function sortEntries<T, K extends string>(
  entries: T[],
  sort: SortState<K>,
  getters: Record<K, (e: T) => number>,
): T[] {
  if (!sort) return entries;
  const dir = sort.dir === "asc" ? 1 : -1;
  const getter = getters[sort.key];
  return [...entries].sort((a, b) => dir * (getter(a) - getter(b)));
}

export function SortableHeader({
  label,
  dir,
  onClick,
  px = "px-1",
  align = "text-left",
  className = "",
}: {
  label: string;
  dir?: SortDir;
  onClick: () => void;
  px?: string;
  align?: "text-left" | "text-right";
  className?: string;
}) {
  return (
    <th
      className={`${align} py-1.5 ${px} font-normal cursor-pointer select-none hover:text-text-primary ${dir ? "text-gold" : ""} ${className}`}
      onClick={onClick}
    >
      {label}
      {dir && <span className="ml-0.5">{dir === "asc" ? "\u25B4" : "\u25BE"}</span>}
    </th>
  );
}
