# Backend Integration Guide

> **Last Updated:** January 2025
> **Frontend Stack:** Next.js 16.1.1, React 19.2.3, TypeScript, Bun
> **Target Backend:** GCP + PostgreSQL

---

## Table of Contents

1. [Overview](#overview)
2. [Current Frontend State](#current-frontend-state)
3. [API Contracts Location](#api-contracts-location)
4. [Endpoint Specifications](#endpoint-specifications)
5. [Database Schema](#database-schema)
6. [Authentication Requirements](#authentication-requirements)
7. [Implementation Priority](#implementation-priority)
8. [Response Format Standards](#response-format-standards)
9. [Error Handling](#error-handling)
10. [Testing the Integration](#testing-the-integration)

---

## Overview

The AMS (Application Management System) frontend is a visa processing dashboard built with Next.js. It currently operates on **mock data** and needs to be connected to a real GCP + PostgreSQL backend.

This document outlines:
- What the frontend expects from the API
- The TypeScript contracts defining request/response shapes
- Database schema recommendations
- Implementation priorities

---

## Current Frontend State

### What's Built (Frontend)
- Live Queue dashboard with filtering, pagination, and bulk assignment
- Live Intelligence analytics with charts and SLA tracking
- Visa Officer reviewer interface with decision workflows
- Application detail views with AI scan results
- Team collaboration with tasks and notes
- Super Admin user management

### What's Using Mock Data
| Page | Mock Data Source |
|------|------------------|
| `/dashboard/livequeue` | `src/lib/mockdata-livequeue.ts` |
| `/dashboard/live-intelligence` | Generated in `useVisaMetrics` hook |
| `/dashboard/reviewer` | `src/lib/mockdata.ts` |
| `/dashboard/reviewer/queue` | Inline mock data |
| `/dashboard/teams` | Inline mock data |

### Existing API Routes (Stubs)
- `POST /api/super-admin` - Creates super admin (returns mock response)
- `GET /api/livequeue` - Returns filtered mock data
- `POST /api/livequeue` - Placeholder for batch operations

---

## API Contracts Location

All TypeScript interfaces are defined in:

```
src/api-contracts/
├── index.ts          # Barrel export
├── common.ts         # Shared types (ApiResponse, Pagination)
├── applications.ts   # Application CRUD & queue
├── reviews.ts        # Decision workflows
├── metrics.ts        # Analytics & SLA
├── users.ts          # User management
└── teams.ts          # Collaboration
```

### Importing Contracts

```typescript
// Backend team can copy these types to their codebase
import type {
  LiveApplication,
  GetApplicationsResponse,
  ApprovalRequest,
  DecisionResult
} from '@/api-contracts'
```

---

## Endpoint Specifications

### Applications API

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/applications` | List applications (paginated) | `ApplicationFilters & PaginationParams` | `PaginatedResponse<LiveApplication>` |
| `GET` | `/api/applications/:id` | Get single application | - | `ApiResponse<ApplicationDetail>` |
| `GET` | `/api/applications/stats` | Queue statistics | - | `ApiResponse<LiveQueueStats>` |
| `PATCH` | `/api/applications/:id/status` | Update status | `UpdateStatusRequest` | `ApiResponse<{ updated: boolean }>` |
| `POST` | `/api/applications/bulk-assign` | Bulk assign to officer | `BulkAssignRequest` | `ApiResponse<{ assignedCount: number }>` |
| `GET` | `/api/applications/:id/scan` | Get AI scan results | - | `ApiResponse<AIScanResult>` |
| `POST` | `/api/applications/:id/scan/trigger` | Trigger new scan | - | `ApiResponse<{ scanId: string }>` |

#### Example: GET /api/applications

**Request Query Parameters:**
```
?page=1
&pageSize=10
&search=john
&status=In Progress,Pending
&visaType=Tourist
&country=eg,us
&assignedTo=officer-123
```

**Response:**
```json
{
  "data": [
    {
      "id": "VK-2024-1835",
      "applicantName": "John Doe",
      "country": "eg",
      "visaType": "Tourist, 30 Days",
      "category": "Type C",
      "submittedAt": "2024-01-15T10:30:00Z",
      "status": "In Progress",
      "assignedTo": {
        "id": "officer-123",
        "name": "Sarah Wilson",
        "avatar": "https://..."
      },
      "flags": ["Priority", "VIP"]
    }
  ],
  "total": 156,
  "page": 1,
  "pageSize": 10,
  "totalPages": 16
}
```

---

### Reviews API (Decision Workflows)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `POST` | `/api/reviews/:applicationId/approve` | Approve application | `ApprovalRequest` | `ApiResponse<DecisionResult>` |
| `POST` | `/api/reviews/:applicationId/reject` | Reject application | `RejectionRequest` | `ApiResponse<DecisionResult>` |
| `POST` | `/api/reviews/:applicationId/escalate` | Escalate to supervisor | `EscalationRequest` | `ApiResponse<DecisionResult>` |
| `POST` | `/api/reviews/:applicationId/sections/:sectionId/decision` | Section-level decision | `SectionDecisionRequest` | `ApiResponse<SectionDecisionRecord>` |
| `POST` | `/api/reviews/:applicationId/sections/:sectionId/notes` | Add note | `AddNoteRequest` | `ApiResponse<Note>` |
| `GET` | `/api/reviews/:applicationId/history` | Decision history | - | `ApiResponse<DecisionRecord[]>` |
| `POST` | `/api/reviews/:applicationId/contact` | Log contact attempt | `ContactRequest` | `ApiResponse<ContactLog>` |

#### Example: POST /api/reviews/:applicationId/reject

**Request Body:**
```json
{
  "rationale": "Insufficient financial documentation provided. Bank statements do not cover required 6-month period.",
  "reviewerId": "officer-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "decision": "rejected",
    "decisionId": "dec-789",
    "applicationId": "VK-2024-1835",
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

#### Escalation Reasons (Enum)
```typescript
type EscalationReason =
  | 'requires_senior_review'
  | 'policy_clarification'
  | 'incomplete_information'
  | 'sanctions_list'
  | 'failed_checks'
  | 'suspected_fraud'
  | 'complex_case'
  | 'technical_issue'
```

---

### Metrics API (Analytics)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/metrics/queue` | Overall queue metrics | `ApiResponse<QueueMetrics>` |
| `GET` | `/api/metrics/processing-time` | Processing time by visa type | `ApiResponse<ProcessingTimeByType[]>` |
| `GET` | `/api/metrics/status-distribution` | Status breakdown | `ApiResponse<StatusDistribution>` |
| `GET` | `/api/metrics/sla` | SLA performance over time | `ApiResponse<SlaPerformance[]>` |
| `GET` | `/api/metrics/sla/by-type` | SLA by visa type | `ApiResponse<SlaByVisaType[]>` |
| `GET` | `/api/metrics/workload` | Officer workload | `ApiResponse<OfficerWorkload[]>` |
| `GET` | `/api/metrics/approval-rates` | Approval by country | `ApiResponse<CountryApprovalRate[]>` |
| `GET` | `/api/metrics/backlog-heatmap` | Backlog heatmap data | `ApiResponse<BacklogHeatmapData[]>` |
| `GET` | `/api/metrics/automation` | Automation vs manual | `ApiResponse<AutomationMetrics>` |
| `GET` | `/api/metrics/escalations` | Escalation analytics | `ApiResponse<EscalationMetrics>` |

#### Query Parameters for Metrics
```
?timeframe=week        # today | week | month | quarter | year
&startDate=2024-01-01  # Optional: override timeframe
&endDate=2024-01-15    # Optional: override timeframe
&groupBy=visa_type     # Optional: visa_type | team | country | date
```

---

### Users API

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/users` | List all users | `UserFilters` | `ApiResponse<User[]>` |
| `GET` | `/api/users/:id` | Get user by ID | - | `ApiResponse<User>` |
| `POST` | `/api/users` | Create user | `CreateUserRequest` | `ApiResponse<User>` |
| `PATCH` | `/api/users/:id` | Update user | `UpdateUserRequest` | `ApiResponse<User>` |
| `GET` | `/api/users/officers` | List officers with stats | - | `ApiResponse<ConsulateOfficial[]>` |
| `POST` | `/api/super-admin` | Create super admin | `CreateSuperAdminRequest` | `ApiResponse<{ userId, message }>` |
| `GET` | `/api/users/search` | Search users | `?query=&role=` | `ApiResponse<User[]>` |

#### User Roles
```typescript
type UserRole = 'super_admin' | 'senior_officer' | 'officer' | 'specialist' | 'viewer'
```

#### Clearance Levels
```typescript
type ClearanceLevel = 'CTC' | 'SC' | 'DV'
```

---

### Teams API (Collaboration)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/collaborations` | List collaborations | `CollaborationFilters` | `ApiResponse<Collaboration[]>` |
| `POST` | `/api/collaborations` | Create collaboration | `CreateCollaborationRequest` | `ApiResponse<Collaboration>` |
| `GET` | `/api/collaborations/:id` | Get collaboration | - | `ApiResponse<Collaboration>` |
| `GET` | `/api/tasks/my` | Get my tasks | - | `ApiResponse<Task[]>` |
| `POST` | `/api/tasks` | Create task | `CreateTaskRequest` | `ApiResponse<Task>` |
| `PATCH` | `/api/tasks/:id/complete` | Complete task | - | `ApiResponse<Task>` |
| `GET` | `/api/activity/team` | Team activity feed | `?limit=20` | `ApiResponse<TeamActivity[]>` |

---

## Database Schema

### Recommended PostgreSQL Tables

```sql
-- ============================================
-- CORE ENTITIES
-- ============================================

CREATE TABLE applications (
    id VARCHAR(20) PRIMARY KEY,           -- e.g., 'VK-2024-1835'
    user_id VARCHAR(50) NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    country VARCHAR(2) NOT NULL,          -- ISO country code
    visa_type VARCHAR(100) NOT NULL,
    visa_type_id VARCHAR(50),
    category VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    current_stage VARCHAR(50),
    processing_type VARCHAR(50),
    assigned_to_id VARCHAR(50) REFERENCES users(id),
    flags TEXT[],                         -- Array of flag strings
    submitted_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE application_sections (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR(20) REFERENCES applications(id),
    section_name VARCHAR(100) NOT NULL,
    status VARCHAR(50),
    validation_status VARCHAR(50),
    data JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE application_timeline (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR(20) REFERENCES applications(id),
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    user_id VARCHAR(50) REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- USERS & ASSIGNMENTS
-- ============================================

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    avatar_url TEXT,
    clearance_level VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

CREATE TABLE super_admins (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    position_title VARCHAR(100),
    clearance_authority VARCHAR(50),
    clearance_number VARCHAR(100),
    clearance_expiry DATE,
    biometric_methods TEXT[],
    allowed_ips TEXT[],
    work_hours_start TIME,
    work_hours_end TIME,
    primary_backup_admin_id VARCHAR(50) REFERENCES users(id),
    secondary_backup_admin_id VARCHAR(50) REFERENCES users(id),
    emergency_phone VARCHAR(50),
    emergency_email VARCHAR(255)
);

-- ============================================
-- DECISIONS & WORKFLOW
-- ============================================

CREATE TABLE decisions (
    id VARCHAR(50) PRIMARY KEY,
    application_id VARCHAR(20) REFERENCES applications(id),
    decision_type VARCHAR(20) NOT NULL,   -- approved, rejected, escalated
    rationale TEXT,
    reviewer_id VARCHAR(50) REFERENCES users(id),
    escalation_reasons TEXT[],
    escalated_to_id VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE section_decisions (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR(20) REFERENCES applications(id),
    section_id VARCHAR(100) NOT NULL,
    decision VARCHAR(20) NOT NULL,        -- approve, refer
    notes TEXT,
    reviewer_id VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notes (
    id VARCHAR(50) PRIMARY KEY,
    application_id VARCHAR(20) REFERENCES applications(id),
    section_id VARCHAR(100),
    content TEXT NOT NULL,
    category VARCHAR(20) NOT NULL,        -- question, concern, verification, general
    author_id VARCHAR(50) REFERENCES users(id),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by_id VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contact_logs (
    id VARCHAR(50) PRIMARY KEY,
    application_id VARCHAR(20) REFERENCES applications(id),
    contact_type VARCHAR(20) NOT NULL,    -- email, phone, video
    message TEXT,
    scheduled_time TIMESTAMP,
    reviewer_id VARCHAR(50) REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- AI SCANS
-- ============================================

CREATE TABLE ai_scans (
    id VARCHAR(50) PRIMARY KEY,
    application_id VARCHAR(20) REFERENCES applications(id),
    status VARCHAR(20) NOT NULL,          -- pending, processing, completed, failed
    is_valid BOOLEAN,
    score INTEGER,
    rootedness_score INTEGER,
    intent_score INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scan_issues (
    id VARCHAR(50) PRIMARY KEY,
    scan_id VARCHAR(50) REFERENCES ai_scans(id),
    section_id VARCHAR(100),
    field_id VARCHAR(100),
    issue_type VARCHAR(50) NOT NULL,      -- missing, invalid, inconsistent, suspicious
    severity VARCHAR(20) NOT NULL,        -- low, medium, high, critical
    message TEXT NOT NULL,
    context JSONB
);

CREATE TABLE scan_recommendations (
    id VARCHAR(50) PRIMARY KEY,
    scan_id VARCHAR(50) REFERENCES ai_scans(id),
    related_issue_ids TEXT[],
    message TEXT NOT NULL,
    action_type VARCHAR(50) NOT NULL      -- verify, request_info, escalate, reject
);

-- ============================================
-- COLLABORATION
-- ============================================

CREATE TABLE collaborations (
    id VARCHAR(50) PRIMARY KEY,
    application_id VARCHAR(20) REFERENCES applications(id),
    status VARCHAR(50) DEFAULT 'in_progress',
    priority VARCHAR(20) DEFAULT 'medium',
    description TEXT,
    created_by_id VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE collaboration_participants (
    collaboration_id VARCHAR(50) REFERENCES collaborations(id),
    user_id VARCHAR(50) REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (collaboration_id, user_id)
);

CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    application_id VARCHAR(20) REFERENCES applications(id),
    collaboration_id VARCHAR(50) REFERENCES collaborations(id),
    assignee_id VARCHAR(50) REFERENCES users(id),
    assigned_by_id VARCHAR(50) REFERENCES users(id),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activity_log (
    id VARCHAR(50) PRIMARY KEY,
    activity_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) REFERENCES users(id),
    target_id VARCHAR(50),
    target_type VARCHAR(50),
    application_id VARCHAR(20),
    collaboration_id VARCHAR(50),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ANALYTICS (Pre-aggregated for performance)
-- ============================================

CREATE TABLE metrics_daily (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_applications INTEGER,
    approved INTEGER,
    rejected INTEGER,
    escalated INTEGER,
    avg_processing_time_minutes INTEGER,
    sla_met INTEGER,
    sla_missed INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(date)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_assigned_to ON applications(assigned_to_id);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX idx_applications_country_visa ON applications(country, visa_type);
CREATE INDEX idx_decisions_application ON decisions(application_id);
CREATE INDEX idx_notes_application ON notes(application_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_activity_created ON activity_log(created_at);
```

---

## Authentication Requirements

The frontend expects JWT-based authentication. Key requirements:

1. **Auth Header:** `Authorization: Bearer <token>`
2. **User Context:** API should extract `userId` and `role` from token
3. **Permissions:** Role-based access control
   - `super_admin`: Full access
   - `senior_officer`: Approve, reject, escalate, view all
   - `officer`: Standard review operations
   - `specialist`: Limited to assigned applications
   - `viewer`: Read-only

### Protected Endpoints
All endpoints require authentication except:
- Health check endpoints
- Public documentation

### Super Admin Creation
- Requires existing `super_admin` role
- Must verify `.gov.uk` email domain
- Clearance verification required

---

## Implementation Priority

### Phase 1: Core Queue (High Priority)
1. `GET /api/applications` - List with filters
2. `GET /api/applications/:id` - Single application
3. `GET /api/applications/stats` - Queue stats
4. `PATCH /api/applications/:id/status` - Update status
5. `POST /api/applications/bulk-assign` - Bulk assignment

### Phase 2: Review Workflow (High Priority)
1. `POST /api/reviews/:id/approve`
2. `POST /api/reviews/:id/reject`
3. `POST /api/reviews/:id/escalate`
4. `GET /api/reviews/:id/history`
5. `POST /api/reviews/:id/sections/:sectionId/notes`

### Phase 3: Users & Officers (Medium Priority)
1. `GET /api/users/officers`
2. `GET /api/users/search`
3. `POST /api/super-admin`

### Phase 4: Analytics (Medium Priority)
1. `GET /api/metrics/queue`
2. `GET /api/metrics/sla`
3. `GET /api/metrics/workload`

### Phase 5: Collaboration (Lower Priority)
1. `GET /api/tasks/my`
2. `POST /api/collaborations`
3. `GET /api/activity/team`

---

## Response Format Standards

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Response
```json
{
  "data": [ ... ],
  "total": 156,
  "page": 1,
  "pageSize": 10,
  "totalPages": 16
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Rationale is required for rejection",
    "details": {
      "field": "rationale",
      "constraint": "required"
    }
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource state conflict |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Error Handling

### Validation Errors
Return 400 with specific field errors:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "rationale": "Required for rejection",
        "reviewerId": "Must be a valid UUID"
      }
    }
  }
}
```

### Business Logic Errors
Return appropriate status with clear message:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE",
    "message": "Cannot approve an already rejected application"
  }
}
```

---

## Testing the Integration

### Environment Setup
```bash
# Frontend .env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=https://api.your-backend.com
```

### Test Endpoints
1. **Health Check:** `GET /api/health`
2. **Applications List:** `GET /api/applications?page=1&pageSize=5`
3. **Single Application:** `GET /api/applications/VK-2024-1835`
4. **Queue Stats:** `GET /api/applications/stats`

### Expected Behavior
- All responses should match TypeScript contracts
- Filtering should work for all supported fields
- Pagination should return correct totals
- Status updates should reflect in queue stats

---

## Questions for Backend Team

1. **AI Scan Integration:** Will the AI scan service be a separate microservice? How will results be delivered (sync/async/webhook)?

2. **Real-time Updates:** Should we implement WebSocket for live queue updates, or will polling suffice?

3. **File Storage:** Where will uploaded documents be stored (GCS bucket)? How will the frontend access them?

4. **Audit Logging:** Should all state changes be logged to a separate audit service?

5. **Rate Limiting:** What rate limits should be applied to prevent abuse?

---

## Contact

For questions about frontend implementation or API contracts:
- Check the TypeScript contracts in `src/api-contracts/`
- Review mock implementations in `src/lib/mock*.ts`
- Test the UI at `http://localhost:3000` to understand expected behavior
