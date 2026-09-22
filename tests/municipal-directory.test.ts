import { describe, expect, it } from "vitest";

import { fallbackMunicipalities, MDB_SOURCE_LABEL, MDB_WARDS_2026_SOURCE } from "../lib/municipal-directory";

describe("municipal directory", () => {
  it("uses the official MDB 2026 service as its source contract", () => {
    expect(MDB_SOURCE_LABEL).toContain("Municipal Demarcation Board");
    expect(MDB_WARDS_2026_SOURCE).toContain("MDB_Wards_2026/FeatureServer/0");
  });

  it("keeps a usable launch fallback for offline startup", () => {
    expect(fallbackMunicipalities).toHaveLength(1);
    expect(fallbackMunicipalities[0]).toMatchObject({ name: "City of Tshwane", province: "Gauteng" });
  });
});
