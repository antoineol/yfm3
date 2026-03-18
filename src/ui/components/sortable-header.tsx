export type SortKey = "id" | "atk";
export type SortDir = "asc" | "desc";
export type SortState = { key: SortKey; dir: SortDir } | null;

export function toggleSort(prev: SortState, key: SortKey): SortState {
  const firstDir = key === "atk" ? "desc" : "asc";
  const secondDir = firstDir === "asc" ? "desc" : "asc";
  if (prev?.key !== key) return { key, dir: firstDir };
  if (prev.dir === firstDir) return { key, dir: secondDir };
  return null;
}

export function sortEntries<T>(
  entries: T[],
  sort: SortState,
  getters: { id: (e: T) => number; atk: (e: T) => number },
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
}: {
  label: string;
  dir?: SortDir;
  onClick: () => void;
  px?: string;
}) {
  return (
    <th
      className={`text-left py-2 ${px} font-normal cursor-pointer select-none hover:text-text-primary ${dir ? "text-gold" : ""}`}
      onClick={onClick}
    >
      {label}
      {dir && <span className="ml-0.5">{dir === "asc" ? "\u25B4" : "\u25BE"}</span>}
    </th>
  );
}
