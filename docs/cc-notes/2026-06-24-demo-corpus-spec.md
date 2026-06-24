# Demo Corpus — generation spec (for the multi-visa queue + throughput/RFI demo)

**Date:** 2026-06-24 · **For:** Chris's corpus-generation agents · **Goal:** one unified, **DIS-aligned**, **multi-visa** corpus that drives the whole demo (queue → auto-allocation → distribution/throughput → deep review → RFI lifecycle). Supersedes `output_demo` (not DIS-aligned) and `govdirect_v4_batch100` (skilled-worker only, n=100) for demo use.

## Two tiers — generate both

### Tier 1 — BULK (~1,000 apps) — drives queue / allocation / distribution / throughput beat
- **Shape:** EXACTLY the `govdirect_v4_batch100` schema (it's the real DIS/wire shape):
  `source_application_id, source_reference, source_channel, visa_type, country_code, submitted_at, caseworker_id, applicant, passport_data, biometric_verification, answers, documents, anomaly_type, anomaly_details`.
- **ADD one field:** `recommendation` ∈ `RECOMMEND_APPROVE | RECOMMEND_REJECT | MANUAL_REVIEW`, **deterministically derived from `anomaly_type`** (clean→APPROVE, fail_rules→REJECT, suspicious|edge_case→MANUAL_REVIEW). This is the ground-truth the "processing" step reveals — so the queue's distribution is real, not guessed at render time. (Apps still *start* shown as unprocessed; the demo reveals the recommendation on "process".)
- **Volume:** ~1,000 (one region's intake batch). *(LEVER)*
- **Visa-type mix** (wire vocab; we map to officer specializations via the registry):
  | type (wire) | share |
  |---|---|
  | `skilled-worker` | ~30% (Phase-1 deep route — keep prominent) |
  | `student` | ~30% |
  | `senior-specialist-worker` | ~12% |
  | `spouse-partner` | ~12% |
  | `global-talent` | ~10% |
  | `innovator-founder` | ~6% |
  *(LEVER — roughly mirrors real UK proportions + the 8 officers' specializations.)*
- **Decision distribution** via `anomaly_type` *(LEVERS)*:
  - `clean` → RECOMMEND_APPROVE — **~60%** ✅ LOCKED
  - `fail_rules` → RECOMMEND_REJECT — **~25%** (populate `anomaly_details` with the refusal grounds) ✅ LOCKED
  - `suspicious` + `edge_case` → MANUAL_REVIEW — **~15%** (rich `anomaly_details`) ✅ LOCKED
- **Hygiene:** `submitted_at` within the **last ~3 weeks** (NOT 2001 — current bug); valid MRZ / salary / bank consistency (batch100 already passes these); realistic names/nationalities.

### Tier 2 — DEEP SET (~15–20 skilled-worker apps) — the cases opened on screen
> **REUSE, don't regenerate:** `govdirect_v4_batch100` already contains **100** validated, DIS-aligned skilled-worker apps with `anomaly_details` + `ground_truth/`. **Source the deep set by selecting ~15–20 of those** and extending them (add the `recommendation` field, refresh `submitted_at`, build the RFI artifacts). Only Tier 1 (the 1,000 multi-visa bulk) needs generating from scratch — `batch100` is 100 skilled-worker only, and `output_demo` (1,000) is the wrong, non-DIS schema.

These are the cases an officer actually opens → must render full **DIS Glass Box + Evidence + OV assessment**. For each, in addition to Tier-1 fields:
- enough to assemble a `DISApplicationView`: rules_summary (Drools passed/failed counts), flagged rule IDs, OPA policy results, external-check results, completeness, per-document extraction + fraud signals, `ground_truth/`.
- an OV-assessable profile (so the scenario-consistent OV assessment is coherent — clean→low risk, fail→high risk).
- **Include 2–3 RFI HERO cases** (see below).

## RFI lifecycle cases (the human-in-control trust beat)
Within the deep set, build **2–3 MANUAL_REVIEW skilled-worker cases** as clean RFI scenarios:
- a **single, specific** missing/insufficient document in `anomaly_details` — e.g. *missing payslip (month 2)*, *expired TB certificate*, *employment-letter salary doesn't match CoS*.
- a companion **"applicant response" artifact** (the document they later supply) so the **two-touch lifecycle is demoable end-to-end**: officer reviews → flags missing doc → issues RFI → case parks (AWAITING_INFO) → applicant responds → officer re-reviews → decides.
- pick ones where the recommendation is genuinely borderline so the officer *pushing back on the recommendation* reads as judgement, not rubber-stamping.

## Depth tiering (Phase 1 vs Phase 2) — one decision needed
- **skilled-worker** = full Phase-1 depth (real DIS pipeline + OV). ✅
- **other 5 types** = queue/allocation/distribution depth only; opening one shows "DIS pipeline configured — live in Phase 2." *(LEVER: uniform full depth vs this honest tiering — your call.)*

## Not corpus — our build side (for reference)
visa-type registry (vocab bridge + `phase` flag) · provider mapping to read the DIS-aligned shape · capacity-aware balanced allocation (cap ~30/officer) · the throughput/distribution/RFI UI · two-clock SLA model.

## Locked decisions (2026-06-24, Chris)
1. **Volume** — **1,000** bulk. ✅
2. **Visa mix** — as tabled (~30% skilled-worker + 5 others). ✅
3. **Distribution** — **60 / 25 / 15** approve / reject / manual. ✅
4. **Depth tiering** — **honest Phase-1/2**: skilled-worker deep (real DIS+OV); other 5 types = "DIS pipeline live in Phase 2." ✅
