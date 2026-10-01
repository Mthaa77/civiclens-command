const TREASURY_API_URL = "https://municipaldata.treasury.gov.za/api/cubes/municipalities/members/municipality";
const MDB_API_URL = "https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDB_Wards_2026/FeatureServer/0";
const SERVICE_SOURCE_URL = "https://www.tshwane.gov.za/";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

async function probe(url: string) {
  try {
    const response = await fetch(url, { method: "GET", signal: AbortSignal.timeout(7000) });
    return { status: response.ok ? "connected" : "degraded", httpStatus: response.status };
  } catch {
    return { status: "offline", httpStatus: null };
  }
}

async function civicStatus() {
  const sources = [
    { id: "treasury", label: "National Treasury Municipalities API", url: TREASURY_API_URL },
    { id: "mdb", label: "Municipal Demarcation Board · MDB Wards 2026", url: MDB_API_URL },
  ];
  const checks = await Promise.all(sources.map(async (source) => ({ ...source, ...(await probe(source.url)) })));
  return {
    status: checks.every((source) => source.status === "connected") ? "connected" : "degraded",
    checkedAt: new Date().toISOString(),
    sources: checks,
  };
}

async function servicePulse() {
  const checkedAt = new Date().toISOString();
  const [tshwane, treasury, mdb] = await Promise.all([
    probe(SERVICE_SOURCE_URL),
    probe(TREASURY_API_URL),
    probe(MDB_API_URL),
  ]);
  const sourceChecks = [
    { id: "municipal-notices", label: "City of Tshwane service notices", url: SERVICE_SOURCE_URL, connected: tshwane.status === "connected" },
    { id: "treasury", label: "National Treasury Municipal Money", url: TREASURY_API_URL, connected: treasury.status === "connected" },
    { id: "mdb", label: "MDB Wards 2026", url: MDB_API_URL, connected: mdb.status === "connected" },
  ];
  return {
    checkedAt,
    sourceReachable: tshwane.status === "connected",
    feeds: ["water", "electricity", "roads", "refuse"].map((id) => ({
      id,
      label: id[0].toUpperCase() + id.slice(1),
      status: tshwane.status === "connected" ? "monitoring" : "source_attention",
      confidence: tshwane.status === "connected" ? "source_connected" : "source_unavailable",
    })),
    sourceChecks,
  };
}

const connectedInsights = [
  { id: "triage", title: "Cross-source triage", description: "Compare municipal notices with Treasury and ward-boundary sources before treating a service signal as confirmed." },
  { id: "reliability", title: "Reliability signal", description: "Separate official-source availability from a claim that a local service is actually failing." },
  { id: "money", title: "Money-to-outcome", description: "Connect municipal finance information to practical service questions without inventing causality." },
  { id: "equity", title: "Equity lens", description: "Surface where service information and access to official channels may differ across communities." },
];

async function listReports(db: D1Database) {
  const result = await db.prepare(
    "SELECT id, service, municipality, ward, title, description, status, created_at FROM civic_reports ORDER BY created_at DESC LIMIT 50"
  ).all();
  return result.results;
}

async function createReport(request: Request, db: D1Database) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, { status: 400 }); }

  const service = typeof body.service === "string" ? body.service.trim().slice(0, 40) : "";
  const municipality = typeof body.municipality === "string" ? body.municipality.trim().slice(0, 120) : "";
  const ward = typeof body.ward === "string" ? body.ward.trim().slice(0, 40) : "";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 2000) : "";

  if (!service || !municipality || !title || !description) {
    return json({ error: "service, municipality, title and description are required" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.prepare(
    "INSERT INTO civic_reports (id, service, municipality, ward, title, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, service, municipality, ward || null, title, description, "submitted", createdAt).run();

  return json({ id, status: "submitted", createdAt }, { status: 201 });
}

async function tRPC(path: string, db: D1Database) {
  switch (path) {
    case "civic.status": return civicStatus();
    case "civic.servicePulse": return servicePulse();
    case "civic.insights": return { generatedAt: new Date().toISOString(), insights: connectedInsights };
    case "auth.me": return null;
    default: return undefined;
  }
}

async function handleTRPC(request: Request, db: D1Database) {
  const url = new URL(request.url);
  const paths = url.pathname.replace(/^\/api\/trpc\/?/, "").split(",").filter(Boolean);
  const isBatch = url.searchParams.get("batch") === "1" || paths.length > 1;
  if (!paths.length) return json({ error: "Missing tRPC procedure path" }, { status: 400 });
  const values = await Promise.all(paths.map((path) => tRPC(path, db)));
  if (values.some((value) => value === undefined)) return json({ error: "Unknown tRPC procedure" }, { status: 404 });
  if (isBatch) {
    const result: Record<string, unknown> = {};
    paths.forEach((path, index) => { result[String(index)] = { result: { data: { json: values[index] } } }; });
    return json(result);
  }
  return json({ result: { data: { json: values[0] } } });
}

export default {
  async fetch(request: Request, env: { DB: D1Database; ASSETS?: { fetch(request: Request): Promise<Response> } }) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({ ok: true, service: "civiclens-api", runtime: "cloudflare-workers", database: "d1", timestamp: Date.now() });
    }
    if (url.pathname.startsWith("/api/trpc/")) return handleTRPC(request, env.DB);
    if (url.pathname === "/api/civic/status") return json(await civicStatus());
    if (url.pathname === "/api/civic/service-pulse") return json(await servicePulse());
    if (url.pathname === "/api/civic/insights") return json({ generatedAt: new Date().toISOString(), insights: connectedInsights });
    if (url.pathname === "/api/civic/reports" && request.method === "GET") return json({ reports: await listReports(env.DB) });
    if (url.pathname === "/api/civic/reports" && request.method === "POST") return createReport(request, env.DB);
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return json({ error: "Not found" }, { status: 404 });
  },
};
