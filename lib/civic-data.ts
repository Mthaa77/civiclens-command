import type { ComponentProps } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export type IconName = ComponentProps<typeof MaterialIcons>["name"];

export type IssueCategory = {
  id: string;
  label: string;
  icon: IconName;
  hint: string;
  accent: string;
};

export const issueCategories: IssueCategory[] = [
  { id: "streetlight", label: "Streetlight", icon: "lightbulb-outline", hint: "A streetlight is out or damaged", accent: "#F1B84B" },
  { id: "water", label: "Water outage", icon: "water-drop", hint: "No water or a burst pipe", accent: "#2D9CDB" },
  { id: "pothole", label: "Pothole / road", icon: "directions-car", hint: "Road damage or a sinkhole", accent: "#EF8354" },
  { id: "electricity", label: "Electricity", icon: "bolt", hint: "A local power issue", accent: "#F1B84B" },
  { id: "sewage", label: "Sewage", icon: "waves", hint: "Wastewater or sewer spill", accent: "#7B61FF" },
  { id: "refuse", label: "Refuse", icon: "delete-outline", hint: "Missed collection or dumping", accent: "#27AE60" },
  { id: "traffic", label: "Traffic light", icon: "traffic", hint: "Signal or intersection issue", accent: "#EB5757" },
  { id: "facility", label: "Public facility", icon: "account-balance", hint: "School, clinic or public building", accent: "#4F8CFF" },
  { id: "flooding", label: "Flooding", icon: "umbrella", hint: "Stormwater or a flooded road", accent: "#2D9CDB" },
  { id: "billing", label: "Municipal account", icon: "receipt-long", hint: "Billing or account support", accent: "#8E8E93" },
];

export type CivicCase = {
  id: string;
  issueType: string;
  title: string;
  municipality: string;
  ward: string;
  status: string;
  statusTone: "warning" | "success" | "info" | "muted";
  createdAt: string;
  reference: string;
  evidenceCount: number;
  location: string;
  visibility: "Private" | "Community-visible";
  events: { date: string; label: string; detail?: string }[];
};

export const initialCases: CivicCase[] = [
  {
    id: "CL-10428",
    issueType: "streetlight",
    title: "Streetlight out near Dr. Moroka Drive",
    municipality: "City of Tshwane",
    ward: "Ward not resolved",
    status: "Follow-up due",
    statusTone: "warning",
    createdAt: "22 Sep 2026",
    reference: "TSH-2026-0917",
    evidenceCount: 2,
    location: "Soshanguve · private location",
    visibility: "Private",
    events: [
      { date: "22 Sep", label: "Problem documented", detail: "Photo and nearby landmark saved" },
      { date: "22 Sep", label: "Municipal report submitted", detail: "City of Tshwane official channel" },
      { date: "22 Sep", label: "Reference number added", detail: "TSH-2026-0917" },
      { date: "26 Sep", label: "Follow-up reminder", detail: "Set by the user; not a legal deadline" },
    ],
  },
];

export const communityIssues = [
  { id: "issue-1", title: "Streetlight cluster", area: "Mabopane · block-level view", count: "9 community reports", status: "Reported by community", tone: "warning" as const },
  { id: "issue-2", title: "Road rehabilitation project", area: "Soshanguve · project area", count: "Official project record", status: "Planned", tone: "info" as const },
  { id: "issue-3", title: "Refuse collection notice", area: "Akasia · municipal notice", count: "Source-backed notice", status: "In progress", tone: "success" as const },
];

export const notices = [
  { id: "notice-1", type: "Public participation", title: "Draft IDP and budget consultation", detail: "City of Tshwane · Gauteng", deadline: "Comment deadline: 14 Oct 2026", icon: "campaign" as IconName },
  { id: "notice-2", type: "Ward meeting", title: "Community feedback session", detail: "Soshanguve · venue to be confirmed", deadline: "Meeting date: 30 Sep 2026", icon: "event" as IconName },
  { id: "notice-3", type: "Service notice", title: "Water supply maintenance update", detail: "Tshwane water services", deadline: "Published: 22 Sep 2026", icon: "info-outline" as IconName },
];

export const lessons = [
  { id: "lesson-1", title: "What does a municipality do?", length: "60 seconds", summary: "Local government is usually the first stop for everyday services such as water, refuse, roads, parks and street lighting.", icon: "account-balance" as IconName, category: "Government basics" },
  { id: "lesson-2", title: "What is a ward councillor?", length: "75 seconds", summary: "A councillor represents residents and can help follow up on municipal issues, but does not personally carry out repairs.", icon: "groups" as IconName, category: "Government basics" },
  { id: "lesson-3", title: "Why keep a reference number?", length: "45 seconds", summary: "A reference number turns a conversation into a traceable record you can use when following up or escalating.", icon: "confirmation-number" as IconName, category: "Rights & accountability" },
  { id: "lesson-4", title: "PAIA in plain language", length: "90 seconds", summary: "The Promotion of Access to Information Act can help you request records from public bodies when the normal information route is not enough.", icon: "description" as IconName, category: "Rights & accountability" },
];

export const governmentContacts = [
  { label: "City of Tshwane call centre", value: "012 358 9999", helper: "General municipal service reports", icon: "phone" as IconName },
  { label: "Toll-free service line", value: "080 111 1556", helper: "Municipal customer care", icon: "phone-in-talk" as IconName },
  { label: "Presidential Hotline", value: "17737", helper: "A last-resort national escalation route", icon: "priority-high" as IconName },
];

export const sources = [
  { title: "City of Tshwane · service contact guidance", publisher: "Official municipal source", checked: "Last checked 22 Sep 2026", authority: "Official" },
  { title: "South African Government · local government framework", publisher: "Official government source", checked: "Last checked 22 Sep 2026", authority: "Official" },
  { title: "CivicLens playbook · streetlight faults", publisher: "CivicLens interpretation", checked: "Reviewed 22 Sep 2026", authority: "CivicLens" },
];

export const financeTopics = [
  { label: "Income", icon: "trending-up" as IconName },
  { label: "Service spend", icon: "account-balance-wallet" as IconName },
  { label: "Repairs & maintenance", icon: "build" as IconName },
];

export const locationProfile = {
  suburb: "Soshanguve",
  province: "Gauteng",
  municipality: "City of Tshwane",
  municipalityType: "Metropolitan municipality",
  ward: "Ward resolution available after you confirm a location",
};

export function categoryById(id?: string) {
  return issueCategories.find((category) => category.id === id) ?? issueCategories[0];
}

export function todayLabel() {
  return new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
}
