import { useCallback, useEffect, useRef } from "react";
import { HAND_SIZE } from "../../../engine/types/constants.ts";

/** Manages input focus for the manual hand card selector: blurs when hand is full, refocuses after removals. */
export function useHandInputFocus(handLength: number) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingFocusRef = useRef(false);

  useEffect(() => {
    if (handLength >= HAND_SIZE) {
      inputRef.current?.blur();
    } else if (pendingFocusRef.current) {
      pendingFocusRef.current = false;
      inputRef.current?.focus();
    }
  }, [handLength]);

  const requestInputFocus = useCallback(() => {
    inputRef.current?.focus();
    pendingFocusRef.current = true;
  }, []);

  return { inputRef, requestInputFocus } as const;
}
