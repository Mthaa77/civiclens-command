import AsyncStorage from "@react-native-async-storage/async-storage";

import type { DirectorySelection, Ward } from "./municipal-directory";
import { fetchWards, MDB_WARDS_2026_SOURCE } from "./municipal-directory";

export const TREASURY_MUNICIPALITIES_ENDPOINT = "https://municipaldata.treasury.gov.za/api/cubes/municipalities/members/municipality";
export const TREASURY_SOURCE_LABEL = "National Treasury · Municipalities API";
export const TREASURY_SOURCE_UPDATED = "National Treasury data · updated 2026-09-02";
export const GOVERNMENT_DIRECTORY_URL = "https://www.gov.za/about-government/contact-directory/provincial-local-government";
export const TSHWANE_WARD_COUNCILLORS_URL = "https://www.tshwane.gov.za/?page_id=17228";
export const TSHWANE_CUSTOMER_CARE_URL = "https://www.tshwane.gov.za/?page_id=8184";
export const TSHWANE_CONTACT_URL = "https://www.tshwane.gov.za/?page_id=953";
export const IEC_WARD_COUNCILLOR_LOOKUP_URL = "https://www.elections.org.za/pw/voter/Who-Is-My-Ward-Councillor";

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

export type WardCouncillorContact = {
  municipalityCode: string;
  wardNumber: number;
  name?: string;
  party?: string;
  phone?: string;
  email?: string;
  designation: "Ward Councillor" | "Vacant";
  sourceUrl: string;
  sourceLabel: string;
  checkedLabel: string;
};

export type WardOfficeContact = {
  municipalityCode: string;
  wardNumber?: number;
  label: string;
  phone?: string;
  tollFree?: string;
  sms?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  sourceUrl: string;
  sourceLabel: string;
  checkedLabel: string;
};

const TSHWANE_WARD_COUNCILLORS: WardCouncillorContact[] = [
  { municipalityCode: "TSH", wardNumber: 1, name: "Kruyshaar Leon Pieter", party: "Democratic Alliance", phone: "082 334 8986", email: "leonkru@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 2, name: "Meyer Quentin", party: "Democratic Alliance", phone: "082 304 8985", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 3, name: "Rakabe Malesela Phohlo John", party: "African National Congress", phone: "073 350 3842", email: "phohlorak@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 4, name: "Malope Petrus", party: "African National Congress", phone: "074 892 2507", email: "petrusmal@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 5, name: "Van Niekerk Albertus Martinus", party: "Democratic Alliance", phone: "082 770 4247", email: "arnoldvni@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 6, name: "Madonsela Mashiba Isaac", party: "African National Congress", phone: "067 151 5077", email: "mashibam@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 7, name: "Mashola Molatelo Samuel", party: "African National Congress", phone: "076 168 5759", email: "molateloma@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 8, name: "Matjeke Alfred Boas", party: "African National Congress", phone: "076 057 3579", email: "boasm@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 9, name: "Machava Patricia Lerato", party: "African National Congress", phone: "072 915 4714", email: "leratomac@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 10, name: "Masemola Thabang Mabitse", party: "African National Congress", phone: "082 096 9865 078 038 7012", email: "mabitsem@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 11, name: "Mashigo Fiki Zophonia", party: "African National Congress", phone: "083 995 8082", email: "fikim@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 12, name: "Tsela Donald Khotso", party: "African National Congress", phone: "076 919 9854", email: "khotsots@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 13, name: "Mabolawa Nomfutshane Sonia", party: "African National Congress", phone: "082 649 1173", email: "nomfutshanem@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 14, name: "Mothoa Lesibana Hans", party: "African National Congress", phone: "071 219 3974", email: "lesibanamo@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 15, name: "Masilela Joel Kgomotso", party: "African National Congress", phone: "067 189 0615", email: "joelma@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 16, name: "Marishane Mmina-tau Seabelo", party: "African National Congress", phone: "072 474 1966", email: "seabelom@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 17, name: "Lelaka Sylvia Paulina", party: "African National Congress", phone: "076 798 0234", email: "sylviale@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 18, name: "Masemola Vusi Isaac", party: "African National Congress", phone: "078 286 2162 065 857 8790", email: "vusimase@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 19, name: "Mazibuko Macalene Stanley", party: "African National Congress", phone: "072 901 1595", email: "macalenem@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 20, name: "Mocumi Neo Tiragalo", party: "African National Congress", phone: "082 945 0140 081 884 5375", email: "neomoc@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 21, name: "Mbokane Ellen Phumzile", party: "African National Congress", phone: "072 262 7284", email: "phumzilemb@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 22, name: "Mabaswa Mamma Cathrine", party: "African National Congress", phone: "083 559 1134", email: "mammam@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 23, name: "Mashao Diamond Hendrick", party: "African National Congress", phone: "076 253 5027", email: "diamondma@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 24, name: "Masia Christopher Sikhumbuzo", party: "African National Congress", phone: "076 168 5759", email: "sikhumbuzoma@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 25, name: "Chiota Phindile Phinah", party: "African National Congress", phone: "072 405 2226", email: "phindilec@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 26, name: "Shume Thulang Joseph", party: "African National Congress", phone: "072 393 4593", email: "thulangsh@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 27, name: "Masina Bongani Mcdonald", party: "African National Congress", phone: "072 896 6772", email: "bonganimasina@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 28, name: "Seelane Nomvula Joyce", party: "African National Congress", phone: "079 568 4781", email: "nomvulase@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 29, name: "Mathibedi Moses Thabo", party: "African National Congress", phone: "072 113 6510", email: "mosesmat@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 30, name: "Phalwane Violet", party: "African National Congress", phone: "063 269 1858", email: "violetph@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 31, name: "Kgatle Tshepo Floyd", party: "African National Congress", phone: "0621702780", email: "tshepokga@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 32, name: "Thema Floyd Makete", party: "African National Congress", phone: "079 788 9091", email: "floydt@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 33, name: "Aphane Lerato Marcia", party: "African National Congress", phone: "071 368 1333", email: "leratoa@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 34, name: "Sethole Rose Sisi", party: "African National Congress", phone: "074 084 3593", email: "rosese@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 35, name: "Mashapa Tebogo Patrick Kholofelo", party: "African National Congress", phone: "072 520 0798 072 393 2815", email: "tebogomashapa@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 36, name: "Modise Veronica Palesa", party: "African National Congress", phone: "072 948 3485", email: "palesamodi@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 37, name: "Ntohla Zacharia Sekete", party: "African National Congress", phone: "078 274 6820", email: "zacharian@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 38, name: "Ratau Saul Mokube", party: "African National Congress", phone: "072 307 3029", email: "mokuber@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 39, name: "Baloyi Jan Japane", party: "African National Congress", phone: "083 258 2353", email: "japaneb@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 40, name: "Makola Maloke Joseph", party: "African National Congress", phone: "076 484 0605", email: "josephmakola@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 41, name: "Chapman Barend William", party: "Democratic Alliance", phone: "078 394 9962", email: "bench@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 42, name: "Maas Shane", party: "Democratic Alliance", phone: "082 935 4287", email: "shanem@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 43, name: "Lawrence Benjamin William", party: "Democratic Alliance", phone: "072 010 4867", email: "benjaminla@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 44, designation: "Vacant", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 45, name: "Basson Elizabeth Maria", party: "Democratic Alliance", phone: "082 330 9586", email: "mariabass@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 46, name: "Van Heerden Pieter Willem", party: "Democratic Alliance", phone: "072 858 1388", email: "pietervh@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 47, name: "Erasmus Anna Alida", party: "Democratic Alliance", phone: "0714190090", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 48, name: "Fosi Thembamandla Elijah", party: "Democratic Alliance", phone: "082 358 2011", email: "thembamandlaf@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 49, name: "Mashapa Matome Adam", party: "African National Congress", phone: "076 102 8114", email: "adamm@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 50, name: "Breytenbach Aletta Susanna", party: "Democratic Alliance", phone: "081 733 0000", email: "leniseb@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 51, name: "Moabelo Sarah Salamina", party: "African National Congress", phone: "081 556 0031", email: "sarahmoabelo@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 52, name: "Smith Frans Johannes", party: "Democratic Alliance", phone: "082 447 0638", email: "franssmith@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 53, name: "Helfrich Wayne Peter", party: "Democratic Alliance", phone: "078 17 96248 082 887 5915", email: "wayneh@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 54, name: "Nel Elma Johanna", party: "Democratic Alliance", phone: "082 293 4858", email: "elman@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 55, name: "Dzumba Kwena Yvonne", party: "Democratic Alliance", phone: "071 341 7068 078 304 4573", email: "kwenad@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 56, name: "Tiaan Dippenaar", party: "Democratic Alliance", phone: "066 235 2946", email: "tiaand@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 57, name: "Farquharson David James", party: "Democratic Alliance", phone: "084 866 3294", email: "davidfa@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 58, name: "Ngoveni Conride", party: "African National Congress", phone: "063 032 6639", email: "conriden@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 59, name: "Wilkinson Shaun", party: "Democratic Alliance", phone: "082 445 4375", email: "shaunwi@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 60, name: "Ramphile Mpati Isaac", party: "African National Congress", phone: "083 770 7991", email: "mpatir@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 61, name: "Patel Naeem", party: "African National Congress", phone: "084 504 8042", email: "naeemp@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 62, name: "Masuku Esther Nonzingo", party: "African National Congress", phone: "074 125 7600", email: "esthermasuku@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 63, name: "Majola Duduzile Elsa", party: "African National Congress", phone: "078 995 1237", email: "duduzilemaj@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 64, name: "De Kock Issabel Alta", party: "Democratic Alliance", phone: "082 892 7878", email: "altadk@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 65, name: "Visser Gert Petrus", party: "Democratic Alliance", phone: "081 451 3308", email: "gertv4@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 66, name: "Strydom Catharina Elizabeth", party: "Democratic Alliance", phone: "082 473 8008", email: "inas1@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 67, name: "Tsiane Sizwe Paulos Clifton", party: "African National Congress", phone: "079 842 5972 081 041 4773", email: "sizwet@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 68, name: "Rambau Tshililo Victor", party: "African National Congress", phone: "078 529 7351", email: "tshililor@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 69, name: "Billson Cindy", party: "Democratic Alliance", phone: "079 398 6990", email: "cindyb@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 70, name: "Kruger Muller Marika Elizabeth", party: "Democratic Alliance", phone: "082 575 9701", email: "marikakm@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 71, name: "Phasha Mmakgoko Veron", party: "African National Congress", phone: "082 048 2250", email: "veronp@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 72, name: "Sebola Abbiot Masopo", party: "African National Congress", phone: "082 953 6613", email: "veronp@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 73, name: "Ndlovu Michael", party: "African National Congress", phone: "060 395 2978", email: "michaelndlo@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 74, name: "Setimo Zacharea", party: "African National Congress", phone: "082 677 0428", email: "zachareas@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 75, name: "Mahlangu Nthabiseng", party: "African National Congress", phone: "078 439 5763", email: "nthabisengmah@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 76, name: "Kekana Mavis Elizabeth", party: "African National Congress", phone: "072 394 3718", email: "mavisk@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 77, name: "Thabatha Tembeni Innocent", party: "African National Congress", phone: "065 638 0362", email: "tembenit@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 78, name: "Sutton Peter", party: "Democratic Alliance", phone: "071 361 2564", email: "peters@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 79, name: "Van Buuren Johan Gerhard", party: "Democratic Alliance", phone: "082 497 2677", email: "johanvb@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 80, name: "Mampuru Sekokobale Fortune", party: "African National Congress", phone: "072 426 6952", email: "fortunem@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 81, name: "Lewele Mpho Hans", party: "African National Congress", phone: "072 497 0386", email: "mpholew@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 82, name: "Muller Siobhan", party: "Democratic Alliance", phone: "082 454 9244", email: "siobhanm@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 83, name: "Lesch Andrew", party: "Democratic Alliance", phone: "081 264 2294", email: "andrewle@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 84, name: "Meyer Christopher Anru", party: "Democratic Alliance", phone: "081 371 2956", email: "anrum@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 85, name: "Uys Jacqueline", party: "Democratic Alliance", phone: "084 810 3431", email: "jacquiu@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 86, name: "Kgopotso Kholofelo Patience", party: "African National Congress", phone: "078 549 1894", email: "kholofelokgo@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 87, name: "Pienaar Christiaan Frederick", party: "Democratic Alliance", phone: "084 815 9299", email: "freddiepi@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 88, name: "Boikanyo Tshepang Sagious", party: "African National Congress", phone: "076 256 5642", email: "tshepangbo@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 89, name: "Malefane Tshepo Patrick", party: "African National Congress", phone: "066 586 3355", email: "tshepokga@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 90, name: "Chiloane Enos Papiki", party: "African National Congress", phone: "082 751 7640", email: "enosc@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 91, name: "Viljoen Henning Johannes", party: "Democratic Alliance", phone: "072 111 3996", email: "henningv@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 92, name: "Mashamaite Shimmy Nathaniel", party: "Democratic Alliance", phone: "0727173636", email: "shimmym@thwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 93, name: "Masupha Nathaniel Rabasotho", party: "African National Congress", phone: "084 797 5679", email: "nathanielma@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 94, name: "Mlotshwa Manakedi Elisa", party: "African National Congress", phone: "073 126 6454", email: "elisam@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 95, name: "Kgopa William Nkholo", party: "African National Congress", phone: "073 153 3371", email: "williamkgopa@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 96, name: "Breytenbach Gé Andries", party: "Democratic Alliance", phone: "082 436 9069", email: "gebre@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 97, name: "Mokgalotsi Nkoata Ananias", party: "African National Congress", phone: "071 679 7371", email: "ananiasmo@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 98, designation: "Vacant", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 99, name: "Makena Silias Mothupi", party: "African National Congress", phone: "071 348 6255", email: "siliasm@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 100, name: "Bekker Johannes Christoffel", party: "Democratic Alliance", phone: "083 646 3686", email: "christoffelb@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 101, name: "De Klerk Malcolm Ian", party: "Democratic Alliance", phone: "072 113 2685", email: "malcolmdk@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 102, name: "Mabena Vusi Ephraim", party: "African National Congress", phone: "071 624 9737", email: "vusimabe@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 103, name: "Moloi Eunice Dineo", party: "African National Congress", phone: "082 510 2955", email: "eunicemoloi@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 104, name: "Matshiane Oupa Patrick", party: "African National Congress", phone: "079 264 1091", email: "oupamat@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 105, name: "Phiri Kgaugelo Stephans", party: "African National Congress", phone: "078 518 2050", email: "kgaugelophiri@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 106, name: "Masha Mogauwane Kenneth", party: "African National Congress", phone: "076 982 4772", email: "mogauwanem@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
  { municipalityCode: "TSH", wardNumber: 107, name: "Mashego Phasudi Jeffrey", party: "African National Congress", phone: "072 846 5208", email: "phasudim@tshwane.gov.za", designation: "Ward Councillor", sourceUrl: TSHWANE_WARD_COUNCILLORS_URL, sourceLabel: "City of Tshwane · Office of the Chief Whip", checkedLabel: "Official directory checked 22 Sep 2026" },
];

const TSHWANE_WARD_OFFICE: WardOfficeContact = {
  municipalityCode: "TSH",
  label: "Tshwane Customer Care · ward-office routing",
  phone: "012 358 9999",
  tollFree: "080 111 1556",
  sms: "082 612 0333 or 44676 for power failures",
  email: "customercare@tshwane.gov.za",
  whatsapp: "087 153 1001",
  sourceUrl: TSHWANE_CUSTOMER_CARE_URL,
  sourceLabel: "City of Tshwane · Customer Care",
  checkedLabel: "Official service channels checked 22 Sep 2026",
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

export function getWardCouncillorContact(municipalityCode: string, wardNumber?: number) {
  if (!wardNumber) return undefined;
  return TSHWANE_WARD_COUNCILLORS.find((item) => item.municipalityCode === municipalityCode && item.wardNumber === wardNumber);
}

export function getPublishedWardCouncillorCount(municipalityCode: string) {
  return TSHWANE_WARD_COUNCILLORS.filter((item) => item.municipalityCode === municipalityCode).length;
}

export function getWardOfficeContact(municipalityCode: string, wardNumber?: number): WardOfficeContact | undefined {
  if (municipalityCode === "TSH") return { ...TSHWANE_WARD_OFFICE, wardNumber };
  return undefined;
}

export function getWardLookupFallback(municipalityCode: string, wardNumber?: number) {
  return {
    municipalityCode,
    wardNumber,
    label: "Use the IEC ward councillor lookup",
    sourceUrl: IEC_WARD_COUNCILLOR_LOOKUP_URL,
    sourceLabel: "Electoral Commission of South Africa · ward councillor lookup",
  };
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
