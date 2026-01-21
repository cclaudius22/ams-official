# Synthetic Data Integration - Developer Documentation

## Overview

This document describes the integration of 1000 synthetic visa applications from `openvisa-synthetic-data` into the AMS Officers Dashboard. The integration uses a JSON provider for demo mode, with architecture designed to support future PostgreSQL migration.

**Last Updated:** 2026-01-18

---

## Recent Changes (2026-01-18)

### Officer Context & Switcher (Completed)

Added demo-only officer switcher for testing multi-officer workflows:

- **`src/contexts/OfficerContext.tsx`** - React context for current officer selection
- **`src/components/dashboard/OfficerSwitcher.tsx`** - Dropdown to switch between officers
- Persists selection in localStorage
- Header/sidebar updates to show selected officer name

### Auto-Assign Fix (Completed)

Fixed auto-assign functionality that broke after officer switcher changes:

- Added comprehensive debug logging throughout auto-assign flow
- Verified visa type IDs match between synthetic data and officer specializations
- All 8 officers now receive applications based on their specializations

### Enhanced Data Transformer (Completed)

The transformer now creates many more sections to populate the application detail view:

**Sections created for ALL visa types:**
| Section | Description |
|---------|-------------|
| `passport` | Passport information from applicant data |
| `kyc` | Simulated KYC with liveness/face match scores |
| `financial` | Bank statement data |
| `residency` | Applicant's current address |
| `photo` | Visa photo with compliance checks |

**Additional sections by visa type:**

| Visa Type | Additional Sections |
|-----------|-------------------|
| Student | `study`, `cas`, `englishProficiency` |
| Skilled Worker | `professional`, `sponsorshipAndRole` |
| Senior Specialist | `professional`, `sponsorshipAndRole` |
| Global Talent | `professional` |
| Spouse/Partner | `family` |
| Innovator | `business` |

### Reviewer Queue Integration (Completed)

- Reviewer queue now fetches real applications assigned to selected officer
- Application detail page loads full synthetic data from API
- Rachel Johnson (demo officer) still shows mock data for comparison

---

## Architecture

```
openvisa-synthetic-data/
├── output_demo/
│   └── applications/           # 1000 JSON files (APP-*.json)
│       └── APP-20260117-*.json
│
ams-official/
├── src/
│   ├── contexts/
│   │   └── OfficerContext.tsx  # Officer selection context (NEW)
│   │
│   ├── data/
│   │   ├── synthetic/          # Data transformation layer
│   │   │   ├── types.ts        # TypeScript types for synthetic data
│   │   │   ├── country-codes.ts # Nationality → ISO mapping
│   │   │   └── transformer.ts  # Synthetic → Dashboard schema (ENHANCED)
│   │   ├── providers/          # Data provider abstraction
│   │   │   ├── index.ts        # Provider interface + factory
│   │   │   └── json-provider.ts # JSON file implementation
│   │   └── seed/
│   │       └── officers.ts     # Officer data with specializations
│   │
│   ├── services/
│   │   └── assignment/
│   │       ├── index.ts
│   │       └── auto-assign.ts  # Assignment scoring (with debug logging)
│   │
│   ├── app/api/
│   │   ├── applications/
│   │   │   ├── route.ts        # GET /api/applications
│   │   │   └── [id]/route.ts   # GET/PATCH /api/applications/:id
│   │   ├── officers/
│   │   │   └── route.ts        # GET /api/officers
│   │   └── assignments/
│   │       ├── route.ts        # POST /api/assignments (bulk)
│   │       ├── suggest/route.ts # GET /api/assignments/suggest
│   │       └── auto-assign-all/route.ts # POST auto-assign (with debug logging)
│   │
│   └── components/dashboard/
│       ├── AssignmentModal.tsx # Officer assignment UI
│       ├── OfficerSwitcher.tsx # Demo officer dropdown (NEW)
│       ├── DashboardHeader.tsx # Uses OfficerContext (UPDATED)
│       └── SidebarNavigation.tsx # Uses OfficerContext (UPDATED)
```

---

## Environment Configuration

Add to `.env`:

```env
# Data Provider Configuration
# Options: 'json' (development) or 'prisma' (production)
DATA_PROVIDER=json

# Path to synthetic data (relative to project root)
SYNTHETIC_DATA_PATH=../openvisa-synthetic-data/output_demo
```

---

## API Endpoints

### GET /api/applications

List applications with filters and pagination.

**Query Parameters:**
- `search` - Search by ID or applicant name
- `status` - Filter by status (comma-separated)
- `visaType` - Filter by visa type (comma-separated)
- `country` - Filter by country code (comma-separated)
- `assignedTo` - Filter by officer ID (comma-separated)
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [...],          // Array of LiveApplication
  "total": 1000,
  "page": 1,
  "pageSize": 10,
  "totalPages": 100
}
```

### GET /api/applications/:id

Get full application detail including AI scan result.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "APP-20260117-000D602A",
    "applicantName": "Chidinma Adeyemi",
    "visaType": "Skilled Worker Visa",
    "visaTypeId": "skilled_worker_visa",
    "status": "Pending Assignment",
    "sections": {
      "passport": {...},
      "financial": {...},
      "kyc": {...},
      "professional": {...}
    },
    "scanResult": {
      "status": "completed",
      "isValid": true,
      "score": 85,
      "issues": [...],
      "recommendations": [...]
    }
  }
}
```

### GET /api/officers

List officers with specializations and workload stats.

**Query Parameters:**
- `visaType` - Filter by visa type specialization

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "officer-1",
      "firstName": "Uma",
      "lastName": "Mirza",
      "role": "senior_officer",
      "specializations": ["student_visa", "skilled_worker_visa"],
      "activeApplications": 12,
      "slaCompliance": 96,
      "avgProcessingTime": 35
    }
  ]
}
```

### GET /api/assignments/suggest

Get AI-powered officer suggestion for an application.

**Query Parameters:**
- `applicationId` - The application ID (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestedOfficer": {...},
    "reason": "Specializes in this visa type. Excellent SLA compliance.",
    "alternatives": [...],
    "confidence": 0.98
  }
}
```

### POST /api/assignments/auto-assign-all

Automatically assign ALL unassigned applications to officers based on specialization matching.

**Request:** No body required (POST with empty body)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProcessed": 1000,
    "assigned": 998,
    "failed": 2,
    "byOfficer": {
      "officer-1": { "name": "Uma Mirza", "count": 245, "visaTypes": ["Student Visa", "Skilled Worker Visa"] },
      "officer-2": { "name": "Ricardo Martinez", "count": 180, "visaTypes": ["Skilled Worker Visa"] }
    },
    "byVisaType": {
      "Student Visa": { "count": 350, "officer": "Uma Mirza" }
    },
    "errors": []
  }
}
```

### POST /api/assignments

Bulk assign applications to an officer.

**Request Body:**
```json
{
  "applicationIds": ["APP-123", "APP-456"],
  "officerId": "officer-1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "results": [...]
  }
}
```

---

## Visa Types & Officer Specializations

### Supported Visa Types

| Visa Type ID | Display Name | Category |
|--------------|--------------|----------|
| `student_visa` | Student Visa | Student |
| `skilled_worker_visa` | Skilled Worker Visa | Work |
| `senior_specialist_worker_visa` | Senior Specialist Worker Visa | Work |
| `global_talent_visa` | Global Talent Visa | Work |
| `spouse_partner_visa` | Spouse/Partner Visa | Family |
| `innovator_founder_visa` | Innovator Founder Visa | Business |

### Officer Specializations

| Officer | Role | Specializations |
|---------|------|-----------------|
| Uma Mirza | Senior Officer | Student, Skilled Worker |
| Ricardo Martinez | Officer | Skilled Worker, Senior Specialist |
| Ken Scott | Officer | Spouse/Partner, Global Talent |
| Marie Lovett | Officer | Student |
| Kerry Henderson | Senior Officer | Global Talent, Innovator |
| Belinda O'Reilly | Officer | Spouse/Partner, Student |
| Evica Key | Trainee | (overflow - no specialization) |

---

## Assignment Algorithm

The auto-assignment engine scores officers based on:

```typescript
function calculateAssignmentScore(officer, visaType) {
  let score = 50; // Base score

  // Specialization match (+30 points)
  if (officer.specializations.includes(visaType)) {
    score += 30;
  }

  // Workload factor (lower is better, up to -20 points)
  const workloadRatio = officer.activeApplications / 50;
  score -= workloadRatio * 20;

  // SLA compliance bonus (up to +15 points)
  score += (officer.slaCompliance / 100) * 15;

  // Processing time factor (faster is better, up to +10 points)
  const processingRatio = officer.avgProcessingTime / 60;
  score += (1 - processingRatio) * 10;

  // Activity bonus (+5 points)
  if (officer.completedToday > 0) {
    score += 5;
  }

  // Senior officer bonus for complex visas (+5 points)
  if (officer.role === 'senior_officer' && isComplexVisa(visaType)) {
    score += 5;
  }

  return score; // 0-100
}
```

---

## Data Transformation

### Synthetic → LiveApplication

```typescript
// Input: SyntheticApplication (from JSON)
{
  application_id: "APP-20260117-000D602A",
  visa_type: "skilled_worker_visa",
  applicant: {
    first_name: "Chidinma",
    last_name: "Adeyemi",
    nationality: "Nigeria"
  },
  application_date: "2026-01-17T12:59:30.705488",
  scenario: "legitimate",
  fraud_patterns: []
}

// Output: LiveApplication (for dashboard)
{
  id: "APP-20260117-000D602A",
  applicantName: "Chidinma Adeyemi",
  country: "ng",                        // ISO code from nationality
  visaType: "Skilled Worker Visa",      // Display name
  category: "Work",
  submittedAt: "5h ago",                // Relative time
  status: "Pending Assignment",
  flags: []                             // Derived from scenario
}
```

### Scenario → Flags Mapping

| Scenario | Flags Generated |
|----------|-----------------|
| `legitimate` | (none) |
| `minor_issues` | "Needs Review" |
| `major_issues` | "High Risk" |
| `fraudulent` | "Potential Fraud" + fraud pattern names |

---

## AI Scan Results

Scan results are generated based on the application scenario:

| Scenario | isValid | Score Range | Issues |
|----------|---------|-------------|--------|
| `legitimate` | true | 80-100 | None or minor |
| `minor_issues` | true | 60-80 | 1-2 warnings |
| `major_issues` | false | 40-60 | 2-3 warnings/errors |
| `fraudulent` | false | 0-40 | Critical issues |

---

## Frontend Components

### LiveQueue Page (`/dashboard/livequeue`)

- Fetches applications from `/api/applications`
- Fetches officers from `/api/officers`
- Supports filtering by status, visa type, country
- Pagination: 20 items per page
- Selection for bulk assignment

### AssignmentModal

- Shows list of available officers with specializations
- Calls `/api/assignments/suggest` for AI recommendation
- Displays confidence score and reasoning
- Handles bulk assignment via `/api/assignments`

---

## Known Issues & TODOs

### Current Limitations

1. **In-Memory State**: Assignments are lost on server restart (JSON provider stores in memory)
2. **Demo Officer Exception**: Rachel Johnson shows hardcoded mock data instead of real synthetic data

### Completed

- [x] Auto-assignment via "Auto-Assign All" button in Live Queue
- [x] Officer switcher for testing different officer views
- [x] Enhanced transformer with complete section data
- [x] Reviewer queue integration with real synthetic data
- [x] Application detail page shows full synthetic data

### Future Enhancements

1. [ ] Implement Prisma provider for PostgreSQL persistence
2. [ ] Add WebSocket for real-time queue updates
3. [ ] Add filtering by date range
4. [ ] Export functionality (CSV/PDF)
5. [ ] Remove Rachel Johnson mock data exception
6. [ ] Add `travel`, `travelInsurance`, `documents`, `visas` sections to transformer

---

## Testing

### Verify Data Loading

```bash
# Check applications API returns 1000 total
curl -s "http://localhost:3000/api/applications" | jq '.total'
# Expected: 1000

# Check officers API
curl -s "http://localhost:3000/api/officers" | jq 'length'
# Expected: 7

# Test assignment suggestion
curl -s "http://localhost:3000/api/assignments/suggest?applicationId=APP-20260117-000D602A" | jq '.data.suggestedOfficer.firstName'
# Expected: "Uma" (for skilled_worker_visa)
```

### Verify Specialization Matching

```bash
# Global Talent visa should suggest Kerry Henderson
curl -s "http://localhost:3000/api/assignments/suggest?applicationId=APP-20260117-012540F4" | jq '.data.suggestedOfficer.firstName'
# Expected: "Kerry"
```

---

## File Reference

### Data Layer

| File | Purpose |
|------|---------|
| `src/data/synthetic/types.ts` | TypeScript interfaces for synthetic JSON schema |
| `src/data/synthetic/country-codes.ts` | Nationality → ISO mapping, visa display names |
| `src/data/synthetic/transformer.ts` | Transform synthetic → dashboard schema |
| `src/data/providers/index.ts` | Provider interface + singleton factory |
| `src/data/providers/json-provider.ts` | JSON file loader with in-memory caching |
| `src/data/seed/officers.ts` | Officer definitions with specializations |

### API Routes

| Route | File |
|-------|------|
| GET /api/applications | `src/app/api/applications/route.ts` |
| GET/PATCH /api/applications/:id | `src/app/api/applications/[id]/route.ts` |
| GET /api/officers | `src/app/api/officers/route.ts` |
| POST /api/assignments | `src/app/api/assignments/route.ts` |
| GET /api/assignments/suggest | `src/app/api/assignments/suggest/route.ts` |

### Services

| File | Purpose |
|------|---------|
| `src/services/assignment/auto-assign.ts` | Officer scoring and suggestion algorithm |

### Components

| File | Purpose |
|------|---------|
| `src/components/dashboard/AssignmentModal.tsx` | Officer assignment dialog |
| `src/app/dashboard/livequeue/page.tsx` | Main queue page (updated to use APIs) |

---

## Troubleshooting

### "Cannot read properties of undefined (reading 'length')"

**Cause:** API response format mismatch. The API returns `data` as array directly, not `data.items`.

**Fix:** In fetchApplications, use `setApplications(data.data)` not `setApplications(data.data.items)`.

### "Only 10 applications showing"

**Cause:** Default pagination pageSize is 10. The frontend shows 20 per page but API returns 10.

**Fix:** Update API call to include `?pageSize=1000` or implement proper pagination in frontend.

### "Officers show 'name' error"

**Cause:** ConsulateOfficial type has `firstName`/`lastName`, not `name`.

**Fix:** Use template literal: `` `${officer.firstName} ${officer.lastName}` ``

---

## Related Documentation

- **[AI Queue Orchestrator Roadmap](./ai-queue-orchestrator-roadmap.md)** - Future vision for RBAC, officer management, and AI-assisted queue orchestration with Camunda integration.

---

## Quick Start

1. Generate synthetic data:
```bash
cd openvisa-synthetic-data
python src/generator.py --count 1000 --output ./output_demo --seed 42
```

2. Configure environment:
```bash
cd ams-official
echo 'DATA_PROVIDER=json' >> .env
echo 'SYNTHETIC_DATA_PATH=../openvisa-synthetic-data/output_demo' >> .env
```

3. Start development server:
```bash
npm run dev
```

4. Visit `http://localhost:3000/dashboard/livequeue`
