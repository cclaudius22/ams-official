# DIS → Officer Dashboard — Full Frontend Data Contract

**Purpose:** Single build spec for the Officer Dashboard (caseworker review UI) and its three-panel application view. For the frontend dev / Claude Code.
**Scope:** Skilled Worker only. Build multi-visa-ready, render SW.
**Build mode:** Mock against these shapes now; swap base URL to live later.

**Ownership key:**
🟦 **DELOITTE** writes the data (pipeline) · 🟩 **OV** builds the read endpoint + UI · 🟥 **GAP** — not yet contracted, flag it · 🟪 **OV-IP** — our build, never in Deloitte docs

---

## The six Officer Dashboard views

| View | What it is | Status |
|------|-----------|--------|
| 1. Application Queue | Filterable list of apps pending review | 🟩 data exists, endpoint OV |
| 2. Application Detail (3-panel) | The main review screen — see below | mixed |
| 3. Decision Trail (Panel 2) | Glass Box: every rule + policy result | 🟦 data / 🟩 render |
| 4. Document Viewer (Panel 3) | Original image + extracted fields + fraud | 🟥 viewer endpoint gap |
| 5. Decision Panel | Caseworker action: the human decides | 🟩 OV |
| 6. Audit Log | Immutable record of officer actions | 🟩 OV |

---

## The three-panel Application Detail view

This is the screen. Linked across all panels by `dis_application_id`.

```
┌─────────────────────────────────────────────────────────────┐
│  PANEL 1: LLM SUMMARY        │  PANEL 2: GLASS BOX RULE TRACE │
│  (Gemma 4 / Praxia) 🟪 OV-IP │  (Drools + OPA) 🟦 data 🟩 UI  │
│  Plain-English narrative      │  Every rule fired, with        │
│  of the application + the     │  reasoning + evidence refs     │
│  recommendation rationale     │                                │
├──────────────────────────────┴────────────────────────────────┤
│  PANEL 3: EVIDENCE / DOCUMENT VIEWER  🟥 endpoint gap / data ok │
│  Original doc image  │  Extracted fields  │  Fraud signals      │
└────────────────────────────────────────────────────────────────┘
```

---

## PANEL 1 — LLM Summary  🟪 OV-IP

Gemma 4 narrative summary (Praxia-trained), served from **our** API on Azure. **This will never appear in any Deloitte contract — it is OV IP.** You define the shape. Suggested:

```json
{
  "dis_application_id": "...",
  "summary": "Skilled Worker application from a software engineer sponsored by [Sponsor]. Salary £52,000 exceeds the going rate. All documents extracted cleanly; financial evidence sufficient. One soft flag on document quality of the employment letter. No hard fails.",
  "recommendation_rationale": "Recommended for MANUAL_REVIEW due to soft flag SF-03 only; no eligibility or compliance failures.",
  "model_version": "gemma-4-praxia-v1",
  "generated_at": "..."
}
```
> Build the panel to render a summary string + rationale. Mock it now; wire to the Azure LLM endpoint when that job is done.

---

## PANEL 2 — Glass Box Rule Trace  🟦 data (Deloitte) / 🟩 render (OV)

Two backing tables, both fully defined in the canonical schema.

**Drools — from `rule_results`:**
| Field | Use |
|-------|-----|
| `rule_id` | e.g. `RULE-W03` |
| `rule_name` | display label |
| `rule_category` | UNIVERSAL / SKILLED_WORKER / FRAUD |
| `outcome` | PASS / FAIL / SKIP / SOFT_FLAG / HARD_FAIL / NOT_APPLICABLE |
| `reasoning` | **the Glass Box explanation string — render this** |
| `evidence_refs` | array → links to documents/extractions/checks |

**OPA — from `opa_results`:**
| Field | Use |
|-------|-----|
| `policy_id` | e.g. `OPA-H01`, `OPA-S04` |
| `policy_name` | display label |
| `policy_type` | HARD / SOFT |
| `outcome` | ALLOW / DENY / FLAG / REVIEW_REQUIRED / PASS |
| `denial_reasons` | array of strings — render under a DENY/FLAG |

Render as the decision trail: group by PASS/FAIL, show `reasoning` (Drools) and `denial_reasons` (OPA), make `evidence_refs` clickable into Panel 3.

---

## PANEL 3 — Evidence / Document Viewer  🟥 ENDPOINT GAP / data exists

**This is the real gap.** No `documents` endpoint is defined in any of the three Deloitte Confluence pages (OpenAPI spec, Recommendation contract, Datadog runbook). The recommendation payload gives component *scores*, not the underlying documents.

**But the data exists** — `documents` + `document_extractions` tables are fully defined. So this is the same pattern as the queue: data's in Postgres, the read endpoint is OV-built.

**Suggested endpoint:** `GET /applications/{id}/documents`

**Per document — from `documents`:**
`document_id`, `document_type` (PASSPORT / BANK_STATEMENT / EMPLOYMENT_LETTER / PAYSLIP / P60_TAX / IELTS_CERTIFICATE / DEGREE_CERTIFICATE / TB_CERTIFICATE / UTILITY_BILL / POLICE_CERTIFICATE / NATIONAL_ID / BRP), `document_tier`, `criticality` (CRITICAL/SUPPORTING), `gcs_path` (→ signed URL for the image), `processing_status`, `quality_score`.

**Extraction — from `document_extractions`:**
`normalised_fields` (JSONB — the extracted fields to show beside the image), `extraction_confidence`, `fraud_score`, `fraud_status` (CLEAR/LOW_RISK/MEDIUM_RISK/HIGH_RISK/CRITICAL), `fraud_signals` (JSONB breakdown: metadata_analysis, font_consistency, layout_anomaly, document_quality, cross_doc_consistency, mrz_check, content_plausibility).

> Side-by-side layout: image (left) | normalised_fields (centre) | fraud_signals (right).
> **CoS is NOT a document** — it lives in `application_payload` JSONB, resolved via register lookup. Do not render it in the document viewer.

---

## VIEW 1 — Application Queue  🟩 (data exists, endpoint OV)

`GET /applications` — params: `status` (filter), `visa_type`, `page`/`page_size`, `sort` (`submitted_at` indexed).

List-row shape:
```json
{
  "page": 1, "page_size": 50, "total": 1240,
  "items": [{
    "dis_application_id": "...", "source_application_id": "HO-SW-2026-76350499",
    "source_channel": "govdirect", "visa_type": "skilled-worker",
    "applicant_name": "Anjali Bose", "status": "MANUAL_REVIEW",
    "recommendation": "MANUAL_REVIEW", "completeness_score": 100,
    "submitted_at": "2026-03-29T09:42:18Z"
  }]
}
```

---

## VIEW 2 root — Recommendation payload (detail header)  🟦 specced

`GET /applications/{id}` returns the decision-callback shape (from `decisions`):

```json
{
  "dis_application_id": "...",
  "recommendation": "APPROVED",
  "recommendation_reason": "All eligibility and compliance criteria met",
  "hard_fails": [], "soft_flags": [],
  "component_scores": {
    "passport": {"score":95,"status":"VALID","confidence":0.95},
    "financial": {"score":92,"status":"SUFFICIENT","confidence":0.92},
    "employment": {"score":88,"status":"VERIFIED","confidence":0.88},
    "english_language": {"score":91,"status":"MET","confidence":0.91},
    "immigration_compliance": {"score":100,"status":"COMPLIANT","confidence":1.0},
    "criminal_record": {"score":100,"status":"CLEAR","confidence":1.0},
    "health": {"score":85,"status":"MET","confidence":0.85},
    "document_quality": {"score":78,"status":"ACCEPTABLE","confidence":0.78},
    "fraud_risk": {"score":95,"status":"LOW_RISK","confidence":0.95,"raw_fraud_score":0.05}
  },
  "rules_summary": {"drools_rules_evaluated":20,"drools_rules_passed":20,"drools_rules_failed":0,
                    "opa_hard_evaluated":6,"opa_hard_passed":6,"opa_soft_evaluated":6,"opa_soft_passed":6},
  "completeness_score": 100, "completeness_status": "COMPLETE",
  "generated_at": "...", "drools_version":"1.2.0", "opa_version":"1.1.0",
  "note": "This is a system recommendation to assist caseworker decision-making. Final determination rests with the authorised decision-maker."
}
```

### Component score bands (all 9 identical)
| Band | Score | Colour |
|------|-------|--------|
| Good | ≥85 | green |
| Review | 60–84 | amber |
| Fail | <60 | red |

Status labels (good / review / fail): passport VALID/REVIEW_REQUIRED/INVALID · financial SUFFICIENT/REVIEW_REQUIRED/INSUFFICIENT · employment VERIFIED/REVIEW_REQUIRED/UNVERIFIED · english_language MET/REVIEW_REQUIRED/NOT_MET · immigration_compliance COMPLIANT/REVIEW_REQUIRED/NON_COMPLIANT · criminal_record CLEAR/REVIEW_REQUIRED/FLAGGED · health MET/REVIEW_REQUIRED/NOT_MET · document_quality HIGH_QUALITY/ACCEPTABLE/LOW_QUALITY · fraud_risk LOW_RISK/MEDIUM_RISK/HIGH_RISK

---

## VIEW 5 — Decision Panel  🟩 OV

Caseworker action. **DIS recommends; the caseworker decides.** Actions: Approve / Reject / Request More Info — each with a **mandatory reason field**. This writes the human decision; it does not exist in the pipeline. OV builds the write endpoint. Keep "recommendation" language everywhere — the human holds authority.

---

## VIEW 6 — External checks (supporting data)  🟦 data

From `external_checks` — `check_type` (WORLDCHECK / INTERPOL / PASSPORT_VERIFY / BORDER_CONTROL / DEVICE_IP_RISK / EMAIL_PHONE_REPUTATION), `check_status` (CLEAR/FLAGGED/BLOCKED/ERROR/TIMEOUT), `risk_level`, `flags` (JSONB). World-Check is LIVE; the other 5 are MOCK in Phase 1. Surface in the detail view alongside the rule trace.

---

## `applications.status` lifecycle (confirmed from schema)

`CREATED → INGESTED → EXTRACTING → EXT_CHECKS → DECIDING → DECIDED`, plus `MANUAL_REVIEW`, `FAILED`, `CALLBACK_SENT`.
- **Queue filter:** `status = 'MANUAL_REVIEW'`
- In-flight: INGESTED/EXTRACTING/EXT_CHECKS/DECIDING · Done: DECIDED/CALLBACK_SENT · Error: FAILED

---

## 4 rendering gotchas

1. **null ≠ 0 (NOT_APPLICABLE)** — render greyed "N/A", not 0/red (e.g. health/TB for exempt nationalities, biometric for GovDirect).
2. **MISSING is a real status** — scores 0, status MISSING. Distinct from N/A.
3. **Fraud is inverted at source** — render the component `score` (already flipped, higher=better), never `raw_fraud_score`.
4. **Phase 1 has no REJECT** — reject maps to MANUAL_REVIEW. You'll see APPROVED and MANUAL_REVIEW only.

---

## What's genuinely outstanding (and whose)

| Item | Owner | Action |
|------|-------|--------|
| Document viewer endpoint (`GET /applications/{id}/documents`) | 🟥 OV builds, but extraction output shape is Deloitte's | Build the endpoint; confirm `normalised_fields` / `fraud_signals` JSONB shape with Ranita/Satyarth |
| LLM summary endpoint (Panel 1) | 🟪 OV (Azure) | Your separate build — define shape, wire later |
| Decision write endpoint (Panel 5) | 🟩 OV | Build — writes human decision back |
| `applications.status` enum | confirmed | none |

**Everything needed to start building is here. The two real "ask Deloitte" items are narrow: the extraction `normalised_fields`/`fraud_signals` JSONB shape for Panel 3. Everything else is OV-side or already specced.**
