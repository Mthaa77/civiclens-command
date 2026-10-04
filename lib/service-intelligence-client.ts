export type ServiceNotice = {
  title: string;
  source: string;
  authority: string;
  status: string;
};

export type ServiceIntelligence = {
  sourceReachable: boolean;
  checkedAt: string;
  service: string;
  notices: ServiceNotice[];
  planned: string;
  sources: { label: string; url: string; authority: string }[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://civiclens-command.tshepisokadiaka83.workers.dev";

export async function fetchServiceIntelligence(service: string): Promise<ServiceIntelligence | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/civic/service-intelligence?service=${encodeURIComponent(service)}`);
    if (!response.ok) return undefined;
    return (await response.json()) as ServiceIntelligence;
  } catch {
    return undefined;
  }
}

export type KnownProblem = ServiceNotice & { confidence: string; scope: string };

export type KnownProblemIntelligence = ServiceIntelligence & {
  knownProblems: KnownProblem[];
  hasPotentialKnownProblem: boolean;
};

export async function fetchKnownProblems(service: string): Promise<KnownProblemIntelligence | undefined> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/civic/known-problems?service=${encodeURIComponent(service)}`,
    );
    if (!response.ok) return undefined;
    return (await response.json()) as KnownProblemIntelligence;
  } catch {
    return undefined;
  }
}
