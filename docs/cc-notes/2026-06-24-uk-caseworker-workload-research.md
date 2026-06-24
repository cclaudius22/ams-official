# UK Visa Caseworker Workloads — research memo (grounding the AMS demo)

**Date:** 2026-06-24 · **Why:** the demo auto-assigned 1,000 apps with one officer landing 463 — implausible. This memo sets realistic numbers, all verified against primary sources, to ground the queue + allocation demo. **Method:** 16-agent research workflow (4 angles × adversarial verification vs gov.uk / NAO / ICIBI).

## Headline
**There is NO publicly published per-caseworker throughput quota for Skilled Worker or Student decision-makers.** Home Office caseworker guidance covers *procedure*, not productivity (verified against the Skilled Worker + Student caseworker guidance, May/Mar 2026). The only published per-caseworker productivity data is for **asylum** — a different, interview-heavy route that must **not** be used as a proxy for document-led PBS work/study casework.

→ So we anchor the demo on what IS official and citable — the **service-level standards (timeliness)** — and treat per-officer throughput as a clearly-labelled *estimate*, not a cited fact.

## Citable facts (confirmed vs primary sources)

### UKVI service standards — the real anchor for the officer/queue UI
| Standard | Figure | Source |
|---|---|---|
| Straightforward non-settlement (work/study/visit), **outside UK** | decision within **3 weeks (15 working days)** | [gov.uk processing times (outside UK)](https://www.gov.uk/guidance/visa-processing-times-applications-outside-the-uk) (upd. 22 Oct 2025) |
| …probabilistic standard | **90% ≤3 wks, 98% ≤6 wks, 100% ≤12 wks** (straightforward only) | UKVI customer service standards (gov.uk) |
| In-country extensions/switches | **~8 weeks** | [gov.uk processing times (inside UK)](https://www.gov.uk/guidance/visa-processing-times-applications-inside-the-uk) |
| Settlement / family | **~12 weeks** | gov.uk (outside UK) |
| **Priority** service | decision **≤5 working days** (£500) | [gov.uk faster decision](https://www.gov.uk/faster-decision-visa-settlement) |
| **Super Priority** service | decision **by end of next working day** (£1,000) | gov.uk faster decision |

### Volumes vs staffing
- **~3 million** entry-clearance decisions/year. YE Dec 2025: **407k** sponsored-study + **168k** work main-applicant grants + ~2.2m visitor ([gov.uk immigration stats YE Dec 2025](https://www.gov.uk/government/statistics/immigration-system-statistics-year-ending-december-2025/summary-of-latest-statistics)).
- UKVI: **5,000+** staff across 3 processing hubs (low-confidence headcount source).
- Implied: lighter-touch visit/study/work routes run at *far* higher per-head throughput than asylum ("tens per week" order), but no clean published per-caseworker number.

### Asylum contrast (complex casework — the FLOOR, not our route)
- Productivity = **4.2 "principal stages"/caseworker/month** (Dec 2022) → **7** (Jun 2023) → **10** (Oct 2023); PM target was 12 (treble). ≈ **~1–2.3 decisions/caseworker/week**. (ICIBI *Inspection of asylum casework Jun–Oct 2023*, para 3.28 — verified verbatim.)
- **~13 decisions/caseworker/quarter in 2025** (≈1/week) (NAO *An analysis of the asylum system*, Dec 2025).
- Leeds **PACE** pilot: **1.3 → 2.7 decisions/caseworker/week** (Migration Observatory / ICIBI testimony).

### Automation / streamlining uplift — defensible factor ≈ 2×
- ICIBI: 4.2 → 10 principal stages/month = **~2.4×** via streamlined processing (Dec 2022–Oct 2023).
- Leeds PACE: **~2.1×** (1.3→2.7/week). NAO cohort-simplification: **~1.9×** (690→1,310/week).
- PM's **3× target was approached but NOT met** → realistic ceiling ~2.4–2.5×; **central estimate ~2×**.
- **CRITICAL CAVEAT:** ICIBI found the volume push eroded quality — routine QA "sacrificed for productivity", 3.5% QA target missed every month, 42% of sampled decisions had significant/fail errors (to May 2025). **Any uplift claim must be paired with a quality-preservation mechanism.** AMS's Glass Box audit trail + human-in-the-loop *is* that mechanism — this is the honest framing.

## Estimates (NOT published — derived, labelled as such)
For a standardised, document-led **Skilled Worker** case that genuinely reaches an officer:
- **Baseline ~8–12 decisions/officer/day** (vs asylum ~0.5/day, because no interview + points-based + document-led).
- **With AMS assist ~16–24/officer/day** (~2×, in line with the streamlining evidence above).
- **Active caseload (WIP) ~25–35** per officer at a time (≈1–2 days' work within the 15-working-day SLA window).

## Demo implications (→ feeds the 0+1 spec)
1. **Frame the officer/queue UI around SLA timeliness** (days-against the 15-working-day standard; Priority/Super-Priority tiers) — citable, not fabricated.
2. **Per-officer active-caseload CAP (~30, configurable)** — no more "463". Treat 1,000 as the **intake/backlog**; allocate within capacity; show the remainder as queued.
3. **Capacity-aware, balanced allocation** — specialization + *live* workload (recomputed as the batch fills) + cap.
4. **AMS uplift narrative:** "~2× throughput, consistent with documented Home Office streamlining (1.5–2.5×), while *preserving* quality via the Glass Box + human-in-the-loop — addressing the quality erosion the ICIBI flagged."
