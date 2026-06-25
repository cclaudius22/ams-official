# AMS Queue Data Contract — PUBLISHED (single source of truth)

**Date:** 2026-06-25 · **Owner:** Agent 1 (multi-visa-queue / data + provider layer) · **Status:** ✅ **READY TO CONSUME**
**Consumed by:** Agent 2 (presentation / charting). **Import surface:** `@/api-contracts/queue-contract`.

> **Rule for Agent 2:** consume this contract — do **not** invent a parallel data shape, do **not** hardcode visa types (use the registry), do **not** re-declare the recommendation enum. Wire the dashboard surfaces to the provider below.

## 1. How to read the queue
Two equivalent paths — both return the same `LiveApplication` shape:
- **Server / RSC / API route:** `import { getDataProvider } from '@/api-contracts/queue-contract'` → `const { data, total } = await provider.getApplications(filters, { page, pageSize })`.
- **Client:** `GET /api/applications?pageSize=1000` → `{ success, data: { data: LiveApplication[], total, page, pageSize, totalPages } }`.

Provider selected by env: `DATA_PROVIDER=ams-demo`, `AMS_DEMO_CORPUS_PATH=data/demo-corpus` (reads `bulk/applications`).

## 2. The shape — `LiveApplication`
```ts
interface LiveApplication {
  id: string
  applicantName: string
  country: string            // ISO code, e.g. 'IN'
  visaType: string           // DISPLAY label, e.g. 'Skilled Worker' (= visaTypeLabel(visaTypeId))
  submittedAt: string        // ISO 8601
  status: ApplicationStatus
  assignedTo?: { id: string; name: string; avatar?: string }
  // --- DIS-aligned fields (populated by AmsDemoProvider) ---
  visaTypeId?: string         // CANONICAL key, e.g. 'skilled_worker_visa' — group/filter on THIS
  recommendation?: RecommendationOutcome
  anomalyType?: string        // 'clean' | 'fail_rules' | 'suspicious' | 'edge_case'
  sourceReference?: string
}
```
**For charts:** group/filter on `visaTypeId` (canonical), render with `visaTypeLabel(visaTypeId)`. Don't split on the free-text `visaType` string.

## 3. Recommendation enum (canonical — defined once in `dis.ts`)
```ts
type RecommendationOutcome = 'RECOMMEND_APPROVE' | 'RECOMMEND_REJECT' | 'MANUAL_REVIEW'
```
On the real corpus the distribution is **600 / 250 / 150** (APPROVE / REJECT / MANUAL_REVIEW). Human-in-the-loop: this is a *recommendation*, the officer decides.

## 4. Canonical visa-type taxonomy — the 6 FINAL types
Use the registry (`VISA_TYPES`, `normalizeVisaType`, `visaTypeLabel`, `visaTypePhase`) — never a hardcoded list.

| canonical `key` | `label` | `phase` |
|---|---|---|
| `skilled_worker_visa` | Skilled Worker | 1 (live DIS+OV deep route) |
| `student_visa` | Student | 2 |
| `senior_specialist_worker_visa` | Senior / Specialist Worker | 2 |
| `spouse_partner_visa` | Spouse / Partner | 2 |
| `global_talent_visa` | Global Talent | 2 |
| `innovator_founder_visa` | Innovator Founder | 2 |

These 6 are **final** (Chris, 25 Jun). No "Health & Care"; "Family" = `spouse_partner_visa`. `normalizeVisaType()` maps wire/corpus vocab (`skilled-worker`) → canonical key. `phase: 1` = the live deep-review route (skilled worker); `phase: 2` = queue/allocation only (Phase-2 vision).

## 5. Status lifecycle (`ApplicationStatus`)
Demo lifecycle: `Received` → `Processed` (after Process intake) → `In Progress` (assigned) / `Awaiting Allocation` (queued, over capacity) → `Decided`. (Legacy values `Pending Assignment` / `Awaiting Info` / etc. also valid in the union.)

## 6. Import surface (everything Agent 2 needs)
```ts
import {
  getDataProvider,                                   // read access
  VISA_TYPES, normalizeVisaType, visaTypeLabel, visaTypePhase,  // taxonomy
  type LiveApplication, type ApplicationStatus, type ApplicationFilters,
  type RecommendationOutcome, type VisaTypeDef, type VisaPhase,
} from '@/api-contracts/queue-contract'
```

## 7. Ownership boundary
Agent 1 owns this contract + the provider/registry/recommendation schema. Agent 2 owns presentation (Recharts consolidation, shared chart primitives, removing hardcoded mock + Nivo) and **consumes** this. Heads-up: Agent 1's Slice 1 already touched two presentation files (`src/app/dashboard/livequeue/page.tsx`, `src/components/dashboard/LiveQueueMetrics.tsx`) — pull latest on `feat/dis-integration-v3` before charting consolidation.
