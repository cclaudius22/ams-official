# AMS Integration Spec — Progress Log

**Last updated:** 2026-04-12 (post-crash, Confluence review complete)
**Current phase:** Spec revision (pre-implementation)

---

## Where we are

We completed a **full Confluence review** on 2026-04-12 and identified **10 critical gaps/conflicts** between the V2 spec and current Confluence state. The V2 spec needs a revision to V3 before any AMS frontend code is written.

**No code has been written yet.** We are still in spec mode.

---

## Confluence Review Results (2026-04-12)

### Pages read (all in DIS Delivery space, DD):

| Page | ID | Last Modified | Status |
|------|----|---------------|--------|
| Query Response Log | 3571713 | Apr 10 | Read in full — Q29-Q40 all responded |
| Decision Callback Payload Spec | 4817079 | Mar 23 | Read — unchanged since original, still pending Deloitte thresholds |
| Decision Map v1.1 | 22446098 | Apr 7 | Read — 7 tabs, 32 decision points |
| Canonical Extraction Schema | 27328513 | Apr 10 | Read — STILL A PLACEHOLDER on Confluence (draft is local only) |
| External API Checks & Integrations | 27197443 | Apr 10 | Read — 6 APIs defined, Border Control merged with Passport Verification |
| Drools & OPA Rules Engine | 26673153 | Apr 10 | Read — 20 Drools + 12 OPA policies (H01-H06 + S01-S06) |
| Data Extraction Strategy (Ranita) | 13402113 | Apr 11 | Read — updated YESTERDAY, fraud sub-signals for images vs PDFs |
| Preety's Extraction Schema | 15630341 | Apr 1 | Read — 7 critical docs, still has errors from Mar 31 |
| Document Extraction & Classification | 27230212 | Apr 10 | Read — hub page, Gemini Vision ruled out confirmed |

---

## 10 Critical Gaps Between V2 Spec and Confluence

### 1. OPA policy count wrong
**V2 says:** 6 hard policies only
**Confluence says:** 12 total — 6 HARD (H01-H06) + 6 SOFT (S01-S06)
**Impact on AMS:** Officer dashboard must display BOTH hard blocks and soft flags distinctly. V2 spec's Glass-Box Trail section only handles hard policies.

### 2. Drools rule count wrong
**V2 says:** "25+ rules" in multiple places
**Confluence says:** 20 rules consistently (5 universal + 15 skilled worker)
**Impact on AMS:** Correct count matters for the "23/25 rules passed" summary display. Should be "X/20 rules passed".

### 3. RULE-W09 missing from V2 spec
**V2 says:** No W09 in the rule table (jumps from W08 to W10)
**Confluence says:** RULE-W09 = Maintenance Funds (£1,270 / 28 days) in `skilled_worker/financial_rules.drl`
**Impact on AMS:** Missing rule in the glass-box trail display.

### 4. OPA policy IDs misaligned
**V2 says:** OPA-H03 = Document Fraud, OPA-H05 = Data Residency, OPA-H06 = Document Tampering
**Confluence says:** OPA-H02 = Passport Verification (MRZ mismatch), OPA-H03 = Interpol SLTD, OPA-H04 = Auth & Session, OPA-H05 = Document Fraud Score (>=0.90), OPA-H06 = Data Residency
**Impact on AMS:** Policy IDs displayed to officers will be wrong. Must use Confluence as authoritative.

### 5. External API change — Border Control merged
**V2 says:** Border Control is a separate 4th API
**Confluence says:** Border Control merged with Passport Verification. The 6 APIs are: (1) World-Check, (2) Interpol SLTD, (3) Passport Verification, (4) Device & IP Risk, (5) Email & Phone Reputation, (6) Sponsor Verification
**Impact on AMS:** External checks panel shows 6 cards — but different 6 than V2 specifies.

### 6. Fraud thresholds divergence
**V2 says (from Callback Payload Mar 23):** Hard-fail at 70, soft-flag 20-70, low-risk <20
**Confluence says (Extraction & Classification Apr 10):** 5-level: CLEAR 0-0.30, LOW_RISK 0.31-0.60, MEDIUM_RISK 0.61-0.80, HIGH_RISK 0.81-0.89, CRITICAL 0.90-1.00. OPA-H05 hard block at >=0.90
**Impact on AMS:** Fraud risk display in component scores and document viewer must use 5-level scale, not 3-level.

### 7. Preety's extraction schema still has errors
- Employment Letter listed as Tier 1 / GEMINI_VISION (should be Tier 2 / Custom Extractor)
- Degree Certificate section has `document_type: "IELTS_CERTIFICATE"` (copy-paste error)
- 7 corrections posted by Chris on 1 April — NO RESPONSE from Preety
**Impact on AMS:** Using our Canonical Schema (V1.2) as the authoritative source.

### 8. Canonical Schema not published to Confluence yet
- Confluence page 27328513 is still a placeholder ("coming soon")
- Full draft EXISTS locally at `docs/devdocs/Canonical Document Extraction Schema.md`
- This is what ALL teams should build against
**Action needed:** Publish to Confluence once reviewed.

### 9. Fraud sub-signals need image vs PDF handling
- Ranita's Data Extraction Strategy (updated yesterday) breaks fraud signals into sub-signals
- Different signals work on images vs PDFs (e.g., `editing_software` works on both, `no_camera` only on images, `unknown_fonts` only on PDFs)
- VisaKey = full image-based fraud analysis; GovDirect = rules engine checks only
**Impact on AMS:** Document fraud detail view must show which signals were applicable and which were N/A per document format.

### 10. Deloitte making real progress — DIS producing outputs soon
- 8-10 April: OPA-H01 through H04 COMPLETED by Deloitte
- Custom Classifier CREATED, model evaluation COMPLETED
- This means DIS may start returning real decision payloads sooner than expected
**Impact on AMS:** Urgency to get the frontend types right — mock data may be replaced by real DIS output soon.

---

## What exists

### Specs
- `2026-04-05-dis-integration-spec.md` — V1, superseded
- `2026-04-06-dis-integration-spec-v2.md` — V2, current working spec (810 lines, 4-phase plan) — **NEEDS V3 REVISION**

### Reference docs in `docs/devdocs/`
- `DD-DIS - DecisionDraft- V1-050426-111034.pdf` — 80+ page Deloitte spec
- `DD-DIS - Data Extraction Strategy-050426-194246.pdf` — extraction approaches comparison
- `OpenVisa_Pipeline_Architecture_v3.pdf` — end-to-end flow diagram
- `DIS — Application Data Taxonomy & Verification Str...md` — 3-field tuple classification
- `Canonical Document Extraction Schema.md` — **full draft, NOT YET on Confluence**

### Confluence pages (full index)
- Query Response Log — page 3571713 (Q1-Q40, living document)
- Decision Callback Payload Spec — page 4817079
- Data Extraction Strategy — page 13402113 (Ranita's, updated Apr 11)
- CoS Extraction Schema — page 14319635
- Field Structure (Ranita) — page 14876676
- Preety's Extraction Schema — page 15630341 (HAS ERRORS)
- Application Data Taxonomy — page 15663108
- CoS Pipeline README — page 16809998
- DecisionDraft V1 — page 19660805
- Decision Map v1.1 — page 22446098
- Anti-Abuse Strategy — page 26312707
- DIS Technical Reference — page 26640385
- DevOps & Infrastructure — page 26640432
- Drools & OPA Rules Engine — page 26673153
- External API Checks — page 27197443
- Document Extraction & Classification — page 27230212
- Canonical Extraction Schema (PLACEHOLDER) — page 27328513

---

## Next steps for V3 spec revision

1. **Fix all 10 gaps** listed above in a new V3 spec
2. **Correct OPA policy IDs and count** — 12 policies (6H + 6S), use Confluence IDs as authoritative
3. **Correct Drools rule count** — 20 rules, add RULE-W09
4. **Correct External API list** — Border Control merged, Sponsor Verification is 6th
5. **Update fraud thresholds** — 5-level scale from Extraction & Classification page
6. **Add soft flag OPA policies to Glass-Box Trail** — S01-S06 must be visible to officers
7. **Update TypeScript types** to match corrected IDs and counts
8. **Publish Canonical Schema to Confluence** page 27328513
9. Then proceed to Phase 1 implementation (type alignment)

---

## V2 spec 4-phase plan (still valid, just needs corrections)

- **Phase 1: Type Alignment** (3-4 days) — `dis.ts` contracts, extraction types, nationality mapping, enum standardization
- **Phase 2: AMS UI Components** (7-10 days) — 9 component score cards, glass-box trail (Drools + OPA hard + OPA soft), doc viewer, external checks panel (corrected 6 APIs), cross-doc consistency, LLM summary, duplicate comparison, completeness widget
- **Phase 3: Live DIS Integration** (5-7 days) — VK Backend submission, webhook handler, push notifications, AMS DIS data provider, officer decision write path
- **Phase 4: Platform Features** — RBAC, rules management UI, AI model config, BigQuery analytics

---

## Key contacts

- **Ranita** (Deloitte) — AI/ML, Document AI Custom Extractor, updated Data Extraction Strategy yesterday
- **Preety** (Deloitte) — Drools rules, extraction schema
- **Neeraj** (Deloitte) — Tech Lead, overseeing mock APIs
- **Vidhyotha** (Deloitte) — OPA policies (H01-H04 completed 8-10 Apr)
- **Satyarth** (Deloitte) — Fraud scoring (awaiting timeline on fraudulent samples)
- **Anjan** (Deloitte) — DevOps/Terraform, KMS strategy resolved (project-based keys in prj-dev-dis-9666)
- **Nishit** (Deloitte) — Runbook (SCRUM-18)
- **Maaz** (Deloitte) — Team member

## Open items from Deloitte

- Exact threshold values for decision logic — STILL PENDING (Callback Payload Spec unchanged since Mar 23)
- Component score weighting for overall_score — STILL PENDING
- 7 extraction schema corrections — posted 1 April, awaiting response
- DecisionDraft V2 — punch list posted Apr 6, awaiting V2
- PostgreSQL + BigQuery schema review — REQUESTED from Preety (Q32)
- Error/retry contract (DIS is down) — still open
- Satyarth timeline on fraud samples — PENDING
- GCP access for remaining team (Satyarth, Vidhyotha, Maaz, Nishit) — PENDING email confirmation

## Deloitte completed items (8-10 April)
- OPA-H01: Applicant nationality not on absolute exclusion list
- OPA-H02: World-Check result is not HIGH risk
- OPA-H03: Passport not flagged as stolen/lost in INTERPOL lookup
- OPA-H04: Submitting user has authenticated session
- Custom Classifier: Created and model evaluation completed
- Training data analysis: Completed
