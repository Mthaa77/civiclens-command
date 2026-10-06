export type CivicCheckRun = {
  id: string;
  trigger: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  services_checked: number;
  services_ok: number;
  services_degraded: number;
  error_count: number;
};

export type CivicCheckResult = {
  service: string;
  source_reachable: number;
  notice_count: number;
  planned_summary: string | null;
  checked_at: string;
};

export type CivicCheckChange = {
  service: string;
  type: string;
  label: string;
  detail: string;
};

export type CivicCheckLatest = {
  run: CivicCheckRun | null;
  previousRun?: CivicCheckRun | null;
  results: CivicCheckResult[];
  changes: CivicCheckChange[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://civiclens-command.tshepisokadiaka83.workers.dev";

export async function fetchLatestCivicCheck(): Promise<CivicCheckLatest | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/civic/check/latest`);
    if (!response.ok) return undefined;
    return (await response.json()) as CivicCheckLatest;
  } catch {
    return undefined;
  }
}

export async function fetchCivicCheckHistory(): Promise<{ runs: CivicCheckRun[] } | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/civic/check/history`);
    if (!response.ok) return undefined;
    return (await response.json()) as { runs: CivicCheckRun[] };
  } catch {
    return undefined;
  }
}
