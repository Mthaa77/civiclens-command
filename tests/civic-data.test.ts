import { describe, expect, it } from "vitest";

import { categoryById, communityIssues, governmentContacts, initialCases, issueCategories, locationProfile, sources } from "../lib/civic-data";

describe("CivicLens civic data", () => {
  it("includes the core launch issue taxonomy", () => {
    expect(issueCategories.map((item) => item.id)).toEqual(expect.arrayContaining(["streetlight", "water", "pothole", "electricity", "sewage", "refuse"]));
    expect(issueCategories.length).toBeGreaterThanOrEqual(8);
  });

  it("routes an issue to a readable category", () => {
    expect(categoryById("streetlight").label).toBe("Streetlight");
    expect(categoryById("unknown").id).toBe("streetlight");
  });

  it("keeps the launch geography and source trust cues explicit", () => {
    expect(locationProfile.province).toBe("Gauteng");
    expect(locationProfile.municipality).toBe("City of Tshwane");
    expect(sources.some((source) => source.authority === "Official")).toBe(true);
    expect(sources.some((source) => source.authority === "CivicLens")).toBe(true);
  });

  it("keeps sample civic records privacy-safe and distinguishable", () => {
    expect(initialCases[0].visibility).toBe("Private");
    expect(communityIssues.some((issue) => issue.status === "Reported by community")).toBe(true);
    expect(governmentContacts.some((contact) => contact.value === "17737")).toBe(true);
  });
});
