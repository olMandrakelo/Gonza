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

  const addMany = useCallback(
    (newItems: Omit<T, 'id'>[]) => {
      const withIds = newItems.map((item) => ({ ...item, id: generateId() }) as T);
      return persist([...withIds, ...items]);
    },
    [items, persist]
  );

  const removeItem = useCallback((id: string) => persist(items.filter((it) => it.id !== id)), [items, persist]);

  return { items, loading, addItem, addMany, updateItem, removeItem };
}

/** Like useStorageList, but for a single record (e.g. a family plan) instead of a list. */
export function useStorageObject<T>(storageKey: string, empty: () => T) {
  const [value, setValue] = useState<T>(empty);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (cancelled) return;
        setValue(raw ? (JSON.parse(raw) as T) : empty());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const save = useCallback(
    (next: T) => {
      setValue(next);
      return AsyncStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  return { value, loading, save };
}
