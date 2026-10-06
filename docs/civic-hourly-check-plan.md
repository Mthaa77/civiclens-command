# CivicLens Hourly Check Plan

## Purpose

Run a reliable civic-source health and service-intelligence check at the start of every hour, then make the result visible in Civic Pulse.

## Schedule

- Cloudflare Cron: `0 * * * *`
- Frequency: once every hour
- Trigger minute: `:00`
- Execution timezone: UTC
- South Africa time: also on the hour because SAST is UTC+2
- Current first expected local run after deployment: the next hourly boundary

## What is checked

CivicLens checks four service domains:

1. Water
2. Electricity
3. Roads
4. Refuse

The checks use connected official municipal sources. Electricity additionally has the official Tshwane power-failure system available to the intelligence layer.

## Per-run flow

1. Cron invokes the Worker scheduled handler.
2. A D1 check-run record is created with status `running`.
3. The four service checks execute concurrently.
4. Each result records:
   - service
   - source reachable/degraded
   - official notice count
   - planned-interruption summary
   - timestamp
   - source payload for audit/debugging
5. The run is marked `completed` when all four checks succeed.
6. The run is marked `degraded` when one or more checks fail.
7. Civic Pulse reads the latest run and the last 24 runs.

## Trust rules

- Source reachability is not the same thing as a confirmed local outage.
- An official notice is evidence of a published notice, not proof that a specific street or property is affected.
- CivicLens does not invent outage status when a source is unavailable.
- UI states must distinguish connected, degraded, pending, and verified information.

## D1 history

- `civic_check_runs`: one row per scheduled execution.
- `civic_check_results`: one row per service per execution.
- Civic Pulse displays the latest result and the previous 24 runs.

## Failure handling

A single service failure does not discard the other three results. The failed service is stored as degraded and the overall run is marked degraded.

The next hourly run starts independently, allowing temporary official-source outages to recover naturally.

## Product surface

**Civic Pulse** is the operator-facing transparency layer:

- latest check time
- overall run status
- healthy source count
- official notice count
- per-service connection state
- planned interruption summary
- last 24 hourly runs

## Future expansion

The same scheduler can later add:

- municipality-specific source packs
- source change detection
- new-notice alerts
- source freshness scoring
- ward-aware checks
- scheduled data quality checks
- notification workflows after verified changes

The first version deliberately stays source-first and avoids claiming a local incident unless authoritative evidence supports it.
