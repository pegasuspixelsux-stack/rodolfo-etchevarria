"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, seed: T) {
  const [value, setValueState] = useState<T>(seed);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        setValueState(JSON.parse(raw) as T);
      }
    } catch {
      // malformed or unavailable storage — keep the seed value
    }
    // Only re-hydrate if the key itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolved =
          typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage unavailable — state still updates in memory
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, setValue] as const;
}
