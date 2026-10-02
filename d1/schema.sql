CREATE TABLE IF NOT EXISTS civic_reports (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  municipality TEXT NOT NULL,
  ward TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TEXT NOT NULL,
  owner_token TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS civic_reports_created_at_idx ON civic_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS civic_reports_owner_token_idx ON civic_reports(owner_token, created_at DESC);

CREATE TABLE IF NOT EXISTS civic_report_events (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  label TEXT NOT NULL,
  detail TEXT,
  actor TEXT NOT NULL DEFAULT 'civiclens',
  created_at TEXT NOT NULL,
  FOREIGN KEY (report_id) REFERENCES civic_reports(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS civic_report_events_report_idx ON civic_report_events(report_id, created_at ASC);
