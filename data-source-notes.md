# CivicLens Municipal and Ward Data Sources

## Verified official sources

- Municipal Demarcation Board data portal: https://dataportal-mdb-sa.opendata.arcgis.com/
  - MDB determines local and district municipal boundaries and municipal wards.
  - Portal provides public access to MDB spatial data and products.

- MDB Spatial Knowledge Hub: https://spatialhub-mdb-sa.opendata.arcgis.com/
  - States that official 2026 ward boundary PDF maps are available for all municipalities.
  - States that updated municipal-boundary GIS datasets have been published for download.

- MDB official site: https://www.demarcation.org.za/
  - Explains the MDB’s mandate for municipal and ward demarcation.
  - Notes 2026 ward-change work and directs users to official ward maps / gazettes.

- MDB ArcGIS service inspected: https://services2.arcgis.com/fBaP2JVe62xtbsit/arcgis/rest/services/Ward_Boundaries/FeatureServer
  - Copyright: Municipal Demarcation Board.
  - Layer: Ward Boundaries (21).
  - Service description says boundaries were updated in 2016, so it is not suitable as the primary current 2026 boundary source. Keep as an optional legacy fallback only.

- MDB Local Municipalities 2021 dataset page: https://dataportal-mdb-sa.opendata.arcgis.com/datasets/27bbdd5b041b4ba6b5707dfed5aa3923_0/about
  - Official municipality fields include PROVINCE, CATEGORY, MUNICNAME, NAMECODE, DISTRICT, and DISTRICT_N.
  - Page shows a feature service updated 2026-08-18, but the dataset itself is explicitly Local Municipalities 2021. Use only as a municipality directory fallback and label its version.

- South African Government contact directory: https://www.gov.za/about-government/contact-directory
  - Official entry point for provincial and local government / municipality contact information.

## Product decision

Use a source-backed municipality directory and ward index in the app with explicit provenance and dataset-version labels. Prefer current MDB 2026 municipal / ward downloads from the Spatial Knowledge Hub when available. Do not present the inspected 2016 Ward_Boundaries service as current. For the first usable flow, provide searchable municipality and ward selection with City of Tshwane as a launch municipality, persist the user's selection locally, and show the data source/version directly in the UI.
