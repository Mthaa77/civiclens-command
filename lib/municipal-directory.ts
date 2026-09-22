import AsyncStorage from "@react-native-async-storage/async-storage";

export const MDB_WARDS_2026_SOURCE = "https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDB_Wards_2026/FeatureServer/0";
export const MDB_SOURCE_LABEL = "Municipal Demarcation Board · MDB Wards 2026";
export const MDB_SOURCE_DATE = "Published dataset: 2026";

const MUNICIPALITIES_CACHE_KEY = "civiclens.mdb.municipalities.2026";
const WARDS_CACHE_PREFIX = "civiclens.mdb.wards.2026.";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

type ArcGisFeature<T> = { attributes: T };
type ArcGisResponse<T> = { features?: ArcGisFeature<T>[]; error?: { message?: string } };

type MunicipalityAttributes = {
  Province: string;
  Municipali: string;
  CAT_B: string;
  MUNICNAME: string;
  DISTRICT: string;
  DISTRICTCO: string;
};

type WardAttributes = MunicipalityAttributes & {
  WardID: string;
  WardLink: string;
  WardNo: number;
};

export type Municipality = {
  code: string;
  name: string;
  officialName: string;
  province: string;
  district: string;
  districtCode: string;
};

export type Ward = {
  id: string;
  link: string;
  number: number;
  municipalityCode: string;
  municipalityName: string;
  province: string;
  district: string;
};

export type DirectorySelection = Municipality & {
  wardId?: string;
  wardNumber?: number;
};

export const fallbackMunicipalities: Municipality[] = [
  {
    code: "TSH",
    name: "City of Tshwane",
    officialName: "City of Tshwane Metropolitan Municipality",
    province: "Gauteng",
    district: "City of Tshwane",
    districtCode: "TSH",
  },
];

async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const stored = JSON.parse(raw) as { savedAt: number; value: T };
      if (Date.now() - stored.savedAt < CACHE_TTL_MS) return stored.value;
    }
  } catch {
    // A malformed cache should never block the live directory request.
  }

  const value = await loader();
  await AsyncStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), value }));
  return value;
}

async function query<T>(params: Record<string, string>): Promise<T[]> {
  const url = `${MDB_WARDS_2026_SOURCE}/query?${new URLSearchParams({
    f: "json",
    returnGeometry: "false",
    ...params,
  }).toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`MDB request failed (${response.status})`);
  const body = (await response.json()) as ArcGisResponse<T>;
  if (body.error) throw new Error(body.error.message ?? "MDB request failed");
  return (body.features ?? []).map((feature) => feature.attributes);
}

function normalizeMunicipality(attributes: MunicipalityAttributes): Municipality {
  return {
    code: attributes.CAT_B,
    name: attributes.MUNICNAME,
    officialName: attributes.Municipali,
    province: attributes.Province,
    district: attributes.DISTRICT,
    districtCode: attributes.DISTRICTCO,
  };
}

export async function fetchMunicipalities(): Promise<Municipality[]> {
  try {
    return await cached(MUNICIPALITIES_CACHE_KEY, async () => {
      const records = await query<MunicipalityAttributes>({
        where: "1=1",
        outFields: "Province,Municipali,CAT_B,MUNICNAME,DISTRICT,DISTRICTCO",
        returnDistinctValues: "true",
        orderByFields: "MUNICNAME ASC",
      });
      return records.map(normalizeMunicipality);
    });
  } catch (error) {
    const raw = await AsyncStorage.getItem(MUNICIPALITIES_CACHE_KEY);
    if (raw) {
      try {
        return (JSON.parse(raw) as { value: Municipality[] }).value;
      } catch {
        // Use the launch municipality below.
      }
    }
    if (error) console.warn("[MDB] Using fallback municipalities", error);
    return fallbackMunicipalities;
  }
}

export async function fetchWards(municipalityCode: string): Promise<Ward[]> {
  const cacheKey = `${WARDS_CACHE_PREFIX}${municipalityCode}`;
  try {
    return await cached(cacheKey, async () => {
      const records = await query<WardAttributes>({
        where: `CAT_B='${municipalityCode.replaceAll("'", "''")}'`,
        outFields: "Province,Municipali,CAT_B,MUNICNAME,DISTRICT,DISTRICTCO,WardID,WardLink,WardNo",
        orderByFields: "WardNo ASC",
      });
      return records.map((record) => ({
        id: record.WardID,
        link: record.WardLink,
        number: Number(record.WardNo),
        municipalityCode: record.CAT_B,
        municipalityName: record.MUNICNAME,
        province: record.Province,
        district: record.DISTRICT,
      }));
    });
  } catch (error) {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (raw) {
      try {
        return (JSON.parse(raw) as { value: Ward[] }).value;
      } catch {
        // Return an empty list so the picker can explain the offline state.
      }
    }
    if (error) console.warn(`[MDB] Could not load wards for ${municipalityCode}`, error);
    return [];
  }
}
