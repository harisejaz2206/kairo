# Backend Specification — Job Discovery and Application Assistant

## 1. Product Purpose

Build a backend system that helps a user discover relevant software engineering jobs, score them against a structured candidate profile, generate application-support assets, and track progress across the application pipeline.

This backend must **not** automate prohibited third-party platform activity such as auto-submitting LinkedIn applications. The backend is intended to automate:

- job ingestion from public/official or manually approved sources
- normalization and deduplication
- candidate-job matching
- AI-assisted scoring
- draft asset generation
- shortlist and application tracking
- reporting and notifications

The backend will act as the central business layer for:

- source ingestion endpoints
- internal scoring jobs
- candidate profile management
- job review and application state management
- future outreach workflows

---

## 2. Core Product Goals

### Primary goals

- Collect jobs from multiple sources on a schedule
- Normalize all jobs into one internal schema
- Deduplicate repeated listings across sources and refreshes
- Score each job for relevance
- Let the user shortlist and track applications
- Generate optional AI support assets like:
  - tailored summary
  - suggested CV bullets
  - recruiter outreach note
  - short cover note

### Non-goals for v1

- full browser automation
- auto-submitting applications
- scraping fragile protected platforms as a primary strategy
- multi-user SaaS complexity
- authentication-heavy product design if only one user is using it initially

---

## 3. System Architecture

## High-level architecture

### External systems

- n8n
- public job sources
- OpenAI API
- optional future email/slack/telegram notification systems

### Internal systems

- NestJS backend
- PostgreSQL database
- TypeORM entities/repositories/services
- optional queue system later
- frontend dashboard consuming backend APIs

## System responsibility split

### n8n responsibilities

n8n should only handle orchestration-level concerns:

- schedule-based triggers
- source fetching
- light transform/mapping if needed
- posting normalized or semi-normalized data into backend ingestion endpoints
- optional daily digest notifications

### NestJS responsibilities

NestJS handles the real logic:

- DTO validation
- source registration rules
- persistence
- dedupe logic
- scoring job dispatch
- AI prompt orchestration
- application tracking
- audit metadata
- admin APIs for review dashboard

This split is important because otherwise n8n becomes a spaghetti warehouse with too much business logic.

---

## 4. Domain Model

The system revolves around six core domains:

1. **Job Source**
2. **Job**
3. **Candidate Profile**
4. **Job Score**
5. **Application Record**
6. **Draft Assets**

You can optionally separate `DraftAssets` later, but for v1 it can live on the application table.

---

## 5. Core Modules

Recommended NestJS module structure:

```txt
src/
  app.module.ts
  main.ts

  common/
    constants/
    decorators/
    dto/
    enums/
    filters/
    interceptors/
    interfaces/
    pipes/
    transformers/
    types/
    utils/

  config/
    app.config.ts
    database.config.ts
    openai.config.ts
    source.config.ts
    validation.ts

  database/
    data-source.ts
    migrations/
    seeds/

  modules/
    health/
    candidate-profile/
    sources/
    jobs/
    job-ingestion/
    job-scoring/
    applications/
    drafts/
    notifications/
    admin/

  integrations/
    openai/
    greenhouse/
    lever/
    manual/
    webhook/

  shared/
    logger/
    events/
    exceptions/
```

## Module breakdown

### `candidate-profile`

Stores the candidate’s preferences and master profile used in matching.

### `sources`

Stores approved sources and source configuration.

### `job-ingestion`

Accepts incoming jobs from n8n or internal connectors, validates them, normalizes them, and forwards them to jobs service.

### `jobs`

Owns the canonical job entity, querying, filters, dedupe coordination, and retrieval APIs.

### `job-scoring`

Handles matching logic, AI prompt execution, structured scoring output, red flags, and rescore flows.

### `applications`

Owns shortlist state, apply state, rejection/interview tracking, notes, and activity metadata.

### `drafts`

Optional separate module for generated assets if you do not want to store them on `applications`.

### `notifications`

Daily summaries, shortlist alerts, stale application reminders.

### `admin`

Internal endpoints such as re-score all, sync source, backfill jobs, refresh stale data.

---

## 6. Folder Structure Inside a Module

Example module layout:

```txt
modules/jobs/
  controllers/
    jobs.controller.ts
    admin-jobs.controller.ts

  services/
    jobs.service.ts
    jobs-query.service.ts
    jobs-dedupe.service.ts

  dto/
    list-jobs.dto.ts
    update-job-status.dto.ts
    job-response.dto.ts

  entities/
    job.entity.ts

  repositories/
    jobs.repository.ts

  mappers/
    job.mapper.ts

  validators/
    job.validator.ts

  jobs.module.ts
```

Use the same pattern across modules. This keeps Cloud Code from randomly nesting logic in weird places.

---

## 7. Database Design

Use PostgreSQL as primary storage.

## 7.1 `job_sources`

```txt
job_sources
- id (uuid, pk)
- name (varchar)
- slug (varchar, unique)
- type (enum: greenhouse | lever | company_page | manual | webhook)
- base_url (varchar, nullable)
- is_active (boolean, default true)
- config_json (jsonb, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

Purpose:

- tracks where jobs came from
- supports source-specific behavior later
- allows activation/deactivation of sources

---

## 7.2 `candidate_profiles`

Since this is likely a single-user system first, you can still model it properly.

```txt
candidate_profiles
- id (uuid, pk)
- display_name (varchar)
- target_titles (jsonb)
- target_countries (jsonb)
- target_locations (jsonb, nullable)
- preferred_keywords (jsonb)
- excluded_keywords (jsonb)
- must_have_rules (jsonb)
- nice_to_have_rules (jsonb)
- remote_preferences (jsonb)
- visa_preferences (jsonb)
- experience_years (numeric)
- stack_summary (text)
- master_resume_text (text)
- created_at (timestamp)
- updated_at (timestamp)
```

Example values:

- `target_titles`: `["Backend Engineer", "Software Engineer", "Node.js Engineer"]`
- `target_countries`: `["Germany", "Netherlands"]`

---

## 7.3 `jobs`

This is the canonical job table.

```txt
jobs
- id (uuid, pk)
- source_id (uuid, fk -> job_sources.id)
- external_job_id (varchar, nullable)
- external_company_id (varchar, nullable)
- source_job_url (text)
- company_name (varchar)
- title (varchar)
- location_raw (varchar, nullable)
- city_normalized (varchar, nullable)
- country_normalized (varchar, nullable)
- workplace_type (enum: remote | hybrid | onsite | unknown)
- employment_type (enum: full_time | part_time | contract | internship | temporary | unknown)
- seniority_hint (enum: intern | junior | mid | senior | lead | staff | unknown)
- language_requirements (jsonb, nullable)
- relocation_supported (boolean, nullable)
- visa_sponsorship_signal (boolean, nullable)
- description_text (text)
- requirements_text (text, nullable)
- tech_keywords (jsonb, nullable)
- posted_at (timestamp, nullable)
- fetched_at (timestamp)
- first_seen_at (timestamp)
- last_seen_at (timestamp)
- source_payload_json (jsonb)
- content_hash (varchar)
- dedupe_key (varchar)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

### Important dedupe fields

- `external_job_id`
- `source_job_url`
- `content_hash`
- `dedupe_key`

Use multiple dedupe strategies because job sources are messy.

---

## 7.4 `job_scores`

```txt
job_scores
- id (uuid, pk)
- job_id (uuid, fk -> jobs.id, unique if only latest score is stored)
- candidate_profile_id (uuid, fk -> candidate_profiles.id)
- overall_score (numeric(4,2))
- title_match_score (numeric(4,2))
- stack_match_score (numeric(4,2))
- location_match_score (numeric(4,2))
- experience_match_score (numeric(4,2))
- visa_signal_score (numeric(4,2))
- remote_match_score (numeric(4,2))
- red_flags_json (jsonb)
- strengths_json (jsonb)
- explanation_json (jsonb)
- scoring_model (varchar)
- scoring_version (varchar)
- scored_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

Store structured reasoning, not just a number. A naked score is corporate astrology.

---

## 7.5 `applications`

```txt
applications
- id (uuid, pk)
- job_id (uuid, fk -> jobs.id, unique if one app per job)
- candidate_profile_id (uuid, fk -> candidate_profiles.id)
- status (enum:
    new,
    shortlisted,
    draft_generated,
    reviewed,
    applied,
    rejected,
    interview,
    offer,
    archived
  )
- priority (enum: low | medium | high)
- fit_label (enum: weak | decent | strong | exceptional)
- manual_notes (text, nullable)
- rejection_reason (varchar, nullable)
- applied_at (timestamp, nullable)
- last_status_changed_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## 7.6 `draft_assets`

Recommended if you want draft history.

```txt
draft_assets
- id (uuid, pk)
- application_id (uuid, fk -> applications.id)
- type (enum: tailored_summary | cv_bullets | cover_note | recruiter_message)
- content (text)
- metadata_json (jsonb, nullable)
- model_name (varchar, nullable)
- version (varchar, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

If you want less complexity, fold these into `applications` as text columns for v1.

---

## 8. Enums

Create shared enums in `common/enums`.

```ts
export enum SourceType {
  GREENHOUSE = 'greenhouse',
  LEVER = 'lever',
  COMPANY_PAGE = 'company_page',
  MANUAL = 'manual',
  WEBHOOK = 'webhook',
}
```

```ts
export enum WorkplaceType {
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  ONSITE = 'onsite',
  UNKNOWN = 'unknown',
}
```

```ts
export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  TEMPORARY = 'temporary',
  UNKNOWN = 'unknown',
}
```

```ts
export enum SeniorityHint {
  INTERN = 'intern',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  STAFF = 'staff',
  UNKNOWN = 'unknown',
}
```

```ts
export enum ApplicationStatus {
  NEW = 'new',
  SHORTLISTED = 'shortlisted',
  DRAFT_GENERATED = 'draft_generated',
  REVIEWED = 'reviewed',
  APPLIED = 'applied',
  REJECTED = 'rejected',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  ARCHIVED = 'archived',
}
```

---

## 9. API Design

## 9.1 Candidate Profile APIs

### `GET /candidate-profile`

Get active candidate profile.

### `PATCH /candidate-profile`

Update preferences, stack summary, titles, countries, exclusions, and master resume text.

### `POST /candidate-profile/seed`

Optional internal endpoint for first-time setup.

---

## 9.2 Source APIs

### `GET /sources`

List sources.

### `POST /sources`

Create a source.

### `PATCH /sources/:id`

Update source config.

### `POST /sources/:id/activate`

Activate source.

### `POST /sources/:id/deactivate`

Deactivate source.

---

## 9.3 Job Ingestion APIs

These are the most important for n8n integration.

### `POST /job-ingestion/single`

Accept one normalized job payload.

### `POST /job-ingestion/bulk`

Accept array of normalized jobs.

### `POST /job-ingestion/webhook/:sourceSlug`

Optional source-specific webhook endpoint for n8n.

### Expected ingestion behavior

For each incoming job:

1. validate DTO
2. map source identifiers
3. normalize strings and enums
4. generate `content_hash`
5. generate `dedupe_key`
6. check for duplicates
7. insert or update job
8. ensure application record exists with `new` status if fresh
9. optionally trigger scoring

---

## 9.4 Job APIs

### `GET /jobs`

List jobs with filters:

- country
- workplace type
- source
- score min/max
- status
- posted_after
- search term
- visa signal
- remote only

### `GET /jobs/:id`

Get one job with score, source, application state, and draft assets.

### `POST /jobs/:id/rescore`

Manual rescore trigger.

### `PATCH /jobs/:id/archive`

Archive/hide irrelevant job.

### `GET /jobs/stats/summary`

Counts by:

- total jobs
- active jobs
- by country
- by score band
- by application status

---

## 9.5 Application APIs

### `GET /applications`

List application records.

### `PATCH /applications/:id/status`

Update application status.

### `PATCH /applications/:id/notes`

Update manual notes.

### `POST /applications/:id/shortlist`

Shortcut to set `shortlisted`.

### `POST /applications/:id/mark-applied`

Set `applied` with timestamp.

### `POST /applications/:id/generate-drafts`

Generate AI draft assets.

### `GET /applications/:id/drafts`

Fetch associated drafts.

---

## 9.6 Admin/Internal APIs

### `POST /admin/jobs/backfill-score`

Score all unscored jobs.

### `POST /admin/jobs/recompute-dedupe`

Re-run dedupe logic.

### `POST /admin/sources/:id/sync`

Trigger source sync.

### `POST /admin/notifications/daily-summary`

Trigger digest generation.

These should be protected or kept behind internal access controls.

---

## 10. DTOs

You should create strict DTOs for ingestion, filtering, and updates.

## 10.1 Ingestion DTO

```ts
export class IngestJobDto {
  sourceSlug: string;
  externalJobId?: string;
  sourceJobUrl: string;
  companyName: string;
  title: string;
  locationRaw?: string;
  cityNormalized?: string;
  countryNormalized?: string;
  workplaceType?: 'remote' | 'hybrid' | 'onsite' | 'unknown';
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary' | 'unknown';
  seniorityHint?: 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'staff' | 'unknown';
  descriptionText: string;
  requirementsText?: string;
  postedAt?: string;
  languageRequirements?: string[];
  relocationSupported?: boolean;
  visaSponsorshipSignal?: boolean;
  techKeywords?: string[];
  sourcePayloadJson?: Record<string, unknown>;
}
```

## 10.2 Job list filter DTO

```ts
export class ListJobsDto {
  search?: string;
  country?: string;
  workplaceType?: string;
  sourceSlug?: string;
  minScore?: number;
  maxScore?: number;
  status?: string;
  visaSponsorshipSignal?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'postedAt' | 'overallScore' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}
```

---

## 11. Entity Design Approach

Since you are using TypeORM, use the **Data Mapper style**:

- entities stay simple
- services own business logic
- repositories handle persistence details

TypeORM supports both Data Mapper and Active Record, but for NestJS, Data Mapper is the cleaner, less-chaotic choice. ([TypeORM](https://typeorm.io/))

### Why not Active Record?

Because you will have:

- ingestion logic
- dedupe logic
- scoring orchestration
- application transitions
- multiple repositories and services

That is not entity-method territory. Keep entities dumb.

---

## 12. Dedupe Strategy

Dedupe is critical.

## Deduplication order

When ingesting a job, try matching in this order:

1. `source_id + external_job_id`
2. exact `source_job_url`
3. `dedupe_key`
4. `content_hash`

## `dedupe_key` generation

Suggested format:

```txt
normalize(company_name) + "::" + normalize(title) + "::" + normalize(country_normalized or location_raw)
```

## `content_hash` generation

Hash this normalized string:

```txt
company_name + title + location + trimmed_description_text
```

Use SHA-256 or similar.

## Update behavior

If duplicate exists:

- update `last_seen_at`
- update mutable fields if newer data exists
- keep `first_seen_at`
- never create duplicate application rows

---

## 13. Scoring Design

## Scoring goals

Each job should receive:

- numeric score
- breakdown scores
- strengths
- red flags
- explanation data

## Suggested score components

Weight example:

- Title match: 20%
- Stack match: 25%
- Location match: 20%
- Experience match: 15%
- Visa/relocation signal: 10%
- Work mode match: 10%

## Scoring modes

### Phase 1 — rule-based scoring

Use deterministic logic:

- title contains backend/software engineer
- description contains Node.js/TypeScript/NestJS
- country is Germany or Netherlands
- remote Europe optionally accepted
- excludes words like senior staff principal if experience mismatch is obvious

### Phase 2 — AI-assisted scoring

Send structured prompt with:

- candidate profile
- normalized job data
- scoring instructions
- strict JSON response schema

The rule-based layer should always exist even when AI is added. Never let the model be the only adult in the room.

---

## 14. AI Draft Generation

Generate only after a job is shortlisted or passes threshold.

## Asset types

- tailored summary
- resume bullet suggestions
- recruiter note
- short cover note

## Input context

- candidate profile
- selected job
- score explanation
- prior drafted content if regenerating

## Output rules

- concise
- grounded only in candidate profile
- no fabricated achievements
- no fake years of experience
- no fake sponsorship claims
- no cringe motivational paragraph nonsense

---

## 15. Application Lifecycle

Recommended state machine:

```txt
new
-> shortlisted
-> draft_generated
-> reviewed
-> applied
-> interview
-> offer
```

Alternative transitions:

- `new -> archived`
- `shortlisted -> archived`
- `applied -> rejected`
- `interview -> rejected`

Rules:

- cannot mark `applied` without existing application record
- `applied_at` set only first time
- status change should update `last_status_changed_at`

---

## 16. n8n Integration, Explained Simply

You said n8n is still fuzzy, so here is the plain-English version.

n8n is not your backend. It is a **workflow runner**.

Think of it like this:

- at 9 AM every day, n8n wakes up
- it fetches jobs from source A
- then source B
- then source C
- then it sends those jobs to your NestJS ingestion endpoint
- your NestJS backend validates and stores them
- then your backend scores them
- then n8n can optionally send you a summary

That is all.

## First n8n workflow you should eventually build

### Workflow: `sync-greenhouse-jobs`

Nodes:

1. Schedule Trigger
2. HTTP Request to Greenhouse/public source
3. Code/Set node to shape fields if needed
4. HTTP Request to your backend:
  - `POST /job-ingestion/bulk`
5. Optional notification step

n8n documents Schedule Trigger, HTTP Request, and Webhook/Respond-to-Webhook style primitives directly in its docs, which is why this fits nicely as a scheduling/orchestration layer instead of a business-logic engine. ([n8n Docs](https://docs.n8n.io/))

## Important design rule

n8n should not own:

- dedupe logic
- score calculations
- application transitions
- database truth

That belongs in NestJS.

---

## 17. Config Design

Create structured config modules.

## Environment variables

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=job_assistant

OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5

INGESTION_SECRET=...
INTERNAL_API_KEY=...

ENABLE_SWAGGER=true
ENABLE_SCORE_ON_INGEST=true
ENABLE_NOTIFICATIONS=false
```

## Config files

- `app.config.ts`
- `database.config.ts`
- `openai.config.ts`
- `feature-flags.config.ts`

Use `@nestjs/config` and validate env values centrally. Nest’s documentation explicitly provides configuration as a core technique area, and keeping this centralized will matter as soon as you add AI, background processing, and source integrations. ([NestJS Documentation](https://docs.nestjs.com/))

---

## 18. Error Handling

Create a consistent error strategy.

## Error classes

- `SourceNotFoundException`
- `JobIngestionValidationException`
- `JobDuplicateConflictException`
- `ScoringFailedException`
- `DraftGenerationFailedException`
- `InvalidStateTransitionException`

## Global exception filter

Return uniform shape:

```json
{
  "statusCode": 400,
  "message": "Validation failed for ingested job payload",
  "errorCode": "JOB_INGESTION_VALIDATION_FAILED",
  "details": {}
}
```

---

## 19. Logging

Use structured logging.

At minimum log:

- source sync started/ended
- number of jobs received
- number inserted/updated/skipped
- scoring success/failure
- application status changes
- draft generation calls
- admin-triggered actions

Every ingestion request should emit a correlation ID or request ID.

---

## 20. Validation and Sanitization

Use:

- DTO validation with `class-validator`
- transformation with `class-transformer`
- string trimming/normalization
- HTML stripping from job descriptions if source provides markup
- enum normalization
- consistent null handling

Normalize location and title fields before dedupe.

---

## 21. Security

For v1:

- internal ingestion endpoints protected by API key or secret header
- admin endpoints protected
- rate limit ingestion endpoints
- do not expose raw provider secrets
- sanitize AI prompt input
- log source identifiers, not sensitive tokens

Nest docs include security topics like authentication, authorization, throttling/rate limiting, and validation, all of which are relevant once you expose ingestion or admin endpoints. ([NestJS Documentation](https://docs.nestjs.com/))

---

## 22. Migrations

Since you are on TypeORM, use migrations from day one.

Rules:

- no `synchronize: true` in non-trivial development beyond initial experiments
- every entity change becomes a migration
- seed candidate profile separately
- seed default sources separately

TypeORM’s docs explicitly call out migrations and schema support as first-class capabilities, so there is no excuse for freestyle schema drift. ([TypeORM](https://typeorm.io/))

---

## 23. Seed Data

Create seed scripts for:

### Candidate profile seed

- target titles
- Germany / Netherlands preference
- Node.js / NestJS / TypeScript profile
- experience years
- remote/hybrid preferences
- master resume text placeholder

### Source seed

- manual
- webhook
- greenhouse-demo
- lever-demo

---

## 24. Service Design

## `JobsService`

Responsibilities:

- create/update job
- list jobs
- get job details
- archive job
- query by filters

## `JobsDedupeService`

Responsibilities:

- compute dedupe key
- compute content hash
- resolve existing duplicates
- choose update path

## `JobIngestionService`

Responsibilities:

- validate incoming payload
- source lookup
- map ingestion DTO to entity input
- upsert via jobs service
- emit scoring request

## `JobScoringService`

Responsibilities:

- deterministic scoring
- AI scoring orchestration
- save score
- rescore jobs

## `ApplicationsService`

Responsibilities:

- create application record if missing
- update status
- add notes
- shortlist
- mark applied

## `DraftsService`

Responsibilities:

- generate requested asset type
- store/regenerate draft
- return latest draft set

---

## 25. Query Design

Your list endpoint will likely need joins across:

- jobs
- job_scores
- applications
- sources

So create a dedicated `JobsQueryService` rather than dumping everything into `JobsService`.

This service should support:

- pagination
- sorting
- filter composition
- partial text search
- score threshold filters

You may use TypeORM QueryBuilder for this. TypeORM’s documentation explicitly highlights QueryBuilder for more complex joins, pagination, and query composition, which is a good fit for dashboard-style filtered listings. ([TypeORM](https://typeorm.io/))

---

## 26. Suggested Initial Response Shapes

## Job list item response

```json
{
  "id": "uuid",
  "companyName": "Example GmbH",
  "title": "Backend Engineer",
  "countryNormalized": "Germany",
  "cityNormalized": "Berlin",
  "workplaceType": "hybrid",
  "sourceSlug": "greenhouse-demo",
  "postedAt": "2026-04-15T10:00:00.000Z",
  "overallScore": 8.4,
  "applicationStatus": "shortlisted",
  "visaSponsorshipSignal": true
}
```

## Job detail response

```json
{
  "id": "uuid",
  "companyName": "Example GmbH",
  "title": "Backend Engineer",
  "descriptionText": "...",
  "requirementsText": "...",
  "score": {
    "overallScore": 8.4,
    "titleMatchScore": 8.5,
    "stackMatchScore": 9.2,
    "locationMatchScore": 9.0,
    "experienceMatchScore": 7.5,
    "visaSignalScore": 8.0,
    "redFlags": ["German language preferred"],
    "strengths": ["Strong Node.js match", "Country preference match"]
  },
  "application": {
    "status": "shortlisted",
    "manualNotes": "Looks strong, needs CV tweak"
  }
}
```

---

## 27. Development Phases

## Phase 1 — Foundation

Implement:

- database config
- entities
- migrations
- seeds
- source management
- candidate profile management
- ingestion endpoints
- jobs listing
- applications basic state

## Phase 2 — Dedupe + deterministic scoring

Implement:

- dedupe service
- content hash logic
- rule-based scoring
- score persistence
- score filter on job list

## Phase 3 — AI scoring

Implement:

- OpenAI integration service
- structured prompt
- JSON response validation
- score explanation

## Phase 4 — Draft generation

Implement:

- tailored summary
- CV bullets
- recruiter message
- cover note

## Phase 5 — n8n integration

Implement:

- secure ingestion endpoint usage
- source-specific workflow docs
- daily digest flow

## Phase 6 — polish

Implement:

- richer analytics
- rescore jobs
- stale job cleanup
- notification reminders
- optional company-level grouping

---

## 28. Suggested Cloud Code Execution Plan

You said you want something Cloud Code can drive step by step. Here is the order I would instruct it to follow.

### Step 1

Set up:

- TypeORM connection
- base config
- database module
- global validation pipe
- Swagger if you want internal API docs

### Step 2

Implement entities:

- `JobSource`
- `CandidateProfile`
- `Job`
- `JobScore`
- `Application`
- optional `DraftAsset`

### Step 3

Generate migrations and seed scripts.

### Step 4

Implement modules:

- `sources`
- `candidate-profile`
- `jobs`
- `applications`

### Step 5

Implement `job-ingestion` module with:

- `POST /job-ingestion/single`
- `POST /job-ingestion/bulk`

### Step 6

Implement dedupe and basic scoring.

### Step 7

Implement AI scoring and draft generation.

### Step 8

Write a simple n8n workflow spec document.

---

## 29. Cloud Code Prompt You Can Use

Paste this into Cloud Code:

```text
We are repurposing this existing NestJS backend into a Job Discovery and Application Assistant backend.

Tech stack:
- NestJS
- TypeORM
- PostgreSQL
- TypeScript
- class-validator
- class-transformer

Architecture direction:
- NestJS is the source of truth for all business logic.
- n8n will only be used later as an orchestration tool for scheduled source syncing.
- We are not automating LinkedIn submissions or browser actions.
- We are building ingestion, normalization, deduplication, scoring, application tracking, and AI draft generation.

Please implement this in phases with production-quality structure.

Phase 1 requirements:
1. Create modules:
   - sources
   - candidate-profile
   - jobs
   - job-ingestion
   - applications
2. Create TypeORM entities:
   - JobSource
   - CandidateProfile
   - Job
   - JobScore
   - Application
   - DraftAsset (optional if easy, otherwise defer)
3. Use Data Mapper style, not Active Record.
4. Add enums for source type, workplace type, employment type, seniority, and application status.
5. Add migrations for all entities.
6. Add seed scripts for:
   - default candidate profile
   - default sources
7. Implement DTO validation for ingestion endpoints.
8. Implement endpoints:
   - GET /candidate-profile
   - PATCH /candidate-profile
   - GET /sources
   - POST /sources
   - PATCH /sources/:id
   - GET /jobs
   - GET /jobs/:id
   - GET /applications
   - PATCH /applications/:id/status
   - POST /job-ingestion/single
   - POST /job-ingestion/bulk
9. Implement dedupe helpers but keep scoring simple for now.
10. Add clean folder structure with controllers/services/entities/dto/repositories.

Important rules:
- Keep entities simple.
- Keep business logic inside services.
- Normalize ingestion payloads before persistence.
- Prepare jobs table for future AI scoring and draft generation.
- Do not add auth complexity unless necessary.
- Use clear naming and comments where helpful.
- Do not overengineer.

After implementing Phase 1, stop and summarize what was created and what remains for Phase 2.
```

---

## 30. My Strong Recommendation

Do **not** ask Cloud Code to build everything in one shot.

That is how you wake up to:

- 19 services nobody asked for
- an `AbstractGenericBaseManagerFactory`
- and a bug so spiritual it no longer reproduces on Earth

Make it build this backend in phases.

---

## 31. Best Immediate Next Step

Your immediate next step should be:

**Have Cloud Code implement Phase 1 only: entities, migrations, modules, and ingestion endpoints.**

Once that exists, I would help you with:

- the exact TypeORM entity definitions
- the dedupe logic
- and the Phase 2 scoring design

If you want, I can do the next piece as a **Phase 1.1 implementation pack** with:

- exact entity code
- enum code
- DTO code
- and recommended migration naming.

Important implementation note:

This backend already has an existing structure and setup. Follow the folder structure, architecture, naming conventions, module organization, shared patterns, and TypeORM conventions already present in the codebase.

Do not redesign the project structure.
Do not introduce unnecessary abstractions.
Do not create parallel patterns when an existing one already exists.

This project is being repurposed into a Job Discovery and Application Assistant backend, so the implementation should fit into the current codebase as naturally as possible.

Guiding rules:

- If the codebase already has a pattern, reuse it.
- If a detail is not explicitly decided, choose the best possible practical approach.
- Prefer clean, production-ready, low-complexity solutions.
- Keep the implementation consistent, extensible, and easy to continue step by step.

Where there is ambiguity, make the best engineering decision without blocking progress, as long as it remains aligned with the existing project structure and conventions.