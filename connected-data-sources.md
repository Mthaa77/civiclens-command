# CivicLens Connected Data Sources

The premium connected-data status uses these public official endpoints:

- National Treasury municipalities API: https://municipaldata.treasury.gov.za/api/cubes/municipalities/members/municipality
- Municipal Demarcation Board MDB Wards 2026 FeatureServer: https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDB_Wards_2026/FeatureServer/0
- City of Tshwane official ward councillor directory: https://www.tshwane.gov.za/?page_id=17228
- City of Tshwane Customer Care channels: https://www.tshwane.gov.za/?page_id=8184
- South African Government local-government contact directory: https://www.gov.za/about-government/contact-directory/provincial-local-government
- IEC ward councillor lookup fallback: https://www.elections.org.za/pw/voter/Who-Is-My-Ward-Councillor

The app uses the National Treasury and MDB endpoints in the public tRPC `civic.status` procedure to expose backend connection state. Ward-level councillor and ward-office UI uses official City of Tshwane records where published, with IEC fallback for municipalities without a published ward directory.
