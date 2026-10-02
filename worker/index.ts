const TREASURY_API_URL = "https://municipaldata.treasury.gov.za/api/cubes/municipalities/members/municipality";
const MDB_API_URL = "https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDB_Wards_2026/FeatureServer/0";
const SERVICE_SOURCE_URL = "https://www.tshwane.gov.za/";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PATCH",
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

const CASE_STATUSES = [
  "draft",
  "submitted",
  "validated",
  "routed",
  "acknowledged",
  "in_progress",
  "awaiting_authority",
  "awaiting_user",
  "resolved",
  "closed",
] as const;

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function addCaseEvent(db: D1Database, reportId: string, eventType: string, label: string, detail: string | null, actor = "civiclens", createdAt = new Date().toISOString()) {
  const id = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO civic_report_events (id, report_id, event_type, label, detail, actor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, reportId, eventType, label, detail, actor, createdAt).run();
  return { id, eventType, label, detail, actor, createdAt };
}

async function listReports(db: D1Database, ownerToken: string) {
  const result = await db.prepare(
    "SELECT id, service, municipality, ward, title, description, status, created_at FROM civic_reports WHERE owner_token = ? ORDER BY created_at DESC LIMIT 50"
  ).bind(ownerToken).all();

  const reports = [];
  for (const report of result.results as Array<Record<string, unknown>>) {
    const events = await db.prepare(
      "SELECT id, event_type, label, detail, actor, created_at FROM civic_report_events WHERE report_id = ? ORDER BY created_at ASC"
    ).bind(report.id).all();
    reports.push({ ...report, events: events.results });
  }
  return reports;
}

async function createReport(request: Request, db: D1Database) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, { status: 400 }); }

  const service = typeof body.service === "string" ? body.service.trim().slice(0, 40) : "";
  const municipality = typeof body.municipality === "string" ? body.municipality.trim().slice(0, 120) : "";
  const ward = typeof body.ward === "string" ? body.ward.trim().slice(0, 40) : "";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 2000) : "";
  const ownerToken = typeof body.ownerToken === "string" ? body.ownerToken.trim().slice(0, 128) : "";

  if (!service || !municipality || !title || !description || !ownerToken) {
    return json({ error: "service, municipality, title, description and ownerToken are required" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.prepare(
    "INSERT INTO civic_reports (id, service, municipality, ward, title, description, status, created_at, owner_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, service, municipality, ward || null, title, description, "submitted", createdAt, ownerToken).run();
  const event = await addCaseEvent(db, id, "submitted", "CivicLens received your report", "The case was saved privately in CivicLens Cloud.", "civiclens", createdAt);

  return json({ id, status: "submitted", createdAt, events: [event] }, { status: 201 });
}

async function updateReport(request: Request, db: D1Database, reportId: string) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, { status: 400 }); }

  const ownerToken = typeof body.ownerToken === "string" ? body.ownerToken.trim().slice(0, 128) : "";
  const status = typeof body.status === "string" ? body.status.trim() : "";
  const detail = typeof body.detail === "string" ? body.detail.trim().slice(0, 1000) : "";
  const reference = typeof body.reference === "string" ? body.reference.trim().slice(0, 120) : "";

  if (!ownerToken || !status || !CASE_STATUSES.includes(status as typeof CASE_STATUSES[number])) {
    return json({ error: "ownerToken and a valid case status are required" }, { status: 400 });
  }

  const existing = await db.prepare(
    "SELECT id, status FROM civic_reports WHERE id = ? AND owner_token = ? LIMIT 1"
  ).bind(reportId, ownerToken).first<{ id: string; status: string }>();
  if (!existing) return json({ error: "Case not found" }, { status: 404 });

  const now = new Date().toISOString();
  await db.prepare("UPDATE civic_reports SET status = ? WHERE id = ? AND owner_token = ?").bind(status, reportId, ownerToken).run();

  if (reference) {
    await addCaseEvent(db, reportId, "government_reference", "Government reference number added", reference, "user", now);
  }

  const label = status === "resolved"
    ? "Case marked resolved by you"
    : status === "closed"
      ? "Case closed"
      : \`Case status updated to \${statusLabel(status)}\`;
  const event = await addCaseEvent(db, reportId, status, label, detail || null, "user", now);

  return json({ id: reportId, previousStatus: existing.status, status, updatedAt: now, event });
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
    if (url.pathname === "/api/civic/reports" && request.method === "GET") {
      const ownerToken = url.searchParams.get("ownerToken")?.trim().slice(0, 128) || "";
      if (!ownerToken) return json({ error: "ownerToken is required" }, { status: 400 });
      return json({ reports: await listReports(env.DB, ownerToken) });
    }
    if (url.pathname === "/api/civic/reports" && request.method === "POST") return createReport(request, env.DB);
    const reportMatch = url.pathname.match(/^\/api\/civic\/reports\/([^/]+)$/);
    if (reportMatch && request.method === "PATCH") return updateReport(request, env.DB, reportMatch[1]);
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return json({ error: "Not found" }, { status: 404 });
  },
};
