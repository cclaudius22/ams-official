# Multi-Visa Queue + Capacity-Aware Allocation — Implementation Plan (v2, design-spec-aligned)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.
> **Source of truth:** `docs/specs/2026-06-24-multi-visa-queue-allocation-design.md`. This plan was rewritten 24 Jun to remove drift (queue is **multi-visa over all 1,000**, not skilled-worker-only).

**Goal:** Feed all 1,000 multi-visa apps through the existing Live Queue via a new `AmsDemoProvider`, reveal recommendations on "Process intake" with a 600/250/150 distribution, and capacity-aware-allocate the decision workload across officers (current load counted) with a visible backlog.

**Architecture:** Visa-agnostic core (`visaTypes` registry + pure `allocateBatch`) + a DIS corpus adapter + a new `AmsDemoProvider` (reads `data/demo-corpus/bulk`), wired through the *existing* `/api/assignments/auto-assign-all` and `livequeue` page. Skilled-worker is NOT special here — it's only special for deep review (Slice 3).

**Tech Stack:** Next.js (App Router) · TypeScript · Vitest · Playwright. No new runtime deps.

## Global Constraints
- `tsc --noEmit` adds **0 new errors** (76 baseline). Verify every task.
- **Do NOT touch:** `src/data/providers/json-provider.ts`, `output_demo`, the reviewer page, `OVIntelligencePanel.tsx`.
- **Map, never rename** the corpus; vocab bridged in `src/config/visaTypes.ts` (`skilled-worker` → `skilled_worker_visa`).
- **Queue = all 1,000 multi-visa apps** from `data/demo-corpus/bulk/applications`. Distribution = **600 APPROVE / 250 REJECT / 150 MANUAL_REVIEW**.
- **`bulk/documents/` is intentionally absent in-repo** — queue/allocation must **not** read or fail on it.
- New provider only: `DATA_PROVIDER=ams-demo`, default corpus path `data/demo-corpus`.
- **Capacity cap counts existing load:** `officer.activeApplications + newly_assigned <= capPerOfficer` (default 30).
- Status lifecycle: `Received` → `Processed` → (`Assigned`/`In Progress` | `Awaiting Allocation`) → `Decided`. Preserve status-led policy + human-in-the-loop framing.

---

### Task 1: Visa-type registry
**Files:** Create `src/config/visaTypes.ts`; Test `src/__tests__/visa-types.test.ts`.
**Interfaces — Produces:** `normalizeVisaType(raw): string | null`, `visaTypeLabel(key): string`, `visaTypePhase(key): 1|2|null`, `VISA_TYPES: VisaTypeDef[]`.

- [ ] **Step 1 — failing test**
```ts
// src/__tests__/visa-types.test.ts
import { describe, it, expect } from 'vitest'
import { normalizeVisaType, visaTypeLabel, visaTypePhase, VISA_TYPES } from '@/config/visaTypes'
describe('visaTypes registry', () => {
  it('normalizes all 6 wire vocabs to canonical keys', () => {
    expect(normalizeVisaType('skilled-worker')).toBe('skilled_worker_visa')
    expect(normalizeVisaType('student')).toBe('student_visa')
    expect(normalizeVisaType('senior-specialist-worker')).toBe('senior_specialist_worker_visa')
    expect(normalizeVisaType('spouse-partner')).toBe('spouse_partner_visa')
    expect(normalizeVisaType('global-talent')).toBe('global_talent_visa')
    expect(normalizeVisaType('innovator-founder')).toBe('innovator_founder_visa')
  })
  it('is hyphen/underscore/case-insensitive and identity-stable', () => {
    expect(normalizeVisaType('SKILLED_WORKER')).toBe('skilled_worker_visa')
    expect(normalizeVisaType('skilled_worker_visa')).toBe('skilled_worker_visa')
  })
  it('returns null for unknown/empty', () => {
    expect(normalizeVisaType('tourist')).toBeNull(); expect(normalizeVisaType('')).toBeNull()
  })
  it('labels + phase: skilled-worker is the only phase-1 route', () => {
    expect(visaTypeLabel('skilled_worker_visa')).toBe('Skilled Worker')
    expect(visaTypePhase('skilled_worker_visa')).toBe(1)
    expect(visaTypePhase('student_visa')).toBe(2)
    expect(VISA_TYPES.filter(v => v.phase === 1).map(v => v.key)).toEqual(['skilled_worker_visa'])
  })
})
```
- [ ] **Step 2 — run → FAIL:** `npx vitest run src/__tests__/visa-types.test.ts`
- [ ] **Step 3 — implement**
```ts
// src/config/visaTypes.ts
export type VisaPhase = 1 | 2
export interface VisaTypeDef { key: string; label: string; wireAliases: string[]; specialization: string; phase: VisaPhase }
export const VISA_TYPES: VisaTypeDef[] = [
  { key: 'skilled_worker_visa', label: 'Skilled Worker', wireAliases: ['skilled-worker','skilled_worker'], specialization: 'skilled_worker_visa', phase: 1 },
  { key: 'student_visa', label: 'Student', wireAliases: ['student'], specialization: 'student_visa', phase: 2 },
  { key: 'senior_specialist_worker_visa', label: 'Senior / Specialist Worker', wireAliases: ['senior-specialist-worker','senior_specialist_worker'], specialization: 'senior_specialist_worker_visa', phase: 2 },
  { key: 'spouse_partner_visa', label: 'Spouse / Partner', wireAliases: ['spouse-partner','spouse_partner'], specialization: 'spouse_partner_visa', phase: 2 },
  { key: 'global_talent_visa', label: 'Global Talent', wireAliases: ['global-talent','global_talent'], specialization: 'global_talent_visa', phase: 2 },
  { key: 'innovator_founder_visa', label: 'Innovator Founder', wireAliases: ['innovator-founder','innovator_founder'], specialization: 'innovator_founder_visa', phase: 2 },
]
const canon = (s: string) => s.trim().toLowerCase().replace(/-/g, '_')
const INDEX = new Map<string, VisaTypeDef>()
for (const d of VISA_TYPES) { INDEX.set(canon(d.key), d); for (const a of d.wireAliases) INDEX.set(canon(a), d) }
export function normalizeVisaType(raw: string): string | null { return raw ? (INDEX.get(canon(raw))?.key ?? null) : null }
export function visaTypeLabel(key: string): string { return INDEX.get(canon(key))?.label ?? key }
export function visaTypePhase(key: string): VisaPhase | null { return INDEX.get(canon(key))?.phase ?? null }
```
- [ ] **Step 4 — run → PASS** (4 tests). **Step 5 — `tsc`:** `npx tsc --noEmit 2>&1 | grep -c "error TS"` → `76`.
- [ ] **Step 6 — commit:** `feat(ams): visa-type registry + vocab normalisation (Slice 0)`

---

### Task 2: Extend `LiveApplication` + DIS corpus adapter
**Files:** Modify `src/types/liveQueue.ts` (additive); Create `src/data/providers/disAlignedAdapter.ts`; Test `src/__tests__/dis-aligned-adapter.test.ts`.
**Interfaces — Produces:** `mapDisAlignedApp(raw): LiveApplication`; `deriveRecommendation(raw): 'RECOMMEND_APPROVE'|'RECOMMEND_REJECT'|'MANUAL_REVIEW'`. Extends `LiveApplication` with optional `visaTypeId`, `recommendation`, `anomalyType`, `sourceReference`, and statuses `Received|Processed|Awaiting Allocation|Decided`.

- [ ] **Step 1 — failing test**
```ts
// src/__tests__/dis-aligned-adapter.test.ts
import { describe, it, expect } from 'vitest'
import { mapDisAlignedApp, deriveRecommendation } from '@/data/providers/disAlignedAdapter'
const raw = { source_application_id: 'HO-SW-2026-00000001', source_reference: 'GV-REF-1', visa_type: 'skilled-worker',
  country_code: 'IN', submitted_at: '2026-06-16T10:00:00Z', anomaly_type: 'clean', applicant: { first_name: 'Karan', last_name: 'Nair' } }
describe('disAlignedAdapter', () => {
  it('derives recommendation from anomaly_type (explicit field wins)', () => {
    expect(deriveRecommendation({ anomaly_type: 'clean' })).toBe('RECOMMEND_APPROVE')
    expect(deriveRecommendation({ anomaly_type: 'fail_rules' })).toBe('RECOMMEND_REJECT')
    expect(deriveRecommendation({ anomaly_type: 'suspicious' })).toBe('MANUAL_REVIEW')
    expect(deriveRecommendation({ anomaly_type: 'edge_case' })).toBe('MANUAL_REVIEW')
    expect(deriveRecommendation({ anomaly_type: 'clean', recommendation: 'MANUAL_REVIEW' })).toBe('MANUAL_REVIEW')
  })
  it('maps DIS-aligned app → queue shape (canonical visa, Received, demo fields)', () => {
    const m = mapDisAlignedApp(raw)
    expect(m.id).toBe('HO-SW-2026-00000001')
    expect(m.applicantName).toBe('Karan Nair')
    expect(m.visaType).toBe('Skilled Worker')
    expect(m.visaTypeId).toBe('skilled_worker_visa')
    expect(m.recommendation).toBe('RECOMMEND_APPROVE')
    expect(m.anomalyType).toBe('clean')
    expect(m.sourceReference).toBe('GV-REF-1')
    expect(m.country).toBe('IN')
    expect(m.status).toBe('Received')
  })
})
```
- [ ] **Step 2 — run → FAIL.**
- [ ] **Step 3a — extend the type** (`src/types/liveQueue.ts`): widen the `status` union with `| 'Received' | 'Processed' | 'Awaiting Allocation' | 'Decided'`, and add optional fields `visaTypeId?: string; recommendation?: 'RECOMMEND_APPROVE'|'RECOMMEND_REJECT'|'MANUAL_REVIEW'; anomalyType?: string; sourceReference?: string`. (Additive — existing producers/consumers unaffected.)
- [ ] **Step 3b — implement adapter** (`disAlignedAdapter.ts`): `deriveRecommendation` honours `raw.recommendation` first, else maps `anomaly_type` (`clean→APPROVE`, `fail_rules→REJECT`, default `MANUAL_REVIEW`). `mapDisAlignedApp`: `id←source_application_id`, `applicantName←first+' '+last`, `country←country_code`, `visaTypeId←normalizeVisaType(visa_type)`, `visaType←visaTypeLabel(visaTypeId)`, `submittedAt←submitted_at`, `status:'Received'`, `recommendation←deriveRecommendation(raw)`, `anomalyType←anomaly_type`, `sourceReference←source_reference`.
- [ ] **Step 4 — run → PASS** (2 tests). **Step 5 — `tsc`** → `76` and full DIS suite green (`npx vitest run src/__tests__/dis`).
- [ ] **Step 6 — commit:** `feat(ams): extend LiveApplication + DIS corpus adapter (Slice 0)`

---

### Task 3: `AmsDemoProvider` (read `data/demo-corpus/bulk`)
**Files:** Create `src/data/providers/ams-demo-provider.ts`; Modify `src/data/providers/index.ts` (add the `ams-demo` branch only — do not touch the `json` branch); Test `src/__tests__/ams-demo-provider.test.ts`.
**Interfaces — Produces:** `class AmsDemoProvider implements ApplicationDataProvider`. Selected by `DATA_PROVIDER=ams-demo`; default corpus root `data/demo-corpus` (`AMS_DEMO_CORPUS_PATH` overrides).

- [ ] **Step 1 — failing test:** load apps from a tiny fixture dir (3 DIS-aligned JSONs incl. one each clean/fail_rules/suspicious); assert: `getApplications()` returns 3 with `status:'Received'`, canonical `visaType`, and the recommendation distribution {APPROVE:1, REJECT:1, MANUAL_REVIEW:1}; assert it **does not throw when no `documents/` dir exists**.
- [ ] **Step 2 — run → FAIL.**
- [ ] **Step 3 — implement:** read `{root}/bulk/applications/*.json`, map each via `mapDisAlignedApp`. Officer + assignment methods reuse the seed logic (mirror `json-provider`'s `defaultOfficers`-based `getOfficers`/`getOfficersBySpecialization`/`assignApplication`/`getOfficerWorkloads`). **Never read `documents/`/`ground_truth/`** (queue needs neither). Keep an in-memory `assignments`/`statusOverrides` map like json-provider for assign/reset. In `index.ts`, add `if (providerType === 'ams-demo') { const { AmsDemoProvider } = await import('./ams-demo-provider'); providerInstance = new AmsDemoProvider(process.env.AMS_DEMO_CORPUS_PATH || 'data/demo-corpus') }`.
- [ ] **Step 4 — run → PASS. Step 5 — `tsc` 76 + DIS suite green.**
- [ ] **Step 6 — commit:** `feat(ams): AmsDemoProvider reads in-repo multi-visa corpus (Slice 0)`

---

### Task 4: Capacity-aware `allocateBatch` (counts current load)
**Files:** Create `src/services/assignment/allocate-batch.ts`; Test `src/__tests__/allocate-batch.test.ts`.
**Interfaces — Produces:** `allocateBatch(apps: AllocatableApp[], officers: ConsulateOfficial[], config: { capPerOfficer: number }): AllocationResult`. `AllocatableApp = { id; visaTypeKey }`. `AllocationResult = { assignments: {appId; officerId: string|null; reason}[]; byOfficer: Record<id,{count; load; capacity}>; unallocated: string[] }`. **`load` = `activeApplications + newly assigned`; cap bounds the total.**

- [ ] **Step 1 — failing test**
```ts
// src/__tests__/allocate-batch.test.ts
import { describe, it, expect } from 'vitest'
import { allocateBatch, type AllocatableApp } from '@/services/assignment/allocate-batch'
import type { ConsulateOfficial } from '@/api-contracts/users'
const off = (id: string, specs: string[], activeApplications = 0, sla = 95): ConsulateOfficial => ({
  id, firstName: id, lastName: 'O', email: `${id}@x`, role: 'officer', isActive: true,
  specializations: specs, activeApplications, slaCompliance: sla, avgProcessingTime: 30, completedToday: 0 } as ConsulateOfficial)
const apps = (n: number, key = 'skilled_worker_visa'): AllocatableApp[] => Array.from({ length: n }, (_, i) => ({ id: `A${i}`, visaTypeKey: key }))
describe('allocateBatch', () => {
  it('cap counts EXISTING load — an officer at 29/30 takes only 1', () => {
    const r = allocateBatch(apps(10), [off('ric', ['skilled_worker_visa'], 29)], { capPerOfficer: 30 })
    expect(r.byOfficer['ric'].count).toBe(1)
    expect(r.byOfficer['ric'].load).toBe(30)
    expect(r.unallocated.length).toBe(9)
  })
  it('never lets total load exceed the cap', () => {
    const r = allocateBatch(apps(100), [off('a', ['skilled_worker_visa'], 10), off('b', ['skilled_worker_visa'], 0)], { capPerOfficer: 30 })
    expect(Math.max(...Object.values(r.byOfficer).map(o => o.load))).toBeLessThanOrEqual(30)
    expect(r.assignments.filter(a => a.officerId).length).toBe(50) // (30-10)+(30-0)
  })
  it('balances by total load (lowest first)', () => {
    const r = allocateBatch(apps(30), [off('a', ['skilled_worker_visa'], 0), off('b', ['skilled_worker_visa'], 0), off('c', ['skilled_worker_visa'], 0)], { capPerOfficer: 30 })
    const loads = Object.values(r.byOfficer).map(o => o.load)
    expect(Math.max(...loads) - Math.min(...loads)).toBeLessThanOrEqual(1)
  })
  it('respects specialization + skips inactive + queues overflow', () => {
    const r = allocateBatch(apps(5), [off('ken', ['spouse_partner_visa'])], { capPerOfficer: 30 })
    expect(r.unallocated.length).toBe(5); expect(r.assignments.every(a => a.officerId === null)).toBe(true)
  })
})
```
- [ ] **Step 2 — run → FAIL.**
- [ ] **Step 3 — implement**
```ts
// src/services/assignment/allocate-batch.ts
import type { ConsulateOfficial } from '@/api-contracts/users'
export interface AllocatableApp { id: string; visaTypeKey: string }
export interface AllocationResult {
  assignments: { appId: string; officerId: string | null; reason: string }[]
  byOfficer: Record<string, { count: number; load: number; capacity: number }>
  unallocated: string[]
}
export function allocateBatch(apps: AllocatableApp[], officers: ConsulateOfficial[], config: { capPerOfficer: number }): AllocationResult {
  const cap = config.capPerOfficer
  const active = officers.filter(o => o.isActive)
  const load = new Map<string, number>(active.map(o => [o.id, o.activeApplications ?? 0]))   // seed from CURRENT load
  const fresh = new Map<string, number>(active.map(o => [o.id, 0]))
  const result: AllocationResult = { assignments: [], byOfficer: {}, unallocated: [] }
  for (const app of apps) {
    const eligible = active
      .filter(o => (o.specializations ?? []).includes(app.visaTypeKey) && load.get(o.id)! < cap)
      .sort((a, b) => (load.get(a.id)! - load.get(b.id)!) || ((b.slaCompliance ?? 0) - (a.slaCompliance ?? 0)))
    const chosen = eligible[0]
    if (!chosen) { result.unallocated.push(app.id); result.assignments.push({ appId: app.id, officerId: null, reason: 'No specialist under capacity — queued' }); continue }
    load.set(chosen.id, load.get(chosen.id)! + 1); fresh.set(chosen.id, fresh.get(chosen.id)! + 1)
    result.byOfficer[chosen.id] = { count: fresh.get(chosen.id)!, load: load.get(chosen.id)!, capacity: cap }
    result.assignments.push({ appId: app.id, officerId: chosen.id, reason: `Specialist in ${app.visaTypeKey}; load ${load.get(chosen.id)}/${cap}` })
  }
  return result
}
```
- [ ] **Step 4 — run → PASS** (4 tests). **Step 5 — `tsc` 76.**
- [ ] **Step 6 — commit:** `feat(ams): capacity-aware allocator counting current officer load (Slice 1)`

---

### Task 5: `auto-assign-all` uses `allocateBatch`
**Files:** Modify `src/app/api/assignments/auto-assign-all/route.ts`; Test `src/__tests__/auto-assign-capacity.test.ts` (stub provider).
**Interfaces — Produces:** response `{ success, data: { assigned, unallocated, capPerOfficer, byOfficer: Record<id,{name,count,load,capacity}> } }`.

- [ ] **Step 1 — failing test:** stub provider returns multi-visa apps (`status:'Processed'`, with `visaTypeId`) + the 8 seed officers; assert the assembled result: no officer's `load > capPerOfficer`, `assigned + unallocated == processedCount`, only `Processed` + unassigned apps considered.
- [ ] **Step 2 — run → FAIL.**
- [ ] **Step 3 — implement:** fetch apps; filter to **`status === 'Processed'` && not assigned**; map → `AllocatableApp` (`{ id, visaTypeKey: app.visaTypeId ?? normalizeVisaType(app.visaType) }`); `allocateBatch(apps, officers, { capPerOfficer: 30 })`; persist each non-null assignment via `provider.assignApplication`; build `byOfficer` with officer names; return `{ assigned, unallocated: result.unallocated.length, capPerOfficer: 30, byOfficer }`. Leave `suggest`/manual `assignments`/`reset` routes unchanged.
- [ ] **Step 4 — run → PASS. Step 5 — `tsc` 76 + DIS suite green.**
- [ ] **Step 6 — commit:** `feat(ams): auto-assign-all uses capacity-aware allocateBatch over processed apps (Slice 1)`

---

### Task 6: Live Queue — Received → Process → distribution
**Files:** Modify `src/app/dashboard/livequeue/page.tsx`; Create `src/components/dashboard/DistributionTiles.tsx`.

- [ ] **Step 1:** Add `processed` state. Apps load as `Received`; a per-row **recommendation is hidden** until processed. Add a **"Process intake"** button (visible when `!processed`); on click set a short elapsed readout + `processed = true` and compute distribution counts from each app's `recommendation`.
- [ ] **Step 2:** `DistributionTiles` shows APPROVE / REJECT / MANUAL_REVIEW counts (≈ **600 / 250 / 150** on the full corpus), only when `processed`. Map the new statuses in `calculateQueueStats` (`Received`/`Processed`/`Awaiting Allocation` → pending bucket; `Decided` → completed).
- [ ] **Step 3:** Gate **Auto-Assign** so it acts on `Processed` apps (compute `processedUnassignedCount`); replace the single throughput-% framing with the **three claims** (Processing 2 wks→<1 min · ~85/15 triage · ~2× routine) — status-led copy, no leaked grades.
- [ ] **Step 4 — browser-verify (Playwright):** `DATA_PROVIDER=ams-demo` → 6 visa types in the chart; Process reveals tiles summing to 1,000 with **600/250/150**; recommendations hidden pre-process.
- [ ] **Step 5 — commit:** `feat(ams): intake→process beat + recommendation distribution tiles (Slice 1)`

---

### Task 7: Capacity + SLA framing on the board
**Files:** Modify `src/app/dashboard/livequeue/page.tsx` + officer-workload section + the auto-assign results banner.

- [ ] **Step 1:** Officer cards/workload show **`load / capPerOfficer`** (e.g. 28/30) + an SLA chip (15 working days). **Step 2:** Banner shows `assigned` + **`unallocated` ("N queued, awaiting capacity")** so the realistic backlog is visible; per-officer `reason/load` from the response. **Step 3 — browser-verify:** allocate → no officer over cap, backlog visible, Reset → clean `Received` baseline. **Step 4 — commit:** `feat(ams): capacity + SLA framing + visible backlog on the board (Slice 1)`

---

## Robustness gate (after all tasks)
1. **Verify:** `npx vitest run` (all green) + `npx tsc --noEmit` (76) + Playwright evidence (process→600/250/150; allocate→no officer>cap + backlog; reset clean).
2. **Adversarial multi-agent review** (Workflow): correctness · type-fidelity · robustness · **security** · spec-conformance; refute-or-confirm; fix only confirmed.
3. **Security pass:** secrets / injection / path-traversal (corpus reads) / data-leak / auth over the adapter + provider + `auto-assign-all`.
4. **Gate:** green tests **and** clean review **and** browser evidence, or it doesn't ship.

## Self-review vs design spec (coverage of the 8 corrections)
1. Multi-visa queue (all 1,000) → Global Constraints + Tasks 3,6 ✓ · 2. New `AmsDemoProvider`, `DATA_PROVIDER=ams-demo`, path `data/demo-corpus`, json-provider untouched → Task 3 ✓ · 3. Extend `LiveApplication` (visaTypeId/recommendation/anomalyType/sourceReference) + statuses → Task 2 ✓ · 4. Registry + adapter map `skilled-worker`→`skilled_worker_visa` → Tasks 1,2 ✓ · 5. Cap counts current load (`activeApplications + new <= cap`) → Task 4 ✓ · 6. Auto-assign over Processed+unassigned, returns assigned/unallocated/capPerOfficer/byOfficer/reason+load → Task 5 ✓ · 7. Received → Process reveals recs → 600/250/150 → backlog → load vs cap → Tasks 6,7 ✓ · 8. Tolerate missing `bulk/documents` → Global Constraints + Task 3 ✓. Don't-touch list → Global Constraints ✓.
