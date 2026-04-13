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

**Phase:** Phase 1 — Type Alignment — ✅ COMPLETE
**Last completed:** Tasks 1.3, 1.4, 1.5, 1.6 (pending commit)
**Next up:** Phase 2A Task 2.0 — Replace `AIScanResult` type with `DISApplicationView` in the reviewer page
**Blocked on:** Nothing

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

### Task 1.2 — Create `src/types/extraction.ts` — ✅ DONE

**Commit:** `c0eebb0` (same checkpoint as 1.1)
**Files:**
- `src/types/extraction.ts` (new)

**What's in it:**
- 10 typed extraction schemas: `PassportExtractedData`, `BankStatementExtractedData`, `NationalIdExtractedData`, `BrpExtractedData`, `EmploymentLetterExtractedData`, `PayslipExtractedData`, `P60TaxExtractedData`, `IeltsCertificateExtractedData`, `DegreeCertificateExtractedData`, `TbCertificateExtractedData`
- `FlexibleExtractedData` for Utility Bill / Police Certificate (flexible JSONB)
- `TypedDocumentExtraction` discriminated union — narrows extracted_data shape by `document_type`

**Verification:** `npx tsc --noEmit` — zero errors

---

### Task 1.3 — Extend `ApplicationData` with DIS fields — ✅ DONE

**Commit:** pending (bundled with 1.4, 1.5, 1.6)
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

**Commit:** pending
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

**Commit:** pending
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

**Commit:** pending
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
| `c0eebb0` | 2026-04-13 | 1.1, 1.2 | DIS API contract + extraction types |

_Add new commits to the top of this table as they land._
