Integration Plan: Synthetic Visa Applications into AMS Dashboard

 Overview

 Integrate 1000 synthetic visa applications from openvisa-synthetic-data into the ams-official Officers
 dashboard with proper officer specialization routing.

 Current State

 Synthetic Data Generator (openvisa-synthetic-data)

 - Generates JSON applications with 6 visa types
 - Output: output_demo/applications/*.json (1000 files)
 - Schema: application_id, visa_type, applicant, documents, visa_specific_data

 AMS Dashboard (ams-official)

 - Uses mock data (no real backend)
 - Has API contracts defined in src/api-contracts/
 - ConsulateOfficial already has specializations?: string[] field
 - LiveQueue → Assignment → Reviewer Queue → Decision flow

 Schema Transformation Required
 ┌──────────────────────────────────┬─────────────────────────────────────────────┐
 │          Synthetic Data          │              Dashboard Schema               │
 ├──────────────────────────────────┼─────────────────────────────────────────────┤
 │ application_id                   │ id                                          │
 ├──────────────────────────────────┼─────────────────────────────────────────────┤
 │ visa_type (e.g., "student_visa") │ visaType + visaTypeId                       │
 ├──────────────────────────────────┼─────────────────────────────────────────────┤
 │ applicant.first_name + last_name │ applicantName                               │
 ├──────────────────────────────────┼─────────────────────────────────────────────┤
 │ applicant.nationality            │ country (needs ISO code mapping)            │
 ├──────────────────────────────────┼─────────────────────────────────────────────┤
 │ documents[]                      │ sections.passport, sections.financial, etc. │
 ├──────────────────────────────────┼─────────────────────────────────────────────┤
 │ visa_specific_data               │ Merged into relevant sections               │
 ├──────────────────────────────────┼─────────────────────────────────────────────┤
 │ scenario                         │ Derives flags[] and risk level              │
 └──────────────────────────────────┴─────────────────────────────────────────────┘
 ---
 Implementation Plan

 Phase 1: Data Layer (src/data/)

 1.1 Create Transformer - src/data/synthetic/transformer.ts
 - Map synthetic schema → LiveApplication (list view)
 - Map synthetic schema → ApplicationDetail (detail view)
 - Convert documents → sections format
 - Derive flags from scenario/fraud_patterns
 - Map nationality → ISO country codes

 1.2 Create Data Provider Interface - src/data/providers/index.ts
 interface ApplicationDataProvider {
   getApplications(filters, pagination): Promise<PaginatedResponse<LiveApplication>>
   getApplicationById(id): Promise<ApplicationDetail | null>
   assignApplication(appId, officerId): Promise<void>
   getOfficers(): Promise<ConsulateOfficial[]>
   getOfficersBySpecialization(visaType): Promise<ConsulateOfficial[]>
 }

 1.3 JSON Provider - src/data/providers/json-provider.ts
 - Loads synthetic JSONs from filesystem
 - Caches transformed applications in memory
 - Handles filtering, pagination, assignment state
 - Can switch to Prisma provider later via env var

 Phase 2: Officer Specializations

 2.1 Define Officer Seed Data - src/data/seed/officers.ts
 Uma Mirza (Senior)      → Student, Skilled Worker
 Ricardo Martinez        → Skilled Worker, Senior Specialist
 Ken Scott              → Spouse/Partner, Global Talent
 Marie Lovett           → Student
 Kerry Henderson (Senior) → Global Talent, Innovator
 Belinda O'Reilly       → Spouse/Partner, Student
 Evica Key (Trainee)    → [no specialization - overflow]

 2.2 Update Mock Officers - src/lib/mockdata-livequeue.ts
 - Add specializations: string[] to each officer

 Phase 3: API Routes

 3.1 Applications API - src/app/api/applications/route.ts
 - GET: List with filters (status, visaType, country, assignedTo)
 - Replace mock data with provider calls

 3.2 Application Detail API - src/app/api/applications/[id]/route.ts
 - GET: Full application detail
 - PATCH: Update status

 3.3 Officers API - src/app/api/officers/route.ts
 - GET: List officers with specializations and workload

 3.4 Assignment API - src/app/api/assignments/route.ts
 - POST: Bulk assign applications to officer
 - GET /suggest: Auto-suggest officer based on visa type match + workload

 Phase 4: Assignment Logic

 4.1 Auto-Assignment Engine - src/services/assignment/auto-assign.ts
 suggestOfficer(applicationId):
   1. Get application's visa type
   2. Find officers with matching specialization
   3. Score by: workload (lower=better), SLA compliance, avg processing time
   4. Return top suggestion + alternatives

 4.2 Assignment Rules
 - Match visa type to officer specialization
 - Prefer officers with lower active workload
 - Trainee officers only for overflow
 - Track assignment method: "auto" | "manual"

 Phase 5: Frontend Updates

 5.1 LiveQueue Page - src/app/dashboard/livequeue/page.tsx
 - Replace useState(mockLiveQueue) with API fetch
 - Add "Auto-Assign" button for bulk assignment suggestions
 - Show officer specialization badges

 5.2 Assignment Modal - New component
 - Show suggested officer with reason
 - Allow override selection
 - Display officer workload/specialization

 5.3 Reviewer Queue - src/app/dashboard/reviewer/queue/page.tsx
 - Fetch assigned applications from API
 - Filter by current officer

 5.4 Application Detail - src/app/dashboard/reviewer/[applicationId]/page.tsx
 - Fetch full ApplicationDetail from API
 - Display transformed sections

 ---
 File Changes Summary

 New Files (ams-official)

 src/data/
 ├── synthetic/
 │   ├── transformer.ts       # Schema transformation
 │   ├── types.ts            # Synthetic data types
 │   └── country-codes.ts    # Nationality → ISO mapping
 ├── providers/
 │   ├── index.ts            # Provider interface
 │   └── json-provider.ts    # JSON file provider
 └── seed/
     └── officers.ts         # Officer specialization data

 src/services/
 └── assignment/
     ├── index.ts            # Assignment service
     └── auto-assign.ts      # Auto-assignment logic

 src/app/api/
 ├── applications/
 │   ├── route.ts            # GET applications list
 │   └── [id]/route.ts       # GET/PATCH single application
 ├── officers/
 │   └── route.ts            # GET officers list
 └── assignments/
     ├── route.ts            # POST bulk assign
     └── suggest/route.ts    # GET assignment suggestion

 src/components/dashboard/
 └── AssignmentModal.tsx     # Officer assignment UI

 Modified Files (ams-official)

 src/lib/mockdata-livequeue.ts  # Add specializations to officers
 src/app/dashboard/livequeue/page.tsx  # Use API instead of mock
 src/app/dashboard/reviewer/queue/page.tsx  # Use API
 src/app/dashboard/reviewer/[applicationId]/page.tsx  # Use API

 ---
 Environment Configuration

 # .env.local
 DATA_PROVIDER=json
 SYNTHETIC_DATA_PATH=../openvisa-synthetic-data/output_demo

 ---
 Verification Steps

 1. Data Loading: Run provider initialization, verify 1000 applications loaded
 2. Transformation: Check sample applications have correct sections structure
 3. LiveQueue: Navigate to /dashboard/livequeue, verify applications display
 4. Filtering: Test visa type filter matches expected distribution
 5. Assignment: Select applications, click "Suggest", verify officer matching
 6. Detail View: Click application, verify all sections render
 7. Officer Specialization: Verify correct officers suggested per visa type

 ---
 Implementation Order

 Step 1: Data Layer Foundation

 1. Create src/data/synthetic/types.ts - TypeScript types for synthetic data
 2. Create src/data/synthetic/country-codes.ts - Nationality to ISO mapping
 3. Create src/data/synthetic/transformer.ts - Main transformation logic
 4. Create src/data/providers/index.ts - Provider interface
 5. Create src/data/providers/json-provider.ts - JSON file provider

 Step 2: Officer Specializations

 1. Update src/lib/mockdata-livequeue.ts - Add specializations to mock officers
 2. Create src/data/seed/officers.ts - Officer seed data with specializations

 Step 3: API Routes

 1. Create src/app/api/applications/route.ts - List endpoint
 2. Create src/app/api/applications/[id]/route.ts - Detail endpoint
 3. Create src/app/api/officers/route.ts - Officers list
 4. Create src/app/api/assignments/route.ts - Bulk assignment
 5. Create src/app/api/assignments/suggest/route.ts - Auto-suggest

 Step 4: Assignment Engine

 1. Create src/services/assignment/auto-assign.ts - Suggestion algorithm

 Step 5: Frontend Integration

 1. Update LiveQueue page to use API
 2. Create AssignmentModal component
 3. Update Reviewer queue page
 4. Update Application detail page

 ---
 Future: Database Migration

 When ready to move to PostgreSQL:
 1. Run Prisma migrations (add Application, Officer, Assignment models)
 2. Create Prisma provider implementing same interface
 3. Run migration script to import JSON data to DB
 4. Switch DATA_PROVIDER=prisma in env
 5. No frontend changes required (same API contracts)
