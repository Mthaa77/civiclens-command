import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { initialCases, locationProfile, type CivicCase } from "@/lib/civic-data";
import type { DirectorySelection } from "@/lib/municipal-directory";

const STORAGE_KEY = "civiclens.cases.v1";
const LOCATION_STORAGE_KEY = "civiclens.location.v1";

export const defaultLocation: DirectorySelection = {
  code: "TSH",
  name: locationProfile.municipality,
  officialName: "City of Tshwane Metropolitan Municipality",
  province: locationProfile.province,
  district: locationProfile.municipality,
  districtCode: "TSH",
};

type CivicStoreValue = {
  cases: CivicCase[];
  selectedLocation: DirectorySelection;
  setSelectedLocation: (location: DirectorySelection) => void;
  addCase: (civicCase: Omit<CivicCase, "id">) => CivicCase;
  updateCase: (id: string, patch: Partial<CivicCase>) => void;
};

const CivicStoreContext = createContext<CivicStoreValue | null>(null);

export function CivicProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CivicCase[]>(initialCases);
  const [selectedLocation, setSelectedLocation] = useState<DirectorySelection>(defaultLocation);

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
    AsyncStorage.getItem(LOCATION_STORAGE_KEY).then((value) => {
      if (!value) return;
      try {
        const parsed = JSON.parse(value) as DirectorySelection;
        if (parsed?.code && parsed?.name) setSelectedLocation(parsed);
      } catch {
        // Keep the launch location if saved location data is unavailable or malformed.
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cases)).catch(() => undefined);
  }, [cases]);

  useEffect(() => {
    AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(selectedLocation)).catch(() => undefined);
  }, [selectedLocation]);

  const value = useMemo<CivicStoreValue>(() => ({
    cases,
    selectedLocation,
    setSelectedLocation,
    addCase: (civicCase) => {
      const created = { ...civicCase, id: `CL-${String(Date.now()).slice(-6)}` };
      setCases((current) => [created, ...current]);
      return created;
    },
    updateCase: (id, patch) => setCases((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item)),
  }), [cases, selectedLocation]);

  return <CivicStoreContext.Provider value={value}>{children}</CivicStoreContext.Provider>;
}

export function useCivic() {
  const value = useContext(CivicStoreContext);
  if (!value) throw new Error("useCivic must be used inside CivicProvider");
  return value;
}
