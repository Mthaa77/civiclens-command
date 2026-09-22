import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { initialCases, type CivicCase } from "@/lib/civic-data";

const STORAGE_KEY = "civiclens.cases.v1";

type CivicStoreValue = {
  cases: CivicCase[];
  addCase: (civicCase: Omit<CivicCase, "id">) => CivicCase;
  updateCase: (id: string, patch: Partial<CivicCase>) => void;
};

const CivicStoreContext = createContext<CivicStoreValue | null>(null);

export function CivicProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CivicCase[]>(initialCases);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (!value) return;
      try {
        const parsed = JSON.parse(value) as CivicCase[];
        if (Array.isArray(parsed)) setCases(parsed);
      } catch {
        // Keep the local demo data if saved data is unavailable or malformed.
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cases)).catch(() => undefined);
  }, [cases]);

  const value = useMemo<CivicStoreValue>(() => ({
    cases,
    addCase: (civicCase) => {
      const created = { ...civicCase, id: `CL-${String(Date.now()).slice(-6)}` };
      setCases((current) => [created, ...current]);
      return created;
    },
    updateCase: (id, patch) => setCases((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item)),
  }), [cases]);

  return <CivicStoreContext.Provider value={value}>{children}</CivicStoreContext.Provider>;
}

export function useCivic() {
  const value = useContext(CivicStoreContext);
  if (!value) throw new Error("useCivic must be used inside CivicProvider");
  return value;
}
