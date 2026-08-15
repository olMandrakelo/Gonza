import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useStorageList<T extends { id: string }>(storageKey: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (cancelled) return;
        setItems(raw ? (JSON.parse(raw) as T[]) : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const persist = useCallback(
    (next: T[]) => {
      setItems(next);
      return AsyncStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  const addItem = useCallback(
    (item: Omit<T, 'id'>) => {
      const withId = { ...item, id: generateId() } as T;
      return persist([withId, ...items]).then(() => withId);
    },
    [items, persist]
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<T>) => persist(items.map((it) => (it.id === id ? { ...it, ...patch } : it))),
    [items, persist]
  );

  const removeItem = useCallback((id: string) => persist(items.filter((it) => it.id !== id)), [items, persist]);

  return { items, loading, addItem, updateItem, removeItem };
}
