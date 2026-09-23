import { describe, expect, it } from "vitest";

import { buildServicePulses, connectedInsights, serviceDefinitions } from "../lib/service-intelligence";

describe("service intelligence", () => {
  it("normalizes the four requested service domains with provenance", () => {
    const feeds = buildServicePulses("2026-09-22T16:00:00.000Z", true);
    expect(feeds.map((feed) => feed.id)).toEqual(["water", "electricity", "roads", "refuse"]);
    expect(feeds.every((feed) => feed.coverage === "official-notice")).toBe(true);
    expect(feeds.every((feed) => feed.checkedAt === "2026-09-22T16:00:00.000Z")).toBe(true);
  });

  it("does not overstate service truth when the official source is unreachable", () => {
    const feeds = buildServicePulses("2026-09-22T16:00:00.000Z", false);
    expect(feeds.every((feed) => feed.state === "unknown")).toBe(true);
    expect(feeds.every((feed) => feed.detail.includes("could not reach"))).toBe(true);
  });

  it("keeps the insight catalog tied to real connected datasets", () => {
    expect(serviceDefinitions).toHaveLength(4);
    expect(connectedInsights.length).toBeGreaterThanOrEqual(4);
    expect(connectedInsights.every((insight) => insight.datasets.length >= 2)).toBe(true);
  });
});
