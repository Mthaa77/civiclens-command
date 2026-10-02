# CivicLens SA — Master Product & Engineering Plan

**Project:** CivicLens Command  
**Repository:** Mthaa77/civiclens-command  
**Mission:** Make South African government and municipal processes understandable, actionable, and source-grounded.

## 1. Product North Star

CivicLens should answer one practical question:

> **“I have a problem in my community. What exactly should I do next?”**

The product is not a political campaign, lobbying platform, or social-media replacement. It is a civic information and service-navigation system.

Core principles:
- Official-source-first.
- Explain complex processes in plain language.
- Separate verified official information from community reports and analysis.
- Always show source, date checked, and relevant authority.
- Never fabricate service incidents, officials, deadlines, or case outcomes.
- Minimize collection of personal information.
- Design for mobile-first South African usage and low-friction access.

## 2. Current Architecture

```
User
  ↓
CivicLens Expo / React Native Web
  ↓
Cloudflare Worker: civiclens-command
  ↓
Cloudflare Worker: civiclens-api
  ├── Official civic-data adapters
  ├── D1: civiclens-db
  ├── Authentication/session layer
  ├── Verification / abuse controls
  └── AI explanation layer
```

Current deployed components:
- Frontend Worker: `civiclens-command`
- API Worker: `civiclens-api`
- D1 database: `civiclens-db`
- Repository: `Mthaa77/civiclens-command`

Cloudflare's current platform guidance supports D1 for relational data, R2 for user-facing uploads, Queues for asynchronous work, Vectorize for semantic search, Workers AI for inference, and Durable Objects for strongly consistent coordination. Use each only when the product requirement justifies it.

## 3. Product Modules

### A. Civic Home
- “What do you need help with?”
- Search by problem, service, municipality, ward, or topic.
- Quick actions:
  - Report a problem
  - Find my municipality
  - Find my ward
  - Find who to contact
  - Track my case
  - Learn how government works

### B. Civic Guide
Structured explainers:
1. What is the problem?
2. Who is responsible?
3. What evidence/information do I need?
4. Where do I report it?
5. What happens after reporting?
6. What should I do if nothing happens?
7. What escalation route exists?
8. Official sources.

Initial categories:
- Water
- Electricity
- Roads
- Streetlights
- Refuse
- Sewage
- Billing
- Property/municipal services
- Community facilities
- Ward/municipal processes
- Complaints and escalation
- Government documents and applications

### C. Report a Problem
A structured case intake:
- Service
- Municipality
- Ward
- Location description
- Problem title
- Description
- Optional evidence
- Consent/privacy notice

Every case receives:
- Case/reference ID
- Created timestamp
- Status
- Timeline
- Relevant authority
- Recommended next action

### D. My Cases
Private dashboard:
- Active cases
- Submitted
- Acknowledged
- In progress
- Awaiting user
- Resolved
- Closed

Each case includes a chronological timeline.

### E. Municipality Navigator
For each municipality:
- Municipality profile
- Official website
- Customer-care channels
- Relevant service contacts
- Complaint channels
- Published ward information
- Official documents
- Service notices
- Source timestamps

### F. Ward Navigator
- Determine municipality/ward where possible.
- Show published councillor information only when supported by official sources.
- Link to official lookup sources when direct data is unavailable.
- Never infer political affiliation or invent contact details.

### G. Civic Source Library
A transparent source layer:
- Source name
- Authority
- URL
- Topic
- Last checked
- Data freshness
- What CivicLens uses it for

Priority:
1. Official South African government sources.
2. Official municipal sources.
3. IEC/MDB/official statutory sources where relevant.
4. Reputable public datasets.
5. Community submissions as clearly labelled user-generated information.

### H. Civic Pulse
A factual service-information dashboard:
- Official notices
- Service interruptions
- Published maintenance
- Municipality notices
- Data freshness
- Coverage status

Important: a missing notice must never be represented as proof that a service is operating normally.

### I. Education
Explain:
- National vs provincial vs local government.
- Municipal structures.
- Wards.
- Councillors.
- Municipal administration.
- Public participation.
- Complaints and escalation.
- How budgets and service delivery relate.
- Where citizens can find official information.

### J. AI Civic Assistant
A future assistant that answers questions using retrieved official sources.

Every answer should expose:
- Sources used.
- Date checked.
- Confidence/data-quality indicator.
- Clear distinction between official fact and general explanation.

The AI must not invent government procedures.

## 4. Data Model — Target

### users
- id
- email/auth identifier
- display_name
- created_at
- updated_at

### civic_reports
- id
- reference_number
- owner_id or secure owner credential
- service
- municipality
- ward
- location_text
- title
- description
- status
- created_at
- updated_at
- resolved_at

### report_events
- id
- report_id
- event_type
- title
- detail
- source
- created_at

### municipalities
- id
- name
- province
- official_domain
- contact_url
- status
- updated_at

### wards
- id
- municipality_id
- ward_number
- geometry/source identifier
- source_url
- updated_at

### contacts
- id
- municipality_id
- department
- role
- name
- phone
- email
- URL
- source_url
- verified_at

### civic_sources
- id
- publisher
- title
- URL
- category
- source_type
- last_checked
- freshness_status

### service_notices
- id
- municipality_id
- service
- title
- detail
- source_url
- published_at
- checked_at
- status

### guide_pages
- id
- slug
- title
- category
- body
- reviewed_at
- review_status

## 5. Security & Privacy

### Phase 1
The current device owner token is acceptable as an interim mechanism, but it is **not equivalent to authenticated identity**.

Next:
- Proper authentication.
- Secure session/token handling.
- Server-side authorization.
- Ownership checks on every case endpoint.
- Rate limiting.
- Abuse detection.
- Input validation.
- Audit events for sensitive changes.

### Never store unnecessarily
- ID numbers
- passwords
- political preferences
- sensitive personal details
- precise location unless necessary for the requested service

### Abuse controls
Add Cloudflare Turnstile to public submission flows where appropriate.

## 6. Backend Roadmap

### Phase 1 — Stabilize the foundation
- Confirm production frontend deployment path.
- Confirm API routing.
- Add API error model.
- Add request validation.
- Add structured logging.
- Add health/readiness endpoints.
- Add automated tests.
- Document environment variables.

### Phase 2 — Case management
- My Cases.
- Reference numbers.
- Case timeline.
- Status transitions.
- Ownership/authentication.
- Case detail API.
- Delete/export controls where appropriate.

### Phase 3 — Municipality intelligence
Build adapters for official sources:
- City of Tshwane.
- South African government local-government directory.
- Municipal data sources.
- MDB ward data.
- IEC ward lookup where appropriate.

Do not scrape blindly. Each adapter should have:
- source URL
- parser
- validation
- last successful sync
- failure state
- source freshness

### Phase 4 — Data synchronization
Use scheduled/background processing for official source checks.

Potential architecture:
```
Scheduled trigger
   ↓
Source adapter
   ↓
Normalize
   ↓
Validate
   ↓
D1
   ↓
Freshness metadata
   ↓
CivicLens API
```

Use Queues when ingestion becomes asynchronous or needs retries/batching.

### Phase 5 — Geographic intelligence
- Municipality lookup.
- Ward lookup.
- Service-area mapping.
- Map visualization.
- Official boundary datasets.
- Location privacy controls.

Use precise location only when the user explicitly needs location-dependent functionality.

### Phase 6 — AI/RAG
Only after source infrastructure is reliable:
- Ingest approved civic documents.
- Chunk/index documents.
- Generate embeddings.
- Store vectors.
- Retrieve relevant official material.
- Generate plain-language explanation.
- Attach citations/source metadata.

Cloudflare's Vectorize + Workers AI architecture is a candidate for this layer.

## 7. Frontend Roadmap

### Navigation
Primary:
- Home
- Explore
- Report
- My Cases
- Learn

Secondary:
- Municipality
- Ward
- Sources
- About
- Privacy

### UX rules
- Mobile first.
- Fast first render.
- Large tap targets.
- Clear hierarchy.
- No excessive animation.
- No dark-purple/navy visual language.
- Maintain premium CivicLens visual identity without sacrificing accessibility.
- Every important action should have an obvious next step.

## 8. Trust Architecture

Every piece of information gets a classification:

**OFFICIAL**
Directly sourced from an official authority.

**VERIFIED**
Cross-checked against authoritative sources.

**COMMUNITY**
Submitted by users; not automatically treated as fact.

**EXPLAINER**
CivicLens educational interpretation.

**UNVERIFIED**
Potentially useful but awaiting confirmation.

The UI must make these distinctions obvious.

## 9. Civic Case Lifecycle

```
Draft
 ↓
Submitted
 ↓
Validated
 ↓
Routed
 ↓
Acknowledged
 ↓
In Progress
 ↓
Awaiting User / Authority
 ↓
Resolved
 ↓
Closed
```

Not every case will follow every state.

CivicLens should distinguish:
- “CivicLens received your report”
from
- “The municipality acknowledged your report”
from
- “The municipality resolved the issue.”

Never collapse these into one status.

## 10. Reference Number System

Example:

`CL-TSH-WATER-20261002-A7K4`

Structure:
- CL = CivicLens
- TSH = municipality code
- WATER = service
- date
- random suffix

Reference numbers must not expose personal information.

## 11. Official Data Strategy

Initial authoritative source families:
- South African Government.
- Municipal official websites.
- Municipal Data and official ward datasets.
- IEC where ward/civic lookup is relevant.
- Official municipal notices and contact directories.

For every source:
- Save canonical URL.
- Record publisher.
- Record retrieval time.
- Record parsing status.
- Keep stale data visibly marked.

## 12. Observability

Track:
- API errors.
- Source-sync failures.
- Source freshness.
- Report creation success/failure.
- Authentication failures.
- Response latency.
- Frontend errors.
- D1 query failures.

Create a small internal health dashboard later.

## 13. Testing Strategy

### Unit
- Validation.
- Service classification.
- Source parsers.
- Status transitions.
- Reference number generation.

### Integration
- Report creation.
- Report retrieval.
- Ownership enforcement.
- Municipality lookup.
- Source synchronization.

### End-to-end
- Search → guide → report.
- Report → My Cases → timeline.
- Municipality → contact → official source.
- Ward lookup → official source.

### Regression checklist
- Mobile layout.
- Navigation.
- Offline/slow network behaviour.
- API unavailable.
- Source unavailable.
- Empty states.
- Duplicate submission.
- Unauthorized case access.

## 14. Performance

Targets:
- Keep JavaScript and animation lightweight.
- Avoid unnecessary API requests.
- Cache stable public data.
- Paginate reports.
- Lazy-load heavy screens.
- Optimize images.
- Avoid blocking startup on external civic sources.

Public civic guides should remain useful even if a live source is temporarily unavailable.

## 15. Deployment Strategy

Preferred long-term structure:

```
GitHub
  ↓
Cloudflare build/deployment
  ↓
Frontend Worker + Static Assets
  ↓
API Worker
  ↓
D1
  ↓
Official source adapters
```

Keep the frontend and API logically separated until the deployment pipeline is reliable.

Before changing the existing frontend deployment:
1. Confirm current production version.
2. Build locally.
3. Run tests.
4. Deploy a new version.
5. Smoke-test.
6. Only then change traffic.

Never replace a known-good production deployment with an unverified build.

## 16. Cost-Control Principle

CivicLens should be designed around a serverless-first architecture.

Use:
- Workers for API/edge logic.
- D1 for relational civic data.
- KV only for suitable key/value/cache/config use cases.
- R2 for files/evidence.
- Queues for asynchronous jobs.
- Durable Objects only where strong coordination/state is genuinely required.
- Workers AI/Vectorize only after the core product is stable.

Do not introduce infrastructure simply because it is available.

## 17. Monetization / Sustainability — Future

CivicLens should first prove public usefulness.

Possible future models, subject to legal/ethical review:
- Institutional dashboards.
- Municipality service-information tooling.
- NGO/community organization tooling.
- Research/data access.
- Civic education partnerships.
- Sponsored educational programs with transparent labeling.

The public core should remain useful without requiring payment.

## 18. 90-Day Execution Plan

### Weeks 1–2 — Foundation
- Lock architecture.
- Production deployment pipeline.
- API contracts.
- Authentication design.
- D1 schema cleanup.
- Error handling.
- Testing foundation.

### Weeks 3–4 — Case system
- My Cases.
- Reference numbers.
- Timeline.
- Status model.
- Secure ownership.
- Report confirmation.

### Weeks 5–6 — Municipality layer
- Municipality directory.
- Contact directory.
- Official-source cards.
- Tshwane integration.
- Ward source integration.

### Weeks 7–8 — Civic guides
- Water.
- Electricity.
- Roads.
- Streetlights.
- Refuse.
- Sewage.
- Billing.
- Complaints/escalation.

### Weeks 9–10 — Civic Pulse
- Official notices.
- Source freshness.
- Service information.
- Municipality filtering.
- Data-quality states.

### Weeks 11–12 — AI + scale preparation
Only if the preceding layers are stable:
- RAG prototype.
- Source retrieval.
- AI explanations.
- Citation display.
- Abuse controls.
- Analytics.
- Production hardening.

## 19. Definition of Done

CivicLens is MVP-ready when a resident can:

1. Open CivicLens.
2. Describe a real municipal problem.
3. Identify the relevant municipality/service.
4. Read a simple explanation.
5. See the responsible official channel.
6. Submit a private case.
7. Receive a reference number.
8. Return later and see the case timeline.
9. Distinguish official information from community information.
10. Open the original official source.

## 20. Immediate Build Queue

### P0 — Do next
1. Fix/establish reliable frontend deployment pipeline.
2. Verify current production API contract.
3. Add proper authenticated account/session architecture.
4. Finish My Cases.
5. Add case detail + timeline.
6. Harden report API authorization.
7. Add API validation/error states.
8. Add production smoke tests.

### P1
9. Municipality directory.
10. Official contact directory.
11. Ward-aware routing.
12. Source library.
13. Civic guide content system.
14. Source freshness model.

### P2
15. Civic Pulse.
16. Scheduled source synchronization.
17. Evidence uploads via R2.
18. Turnstile.
19. Analytics/observability dashboard.

### P3
20. AI civic assistant.
21. Vector search/RAG.
22. Advanced geographic intelligence.
23. Institutional dashboards.
24. Public civic data products.

## 21. What We Should NOT Build Yet

Do not spend the next development cycle on:
- social feeds
- likes/reactions
- political campaigning features
- complex gamification
- nationwide data ingestion before source quality is proven
- expensive AI infrastructure
- complicated microservices
- unnecessary native-app complexity
- speculative prediction systems

The priority is a trustworthy civic workflow.

## 22. Product Evolution

```
Beautiful civic website
        ↓
Civic information platform
        ↓
Actionable civic navigator
        ↓
Case-management system
        ↓
Official-source intelligence layer
        ↓
AI-powered civic assistant
        ↓
South African civic infrastructure
```

The key is sequencing. Build the trustworthy information and case infrastructure first; intelligence and AI come on top of it.

## 23. Success Metrics

Measure product usefulness rather than vanity metrics:
- Guide completion rate.
- Successful contact discovery.
- Report submission completion.
- Case retrieval success.
- Time from question → correct official channel.
- Source freshness.
- Source failure rate.
- Percentage of answers with authoritative sources.
- Repeat usage.
- User-reported resolution/helpfulness.

## 24. Master Technical Principle

**CivicLens should never be the source of truth when an authoritative source exists.**

CivicLens should be the layer that:
- finds the source,
- understands it,
- explains it,
- routes the user,
- records the user's case,
- and shows what is known versus unknown.

That is the foundation for making CivicLens genuinely useful at South African community level.
