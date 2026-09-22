import { afterEach, describe, expect, it, vi } from "vitest";

import { GOVERNMENT_DIRECTORY_URL, TREASURY_MUNICIPALITIES_ENDPOINT, resolveGpsToWard } from "../lib/official-directory";

afterEach(() => vi.unstubAllGlobals());

describe("official directory and GPS resolution", () => {
  it("uses public official contact endpoints", () => {
    expect(TREASURY_MUNICIPALITIES_ENDPOINT).toContain("municipaldata.treasury.gov.za/api/cubes/municipalities");
    expect(GOVERNMENT_DIRECTORY_URL).toContain("gov.za/about-government/contact-directory");
  });

  it("normalizes an MDB point-in-ward response into a civic selection", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [{ attributes: {
        Province: "Gauteng",
        Municipali: "City of Tshwane Metropolitan Municipality (TSH)",
        CAT_B: "TSH",
        MUNICNAME: "City of Tshwane",
        DISTRICT: "City of Tshwane",
        DISTRICTCO: "TSH",
        WardID: "79900001",
        WardLink: "TSH_1",
        WardNo: 1,
      } }] }),
    }));

    const result = await resolveGpsToWard(-25.7, 28.2);
    expect(result?.municipality).toMatchObject({ code: "TSH", name: "City of Tshwane", wardNumber: 1 });
    expect(result?.ward.id).toBe("79900001");
  });
});
