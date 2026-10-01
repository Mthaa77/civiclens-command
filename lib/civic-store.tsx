import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { initialCases, locationProfile, type CivicCase } from "@/lib/civic-data";
import type { DirectorySelection } from "@/lib/municipal-directory";

const STORAGE_KEY = "civiclens.cases.v1";
const LOCATION_STORAGE_KEY = "civiclens.location.v1";
const OWNER_TOKEN_STORAGE_KEY = "civiclens.owner-token.v1";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://civiclens-api.tshepisokadiaka83.workers.dev";

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
  syncCaseToCloud: (civicCase: Omit<CivicCase, "id">) => Promise<CivicCase>;
};

const CivicStoreContext = createContext<CivicStoreValue | null>(null);

export function CivicProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CivicCase[]>(initialCases);
  const [selectedLocation, setSelectedLocation] = useState<DirectorySelection>(defaultLocation);
  const [ownerToken, setOwnerToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(OWNER_TOKEN_STORAGE_KEY).then(async (value) => {
      const token = value || crypto.randomUUID();
      if (!value) await AsyncStorage.setItem(OWNER_TOKEN_STORAGE_KEY, token);
      setOwnerToken(token);
    });
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
    syncCaseToCloud: async (civicCase) => {
      if (!ownerToken) throw new Error("Private case storage is still initializing");
      const response = await fetch(`${API_BASE_URL}/api/civic/reports`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerToken, service: civicCase.issueType, municipality: civicCase.municipality, ward: civicCase.ward, title: civicCase.title, description: civicCase.events?.[0]?.detail || civicCase.title }),
      });
      if (!response.ok) throw new Error("Could not save the case to CivicLens Cloud");
      const remote = await response.json() as { id: string; status: string; createdAt: string };
      const created = { ...civicCase, id: remote.id, status: remote.status, createdAt: remote.createdAt };
      setCases((current) => [created, ...current]);
      return created;
    },
  }), [cases, selectedLocation, ownerToken]);

  return <CivicStoreContext.Provider value={value}>{children}</CivicStoreContext.Provider>;
}

export function useCivic() {
  const value = useContext(CivicStoreContext);
  if (!value) throw new Error("useCivic must be used inside CivicProvider");
  return value;
}
