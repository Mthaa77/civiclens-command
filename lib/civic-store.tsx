import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { initialCases, locationProfile, type CivicCase } from "@/lib/civic-data";
import type { DirectorySelection } from "@/lib/municipal-directory";

const STORAGE_KEY = "civiclens.cases.v1";
const LOCATION_STORAGE_KEY = "civiclens.location.v1";
const OWNER_TOKEN_STORAGE_KEY = "civiclens.owner-token.v1";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://civiclens-command.tshepisokadiaka83.workers.dev";

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
  updateCaseInCloud: (id: string, patch: { status: string; detail?: string; reference?: string }) => Promise<void>;
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
      } catch {}
    });
    AsyncStorage.getItem(LOCATION_STORAGE_KEY).then((value) => {
      if (!value) return;
      try {
        const parsed = JSON.parse(value) as DirectorySelection;
        if (parsed?.code && parsed?.name) setSelectedLocation(parsed);
      } catch {}
    });
  }, []);

  useEffect(() => {
    if (!ownerToken) return;
    fetch(API_BASE_URL + "/api/civic/reports?ownerToken=" + encodeURIComponent(ownerToken))
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load cloud cases");
        return await response.json() as { reports: Array<{
          id: string;
          service: string;
          municipality: string;
          ward: string | null;
          title: string;
          description: string;
          status: string;
          created_at: string;
          events?: Array<{ event_type: string; label: string; detail: string | null; created_at: string }>;
        }> };
      })
      .then(({ reports }) => {
        setCases((current) => {
          const localById = new Map(current.map((item) => [item.id, item]));
          const cloudCases: CivicCase[] = reports.map((report) => {
            const existing = localById.get(report.id);
            if (existing) return existing;
            const date = new Date(report.created_at);
            const dateLabel = new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short", year: "numeric" }).format(date);
            const shortDate = new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short" }).format(date);
            return {
              id: report.id,
              issueType: report.service,
              title: report.title,
              municipality: report.municipality,
              ward: report.ward || "Ward not selected",
              status: report.status === "submitted" ? "Submitted to CivicLens Cloud" : report.status,
              statusTone: report.status === "submitted" ? "info" : "warning",
              createdAt: dateLabel,
              reference: "Not added yet",
              evidenceCount: 0,
              location: report.municipality + " · private location",
              visibility: "Private",
              events: (report.events?.length ? report.events : [{
                event_type: report.status,
                label: "Case saved to CivicLens Cloud",
                detail: report.description || "Issue details saved privately",
                created_at: report.created_at,
              }]).map((event) => ({
                date: new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short" }).format(new Date(event.created_at)),
                label: event.label,
                detail: event.detail || undefined,
              })),
            };
          });
          const cloudIds = new Set(cloudCases.map((item) => item.id));
          return [...cloudCases, ...current.filter((item) => !cloudIds.has(item.id))];
        });
      })
      .catch(() => undefined);
  }, [ownerToken]);

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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerToken,
          service: civicCase.issueType,
          municipality: civicCase.municipality,
          ward: civicCase.ward,
          title: civicCase.title,
          description: civicCase.events?.[0]?.detail || civicCase.title,
        }),
      });
      if (!response.ok) throw new Error("Could not save the case to CivicLens Cloud");
      const remote = await response.json() as { id: string; status: string; createdAt: string };
      const created = { ...civicCase, id: remote.id, status: remote.status, createdAt: remote.createdAt };
      setCases((current) => [created, ...current]);
      return created;
    },
    updateCaseInCloud: async (id, patch) => {
      if (!ownerToken) throw new Error("Private case storage is still initializing");
      const response = await fetch(`${API_BASE_URL}/api/civic/reports/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerToken, ...patch }),
      });
      if (!response.ok) throw new Error("Could not update the case in CivicLens Cloud");
      const result = await response.json() as { status: string; event: { createdAt: string; label: string; detail?: string | null } };
      setCases((current) => current.map((item) => item.id === id ? {
        ...item,
        status: result.status,
        statusTone: result.status === "resolved" || result.status === "closed" ? "success" : "info",
        reference: patch.reference || item.reference,
        events: [...item.events, {
          date: new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short" }).format(new Date(result.event.createdAt)),
          label: result.event.label,
          detail: result.event.detail || undefined,
        }],
      } : item));
    },
  }), [cases, selectedLocation, ownerToken]);

  return <CivicStoreContext.Provider value={value}>{children}</CivicStoreContext.Provider>;
}

export function useCivic() {
  const value = useContext(CivicStoreContext);
  if (!value) throw new Error("useCivic must be used inside CivicProvider");
  return value;
}
