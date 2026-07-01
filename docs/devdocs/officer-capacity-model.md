# Officer Capacity & Pressure Model — assumptions (PROVISIONAL)

**Date:** 2026-06-28 · **Status:** ⚠️ **PROVISIONAL — demo estimates, not validated facts.** To be refined with deeper research + **UKVI / government consultation**. Owner: Agent 1 (data/queue lane).
**Source research:** [`docs/cc-notes/2026-06-24-uk-caseworker-workload-research.md`](../cc-notes/2026-06-24-uk-caseworker-workload-research.md) (verified vs gov.uk / NAO / ICIBI).

## Why this exists
The demo's auto-allocation needs realistic per-officer numbers, or the board reads as "the system is drowning" (the opposite of the AMS pitch). These are the **assumptions** behind the capacity cap, the allocation ratio, and the officer-pressure framing. **They are deliberately changeable** — swap the numbers here, not the narrative.

## The model (two clocks, two phases)
- **End-to-end = Processing (machine) + Decisioning (human).** AMS/DIS does **processing** (extraction, rules, checks → a recommendation) near-instantly (2 weeks → <1 min). The **decision** stays human and is the **only real bottleneck**.
- **Two clocks — never conflate:** (1) **active officer touch-time** per case → drives capacity/headcount; (2) **elapsed time to decision** → drives the SLA / applicant experience.
- **AMS does NOT make a human decide faster.** Its value: it removes the 2-week processing burden so the officer's fixed daily capacity goes entirely to *decisions*, and the backlog is **visible + SLA-tracked**, not a black hole.

## The numbers (research-anchored estimates)
| Quantity | Value | Basis |
|---|---|---|
| Decision effort distribution | clear-approve ~10m / clear-reject ~20m / manual-RFI ~45m | research §estimates (no published PBS per-officer quota) |
| **Blended throughput** | **~20–25 decisions / officer / day** | derived from the distribution |
| **SLA (straightforward non-settlement)** | **15 working days** (Priority 5d, Super-Priority next day) | ✅ gov.uk (citable) |
| National scale (slider, never a stated fact) | 1M/yr ÷ ~250 working days ÷ ~20/day ≈ **~200 decision-officers** | derived; demo's 8 officers = one region |

> No published per-caseworker throughput exists for Skilled Worker / Student routes — these are **estimates**, bounded below by asylum's ~1/week (complex) and justified by PBS being document-led + pre-assembled. Validate with UKVI before quoting externally.

## Demo tuning decisions (DECIDED + IMPLEMENTED 28 Jun)
1. **`cap` = a day's DECISION capacity, 25/officer** — NOT a lifetime WIP ceiling. ✅ `CAP_PER_OFFICER = 25` in `auto-assign-all/route.ts`.
2. **Officers start fresh-ish** — ✅ seeded 1–5 carryover each in `src/data/seed/officers.ts` (was ~16, which produced the implausible 96/904).
3. **Outcome (measured 28 Jun): 152 allocated / 848 queued** — 7 specialists × cap 25, each at **25/25** (Evica the trainee → backlog by design, per the gate's accepted "visible backlog" intent); team clears 1,000 in **~7 working days, inside the 15-day SLA**. *(Not ~240 — that loose estimate assumed 8 officers × 30; real math is 7 active specialists × 25.)*
4. **Framing = "today's intake"** (a daily cycle): the backlog is the coming days' work inside SLA, with an explicit "clears in ~5 days · SLA 15 days" line — not a scary "904 drowning" dump.
5. **Officer pressure = stretched but SLA-green:** show high daily utilisation (busy, credible pressure) while staying inside SLA (managed). Honest, not alarmist.
6. **⚠️ Chart-scale alignment (coordinate with Agent 2):** the Officer-Workload chart (`LiveQueueMetrics.tsx`) currently colours by `>100 warning / >200 negative` thresholds — a "total caseload" scale that doesn't match the ~25–30 daily-capacity scale. **Pick one scale and make the allocator cap + the chart thresholds consistent.**

## To revisit (with research / government input)
- Real per-officer throughput + the effort distribution (UKVI consultation).
- The cap value + whether "load" is a daily slice or a multi-day WIP.
- SLA-clock pause rules for RFI / awaiting-applicant (Slice 3).
- The AMS productivity-uplift factor (research: ~2×, must pair with the Glass Box quality safeguard).
