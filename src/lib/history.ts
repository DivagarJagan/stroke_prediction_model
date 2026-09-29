import { useCallback, useEffect, useState } from "react";

export type HistoryItem = {
  timestamp: string;
  age: number;
  gender: string;
  glucose: number;
  bmi: number | null;
  prediction: 0 | 1;
  risk: number;
};

const KEY = "stroke-history";

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    try {
      setItems(JSON.parse(sessionStorage.getItem(KEY) ?? "[]"));
    } catch {
      setItems([]);
    }
  }, []);
  const save = (next: HistoryItem[]) => {
    setItems(next);
    sessionStorage.setItem(KEY, JSON.stringify(next));
  };
  const add = useCallback((i: HistoryItem) => {
    setItems((prev) => {
      const next = [i, ...prev].slice(0, 50);
      sessionStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return { items, add, clear: () => save([]) };
}
