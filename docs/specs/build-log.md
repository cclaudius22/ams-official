# DIS Integration — Build Log

**Purpose:** If we crash and come back fresh, this file tells us exactly what's been built, what commits contain the work, and what's next.

**Branch:** `feat/dis-integration-v3` (pushed to `origin/feat/dis-integration-v3`)
**Main branch:** `main`
**Spec:** `docs/specs/2026-04-12-dis-integration-spec-v3.md`
**Spec revision state:** `docs/specs/progress.md`

---

## How to read this log

- **Status:** `TODO` / `IN PROGRESS` / `DONE` / `BLOCKED`
- Each task entry lists: the V3 spec section/number, files touched, commit SHA, notes
- Most recent work at the top of each phase section
- If the IDE crashes mid-task, check the last `IN PROGRESS` entry — that's where we were
- Commit SHAs link the work to a specific checkpoint you can git-diff against

---

## Current position

**Phase:** Phase 1 — Type Alignment — ✅ COMPLETE (+ V1.2 canonical revision applied 14 Apr)
**Last completed:** V1.2 canonical alignment revision — `extraction.ts` rewritten, fraud signals typed, V3 spec Section 6.2 + 10.4 updated
**Next up:** Phase 2A — schema-independent tasks only (Option B strategy)
**Partially blocked on:** Deloitte sign-off (6 artifacts requested 2026-04-15, Monday EOD deadline) — see [`deloitte-signoff-request-2026-04-15.md`](./deloitte-signoff-request-2026-04-15.md)

**What we can build without sign-off (28 of 31 Phase 2 tasks):**
- 2A: 2.0, 2.1, 2.2, 2.3, 2.4, 2.6, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15
- 2B: all 5 tasks (Rules Management UI Prototype)
- 2C: all 5 tasks (Verification Hub enhancements)
- 2D: all 5 tasks (API Gateway Admin Prototype)

**Parked until sign-off lands (3 tasks):**
- 2.5 — Document Extraction Viewer (reads per-doc fields)
- 2.7 — Fraud Detail View (reads per-doc fraud signals)
- 2.8 — Cross-Document Consistency View (reads normalised_fields)
- 2.16 — Mock DIS data transformer (needs final fixture shapes)

---

## Phase 1 — Type Alignment (AMS only, no DIS dependency)

### Task 1.1 — Create `src/api-contracts/dis.ts` — ✅ DONE

**Commit:** `c0eebb0` — "feat(dis): Phase 1 tasks 1.1-1.2 — DIS API contract + extraction types"
**Files:**
- `src/api-contracts/dis.ts` (new)
- `src/api-contracts/index.ts` (modified — added re-export)

**What's in it:**
- `DISDecision`, `ComponentScore` (9 keys), `DISDecisionCallback`
- 20 Drools rule IDs typed as string literal unions (U01-U05, W01-W15)
- 12 OPA policy IDs typed as string literal unions (H01-H06, S01-S06)
- 6 external check types (World-Check, Interpol SLTD, Passport Verify, Device/IP, Email/Phone, Sponsor Verify)
- 12 document types, 3 extraction methods
- 5-level `FraudStatus` (CLEAR / LOW_RISK / MEDIUM_RISK / HIGH_RISK / CRITICAL)
- `AuditLog` with 4 sections (documents, rules, external_checks, opa_policies)
- `DISApplicationView` — the unified type the reviewer page will consume

**Verification:** `npx tsc --noEmit` — zero errors in `dis.ts` or `api-contracts/`

---

### Task 1.2 — Create `src/types/extraction.ts` — ✅ DONE (revised 14 Apr for V1.2)

**Initial commit:** `c0eebb0` (14 Apr, AM — V1.0-aligned)
**Revision commit:** pending (14 Apr, afternoon — V1.2-aligned)
**Files:**
- `src/types/extraction.ts` (rewritten in full — too many field changes for piecewise edits)
- `src/api-contracts/dis.ts` (added `FraudSignal` + `FraudSignals` types, updated `DocumentExtraction.fraud_signals` shape)

**Initial content (V1.0 aligned):**
- 10 typed extraction schemas + `FlexibleExtractedData` for Utility Bill / Police Certificate
- `TypedDocumentExtraction` discriminated union

**Revision — why:** On 14 April Chris pasted Canonical Schema V1.2 into `docs/devdocs/Canonical Document Extraction Schema.md`. Full cross-check found **25 anomalies** across 11 of 12 doc types. Only `P60TaxExtractedData` survived unchanged.

**Revision content (V1.2 aligned):**
- All 12 types rewritten with V1.2-exact fields
- Phantom envelope-level fields removed from all `extracted_data` interfaces (`document_authenticity_score`, `fraud_flags`, `fraud_signals`, `confidence_score` — these belong on the envelope, not inside extracted_data)
- Passport: `document_type` → `document_type_code` rename
- National ID, BRP: `gender` → `sex` (ICAO 9303), BRP adds `visa_type_on_brp`
- Bank Statement: full restructure — removed Indian-bank-specific fields (`micr_code`, `ifsc_code`), added `bank_name`, `lowest_balance`, `total_credits`, `total_debits`, `salary_credits[]`, split `statement_period` → start/end
- Employment Letter: added `company_registration_number`, `on_company_letterhead`, widened `employment_type` enum to include `FULL_TIME`/`PART_TIME`
- Payslip: added `ni_number`, `tax_code`
- IELTS: added `centre_number`
- Degree: added `certificate_number`, removed `naric_reference` from extracted_data (pipeline-populated into normalised_fields only)
- TB Cert: major renames (`patient_full_name`→`patient_name`, `issuing_clinic_or_hospital`→`clinic_name`, `examining_doctor_name`→`examining_doctor`), added `clinic_address`, split `issue_date` into `test_date`+`certificate_date`
- Utility Bill: converted from `FlexibleExtractedData` alias to proper structured `UtilityBillExtractedData` interface (9 fields)
- Police Cert: converted from `FlexibleExtractedData` alias to proper structured `PoliceCertificateExtractedData` interface (10 fields)
- Removed `FlexibleExtractedData` entirely — no longer needed since V1.2 specifies all doc types as structured

**`dis.ts` fraud_signals typing:**
- New `FraudSignal` interface: `{ score: number, flags: string[] }`
- New `FraudSignals` type: `Record<string, FraudSignal>`
- `DocumentExtraction.fraud_signals` changed from `Record<string, unknown>` to `FraudSignals | null`
- Added comment on `ExtractionMethod` noting National ID / BRP use CUSTOM variant of ID Parser (distinguished via `processor_version` not the enum value)

**Verification:** `npx tsc --noEmit` — zero errors on all 8 Phase 1 files

---

### Task 1.3 — Extend `ApplicationData` with DIS fields — ✅ DONE

**Commit:** `f32fb5b` — "feat(dis): Phase 1 tasks 1.3-1.6 — ApplicationData + nationality + outcome normalisation + completeness config"
**Files:**
- `src/types/application.ts` (modified)

**What changed:**
- Added optional `sourceChannel?: 'visakey' | 'govdirect'`
- Added optional `disApplicationId?: string`
- Added optional `disView?: DISApplicationView`
- All additive — existing code keeps compiling
- Imports `DISApplicationView` from `@/api-contracts/dis`

**Verification:** `npx tsc --noEmit` — zero errors

---

### Task 1.4 — Create `src/lib/nationality.ts` — ✅ DONE

**Commit:** `f32fb5b` (same checkpoint as 1.3, 1.5, 1.6)
**Files:**
- `src/lib/nationality.ts` (new)

**What's in it:**
- 90-country master table (alpha-2, alpha-3, name, nationality word)
- Pre-built lookup indices: `BY_ALPHA2`, `BY_ALPHA3`, `BY_NAME`, `BY_NATIONALITY`
- Public API:
  - `alpha2ToAlpha3(code)` — ISO 3166-1 conversion
  - `alpha3ToAlpha2(code)` — reverse
  - `countryName(alpha3)` — "IND" → "India"
  - `nationalityName(alpha3)` — "IND" → "Indian"
  - `nationalityToAlpha3(word)` — "Indian" → "IND"
  - `nameToAlpha3(name)` — "India" → "IND"
  - `toAlpha3(input)` — fuzzy normalise any input to alpha-3
  - `lookupCountry(input)` — full row for display
  - `allCountries()` — for dropdowns/filters
- Case-insensitive lookups throughout

**Verification:** `npx tsc --noEmit` — zero errors

---

### Task 1.5 — Reconcile `ScanRecommendation.actionType` + decision enum — ✅ DONE

**Commit:** `f32fb5b` (same checkpoint as 1.3, 1.4, 1.6)
**Files:**
- `src/api-contracts/applications.ts` (modified — renamed interface + type)
- `src/data/synthetic/transformer.ts` (modified — updated import)
- `src/lib/normalizeOutcome.ts` (new)

**What changed:**
- Renamed `ScanRecommendation` → `OfficerScanRecommendation` in `api-contracts/applications.ts`
- Added `OfficerActionType` type for the officer-facing union
- Left `src/types/aiScan.ts` untouched (applicant-facing — will be replaced wholesale in Phase 2 by DIS types)
- Updated `transformer.ts` import + one type annotation
- No more name collision between the two `ScanRecommendation` definitions

**New utility — `normalizeOutcome.ts`:**
- `normalizeOutcome(input)` — maps any known outcome string → canonical `DecisionOutcome`
- `normalizeOutcomeStrict(input)` — throws on unknown (for system boundaries)
- `toVKBackendOutcome()` / `toAMSLegacyOutcome()` — reverse conversions
- `outcomeLabel()` / `outcomeColor()` — display helpers
- Handles 3 vocabularies: VK Backend (`approved`/`rejected`/`needs_review`), DIS canonical (`APPROVED`/`REJECTED`/`MANUAL_REVIEW`), AMS legacy (`approved`/`rejected`/`escalated`)
- Plus casing/whitespace variants

**Verification:** `npx tsc --noEmit` — zero errors

---

### Task 1.6 — Create `CompletenessConfig` + Skilled Worker config — ✅ DONE

**Commit:** `f32fb5b` (same checkpoint as 1.3, 1.4, 1.5)
**Files:**
- `src/types/completeness.ts` (new)

**What's in it:**
- `CompletenessConfig` type (visa-type-agnostic)
- `CompletenessDocument` type (single slot: type, weight, required, conditional_on, label, description)
- `SKILLED_WORKER_COMPLETENESS` — Phase 1 config with 10 document slots
  - Required: Passport (20), Employment Letter (15), Payslips (15), Bank Statement (15), IELTS (10), Degree (10) → sums to 85
  - Optional: P60 (5), TB Cert (5, conditional), Utility Bill (3), Police Cert (2) → up to 15 more
  - Threshold: 70
  - **Note:** Exact weights pending Deloitte final
- `getCompletenessConfig(visaType)` — registry lookup
- Helper functions:
  - `calculateCompletenessScore(config, presentDocs)` — mirrors RULE-W13
  - `getMissingRequiredDocuments(config, presentDocs)`
  - `isCompletenessPassing(config, presentDocs)`
- Registry pattern ready for Student/Global Talent/Family configs in Phase 4

**Verification:** `npx tsc --noEmit` — zero errors

---

## Phase 2 — AMS UI Components (10-14 days, not started)

_Will be populated as Phase 1 completes._

- 2A (16 tasks) — Officer Dashboard (extends existing reviewer page)
- 2B (5 tasks) — Rules Management UI Prototype
- 2C (5 tasks) — Officer Verification Hub (extends existing `/dashboard/tools/verification`)
- 2D (5 tasks) — API Gateway Admin Prototype

---

## Phase 3 — Live DIS Integration (not started)

_Blocked on Phase 2 completion + DIS API contract from Deloitte (SCRUM-17)._

---

## Phase 4 — Platform Features (ongoing, not started)

_Post-Phase 3 work._

---

## Crash recovery checklist

If we crash and come back fresh:

1. `git checkout feat/dis-integration-v3` (make sure we're on the right branch)
2. `git log --oneline -10` to see recent commits
3. Read this file — find the last `IN PROGRESS` entry (or work from the last `DONE` forward)
4. Read `docs/specs/2026-04-12-dis-integration-spec-v3.md` for full spec context
5. Read `docs/specs/progress.md` for spec revision history
6. `npx tsc --noEmit 2>&1 | grep -E "(dis|extraction|api-contracts)"` to check our files compile clean
7. Pick up the next `TODO` task

---

## Commit history on this branch

| Commit | Date | Tasks | Summary |
|--------|------|-------|---------|
| `f32fb5b` | 2026-04-13 | 1.3, 1.4, 1.5, 1.6 | ApplicationData extension + nationality lib + outcome normalisation + completeness config. **Phase 1 complete.** |
| `c0eebb0` | 2026-04-13 | 1.1, 1.2 | DIS API contract + extraction types |

_Add new commits to the top of this table as they land._
