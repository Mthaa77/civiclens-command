import AsyncStorage from "@react-native-async-storage/async-storage";

import type { DirectorySelection, Ward } from "./municipal-directory";
import { fetchWards, MDB_WARDS_2026_SOURCE } from "./municipal-directory";

export const TREASURY_MUNICIPALITIES_ENDPOINT = "https://municipaldata.treasury.gov.za/api/cubes/municipalities/members/municipality";
export const TREASURY_SOURCE_LABEL = "National Treasury · Municipalities API";
export const TREASURY_SOURCE_UPDATED = "National Treasury data · updated 2026-09-02";
export const GOVERNMENT_DIRECTORY_URL = "https://www.gov.za/about-government/contact-directory/provincial-local-government";

const CONTACTS_CACHE_KEY = "civiclens.treasury.municipality-contacts.v1";
const CONTACT_CACHE_TTL = 1000 * 60 * 60 * 24;

type TreasuryRecord = Record<string, string | number | null>;
type TreasuryResponse = { data?: TreasuryRecord[]; status?: string; message?: string };

export type OfficialMunicipalContact = {
  code: string;
  name: string;
  longName: string;
  province: string;
  provinceCode: string;
  category: string;
  phone?: string;
  fax?: string;
  website?: string;
  postalAddress: string[];
  streetAddress: string[];
  sourceUrl: string;
  governmentDirectoryUrl: string;
};

function text(record: TreasuryRecord, key: string) {
  const value = record[`municipality.${key}`];
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized && normalized !== "-" ? normalized : undefined;
}

function normalizeWebsite(value?: string) {
  if (!value) return undefined;
  const candidate = value.startsWith("http") ? value : `https://${value}`;
  return candidate.replace(/\s+/g, "");
}

function normalize(record: TreasuryRecord): OfficialMunicipalContact {
  const code = text(record, "demarcation_code") ?? "";
  const name = text(record, "name") ?? code;
  const provinceCode = text(record, "province_code") ?? "";
  const province = text(record, "province_name") ?? "South Africa";
  const postalAddress = [1, 2, 3].map((part) => text(record, `postal_address_${part}`)).filter(Boolean) as string[];
  const streetAddress = [1, 2, 3, 4].map((part) => text(record, `street_address_${part}`)).filter(Boolean) as string[];
  return {
    code,
    name,
    longName: text(record, "long_name") ?? name,
    province,
    provinceCode,
    category: text(record, "category") ?? "Local municipality",
    phone: text(record, "phone_number"),
    fax: text(record, "fax_number"),
    website: normalizeWebsite(text(record, "url")),
    postalAddress,
    streetAddress,
    sourceUrl: TREASURY_MUNICIPALITIES_ENDPOINT,
    governmentDirectoryUrl: GOVERNMENT_DIRECTORY_URL,
  };
}

async function cached<T>(key: string, loader: () => Promise<T>) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const saved = JSON.parse(raw) as { savedAt: number; value: T };
      if (Date.now() - saved.savedAt < CONTACT_CACHE_TTL) return saved.value;
    }
  } catch {
    // Ignore malformed local cache and refresh from the source.
  }
  const value = await loader();
  await AsyncStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), value }));
  return value;
}

export async function fetchOfficialMunicipalContacts(): Promise<OfficialMunicipalContact[]> {
  try {
    return await cached(CONTACTS_CACHE_KEY, async () => {
      const response = await fetch(TREASURY_MUNICIPALITIES_ENDPOINT);
      if (!response.ok) throw new Error(`Treasury request failed (${response.status})`);
      const body = (await response.json()) as TreasuryResponse;
      if (!body.data) throw new Error(body.message ?? "Treasury data was unavailable");
      return body.data.map(normalize).filter((item) => item.code && item.name);
    });
  } catch (error) {
    const raw = await AsyncStorage.getItem(CONTACTS_CACHE_KEY);
    if (raw) {
      try {
        return (JSON.parse(raw) as { value: OfficialMunicipalContact[] }).value;
      } catch {
        // Fall through to an empty state.
      }
    }
    console.warn("[Treasury] Official contacts unavailable", error);
    return [];
  }
}

export async function fetchOfficialMunicipalContact(code: string) {
  const contacts = await fetchOfficialMunicipalContacts();
  return contacts.find((item) => item.code === code);
}

export type GpsDetection = {
  municipality: DirectorySelection;
  ward: Ward;
  latitude: number;
  longitude: number;
  source: string;
};

export async function resolveGpsToWard(latitude: number, longitude: number): Promise<GpsDetection | null> {
  const params = new URLSearchParams({
    f: "json",
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "Province,Municipali,CAT_B,MUNICNAME,DISTRICT,DISTRICTCO,WardID,WardLink,WardNo",
    returnGeometry: "false",
  });
  const response = await fetch(`${MDB_WARDS_2026_SOURCE}/query?${params.toString()}`);
  if (!response.ok) throw new Error(`MDB location request failed (${response.status})`);
  const body = (await response.json()) as { features?: Array<{ attributes: Record<string, string | number> }>; error?: { message?: string } };
  if (body.error) throw new Error(body.error.message ?? "MDB location request failed");
  const attributes = body.features?.[0]?.attributes;
  if (!attributes) return null;
  const ward: Ward = {
    id: String(attributes.WardID),
    link: String(attributes.WardLink),
    number: Number(attributes.WardNo),
    municipalityCode: String(attributes.CAT_B),
    municipalityName: String(attributes.MUNICNAME),
    province: String(attributes.Province),
    district: String(attributes.DISTRICT),
  };
  return {
    municipality: {
      code: ward.municipalityCode,
      name: ward.municipalityName,
      officialName: String(attributes.Municipali),
      province: ward.province,
      district: ward.district,
      districtCode: String(attributes.DISTRICTCO),
      wardId: ward.id,
      wardNumber: ward.number,
    },
    ward,
    latitude,
    longitude,
    source: "Municipal Demarcation Board · MDB Wards 2026 point-in-ward query",
  };
}

export async function findNearestWardForCoordinates(latitude: number, longitude: number) {
  return resolveGpsToWard(latitude, longitude);
}

export async function warmMunicipalityContactFor(code: string) {
  return fetchOfficialMunicipalContact(code);
}

export async function countOfficialWards(code: string) {
  return (await fetchWards(code)).length;
}
