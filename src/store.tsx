import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type LogEntry = {
  id: string;
  day: string;
  time: string;
  title: string;
  kind: 'strength' | 'run' | 'interval';
  minutes: number;
  kcal: number;
  details: string;
  // Set for library exercises so the body map can light up the trained muscles.
  exerciseId?: string;
};

type Store = {
  weightKg: number;
  setWeightKg: (kg: number) => void;
  log: LogEntry[];
  addEntry: (e: Omit<LogEntry, 'id' | 'day' | 'time'>) => LogEntry;
  removeEntry: (id: string) => void;
  today: LogEntry[];
};

const KEY = 'fitapp/state/v1';
const StoreContext = createContext<Store | null>(null);

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [weightKg, setWeightKg] = useState(75);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (typeof saved.weightKg === 'number') setWeightKg(saved.weightKg);
        if (Array.isArray(saved.log)) setLog(saved.log);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify({ weightKg, log })).catch(() => {});
  }, [loaded, weightKg, log]);

  const value = useMemo<Store>(() => {
    const today = dayKey();
    return {
      weightKg,
      setWeightKg,
      log,
      today: log.filter((e) => e.day === today),
      addEntry: (e) => {
        const now = new Date();
        const entry: LogEntry = {
          ...e,
          id: `${now.getTime()}`,
          day: dayKey(now),
          time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        };
        setLog((prev) => [entry, ...prev]);
        return entry;
      },
      removeEntry: (id) => setLog((prev) => prev.filter((e) => e.id !== id)),
    };
  }, [weightKg, log]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
