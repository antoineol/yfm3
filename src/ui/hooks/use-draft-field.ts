import { useEffect, useMemo, useRef, useState } from "react";
import type { z } from "zod";

export function useDraftField(
  value: number,
  schema: z.ZodType<number>,
  onCommit: (v: number) => void,
) {
  const [draft, setDraft] = useState(String(value));
  const touchedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!touchedRef.current) setDraft(String(value));
  }, [value]);

  const parsed = useMemo(() => {
    const raw = Number(draft);
    return draft.trim() !== "" && !Number.isNaN(raw) ? schema.safeParse(raw) : null;
  }, [draft, schema]);

  const error = parsed !== null && !parsed.success;

  function commit() {
    touchedRef.current = false;
    if (!parsed?.success) {
      setDraft(String(value));
      return;
    }
    setDraft(String(parsed.data));
    if (parsed.data !== value) onCommit(parsed.data);
  }

  const inputProps = {
    ref: inputRef,
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
    onFocus: () => {
      touchedRef.current = true;
    },
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter") inputRef.current?.blur();
    },
  };

  return { inputProps, error };
}
