import type { IconName } from "@/lib/civic-data";

export type ServiceDomain = "water" | "electricity" | "roads" | "refuse";
export type ServiceState = "monitoring" | "alert" | "stable" | "unknown";

export type ServicePulse = {
  id: ServiceDomain;
  label: string;
  icon: IconName;
  accent: string;
  state: ServiceState;
  headline: string;
  detail: string;
  sourceLabel: string;
  sourceUrl: string;
  checkedAt: string;
  coverage: "live-source" | "official-notice" | "planned";
};

export type ConnectedInsight = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  action: string;
  icon: IconName;
  accent: string;
  datasets: string[];
};

export const SERVICE_SOURCE_URL = "https://www.tshwane.gov.za/";
export const TREASURY_API_URL = "https://municipaldata.treasury.gov.za/api";
export const MDB_API_URL = "https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDB_Wards_2026/FeatureServer/0";

export const serviceDefinitions: Array<Pick<ServicePulse, "id" | "label" | "icon" | "accent">> = [
  { id: "water", label: "Water", icon: "water-drop", accent: "#2D9CDB" },
  { id: "electricity", label: "Electricity", icon: "bolt", accent: "#F1B84B" },
  { id: "roads", label: "Roads", icon: "directions-car", accent: "#EF8354" },
  { id: "refuse", label: "Refuse", icon: "delete-outline", accent: "#27AE60" },
];

export function buildServicePulses(checkedAt = new Date().toISOString(), sourceReachable = true): ServicePulse[] {
  return serviceDefinitions.map((service) => ({
    ...service,
    state: sourceReachable ? "monitoring" : "unknown",
    headline: sourceReachable ? "Official notice feed monitored" : "Source temporarily unavailable",
    detail: sourceReachable
      ? "No structured ward-level incident was confirmed by the connected public source. Check the official notice before relying on this signal."
      : "CivicLens could not reach the official municipal source during the last check.",
    sourceLabel: "City of Tshwane official service notices",
    sourceUrl: SERVICE_SOURCE_URL,
    checkedAt,
    coverage: "official-notice",
  }));
}

export const connectedInsights: ConnectedInsight[] = [
  { id: "triage", eyebrow: "Cross-source triage", title: "Turn a service complaint into a routed case", detail: "Combine ward boundaries, the selected service domain, municipal contacts, and an official notice to suggest the right office and next documented step.", action: "Route a new report", icon: "alt-route", accent: "#1F5EFF", datasets: ["MDB wards", "Municipal contacts", "Service notices"] },
  { id: "reliability", eyebrow: "Reliability signal", title: "See where a service is repeatedly fragile", detail: "Overlay recurring community reports with official interruption notices and repair-spend trends. The result is a pattern to investigate, not a fabricated score.", action: "Explore patterns", icon: "insights", accent: "#7B61FF", datasets: ["Private cases", "Official notices", "Treasury repairs & maintenance"] },
  { id: "money-to-outcome", eyebrow: "Money to outcome", title: "Follow budget promises into lived experience", detail: "Compare municipal maintenance, capital and grant data with ward-level reports to make the gap between planned spend and resident experience legible.", action: "View the evidence chain", icon: "account-balance-wallet", accent: "#A96D00", datasets: ["Treasury finance", "SDBIP / IDP", "Civic reports"] },
  { id: "equity", eyebrow: "Equity lens", title: "Find service gaps that hide in averages", detail: "Use Stats SA access indicators, ward geography and service reports to surface where city-wide averages may mask neighbourhood-level inequality.", action: "Compare access", icon: "groups", accent: "#27AE60", datasets: ["Stats SA", "MDB wards", "Service reports"] },
];

export const insightRoadmap = [
  { phase: "Now", title: "Source-aware service pulse", detail: "Monitor official municipal pages and show freshness, provenance, coverage and uncertainty in every service card." },
  { phase: "Next", title: "Unified incident graph", detail: "Normalize notices, resident reports, ward boundaries and contact routes into one event model with deduplication and escalation history." },
  { phase: "Then", title: "Civic early-warning system", detail: "Detect recurring clusters, unusual report volume and long unresolved timelines, then notify residents without overstating causality." },
  { phase: "Beyond", title: "Accountability intelligence", detail: "Connect plans, budgets, procurement, maintenance, outcomes and participation to create evidence chains residents and oversight bodies can inspect." },
];

export function serviceStateLabel(state: ServiceState) {
  if (state === "alert") return "Active alert";
  if (state === "stable") return "Stable signal";
  if (state === "monitoring") return "Monitoring official feed";
  return "Needs source check";
}
