# Panel 3 — Evidence panel design (19 June 2026, approved)

Matches the Panel 1/2 pattern: `EvidencePanel({ disView: DISApplicationView })`, an Accordion section, **collapsed by default**, rendered after the Glass Box panel. Reads `disView.external_checks` + `disView.document_extractions` (+ `disView.documents` when present). Status-led / qualitative-signals-only per the scoring-display policy (memory `dis-scoring-display-policy`): no raw DIS grades — statuses, labels, fired signals, and factual extracted fields only.

## A. External Checks (SCRUM-64 2.3) — one card per `external_checks` row
- `check_type` (icon + label) · `check_status` chip (CLEAR / FLAGGED / …) · `risk_level` label (NONE…CRITICAL).
- Evidence from `response_payload` rendered readably (World-Check matched categories/lists; Interpol stolen/lost/revoked; Passport Verify document_status; etc.).
- **No `confidence_score` number.**

## B. Documents & Extraction (SCRUM-64 2.4) — one card per `document_extractions` row (enriched by the matching `documents` row when present)
- `document_type` + `processing_status` chip + criticality.
- `normalised_fields` as a key/value **evidence** list — factual values incl. numbers (salary £50,253, balance) stay; they're evidence, not grades.
- **Fraud:** `fraud_status` chip + the **fired** `fraud_signals` (signal name + flags, e.g. "font_consistency — FONT_INCONSISTENCY_DETECTED") as evidence. **No `fraud_score` number.**
- **Confidence:** a **subtle, field-local** "⚠ verify original — low extraction confidence" nudge, surfaced primarily when `extraction_confidence` is low (< 0.80, aligning with RULE-U05). **Not a gauge / High-Med-Low badge.** Confidence = per-field OCR/extraction reliability (`extraction_confidence`), explicitly **NOT** the reserved `recommendations.confidence` / completeness decision column.
- **"View original"** affordance → `image_url` (the `signUrl` stub); tagged "signed URLs pending (2F.5)".

## Edge cases
- mock fixture has no `documents` → doc cards fall back to extraction data only.
- app-level `cross_doc_fraud` is not on the composite view → **deferred** (per-doc `cross_doc_consistency` signal already covers it).
- null fields → "—".

## Test
Render test (happy-dom + the mock fixture): cards show the right chips/fields, AND a **governance assert** that no raw `fraud_score` / `confidence` number leaks into the officer view — encodes the status-led rule.
