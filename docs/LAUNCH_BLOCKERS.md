# AMS Dashboard — Launch Blockers (Production Readiness Register)

**Purpose:** the single list of things that are **fine for demo / Phase 1** but **must be resolved before REAL production** (real applicants, real decisions). If it's a stand-in today, this is where we record what it takes to make it real — so nothing mocked ever reaches a live case unnoticed.

**Last updated:** 2026-07-08

## How to read this

- **Phase 1 / demo (now):** the dashboard runs against mock or replica data. **Only World-Check is a live integration** — every other external check is a stand-in (this is true of Deloitte's DIS too, not just us). Mocks are fine here: we're demonstrating the *flow and the UX*, not making real decisions.
- **Production:** real applicants → **everything an officer sees must be a real result, or not shown at all.** A mocked "CLEAR" on a real case is a hard stop. Each item below must be either (a) made real, or (b) explicitly removed, before launch.

---

## Source-of-truth map — who produces what, and when it goes real

The dashboard shows two layers: **Deloitte's DIS gives us the *facts*; OV's models produce the *assessment* from those facts.** Everything is mocked today — this maps where each piece *will* come from and which switch makes it real.

| What the panel shows | Produced by | Real source | Goes real when… |
|---|---|---|---|
| Queue, extracted fields, documents, **Glass Box** trail, DIS recommendation (`RECOMMEND_*`), DIS component scores + completeness + fraud | **Deloitte DIS** | read APIs E1–E5 | **Deloitte's read APIs go live** |
| External checks (Interpol, passport, border, device/IP, email/phone, CoS) | **Deloitte DIS** (themselves mocks in Phase 1) | E5 | Deloitte APIs live *(+ real provider integrations in Phase 2)* |
| **PNC** check (Police National Computer) | **OV** (mock) | none today — DIS does not emit it | OV builds/integrates it, or it is dropped (**LB-1**) |
| **Rootedness / Intent / Overall risk + OV recommendation** | **OV models** (Azure) | OV model inference | **OV models deploy on Azure** (**LB-6**) |
| LLM case-summary narrative | **OV models** (Azure) | OV model inference | OV models deploy on Azure |

**Two independent "go-real" switches** — different owners, landing at different times:
1. **Deloitte's read APIs go live** → real DIS facts (replaces the mock/replica DIS data). The DIS panels — Glass Box, Evidence, recommendation — need only this.
2. **OV models deploy on Azure** → real OV assessment (replaces the mock scores + narrative).

The **OV Assessment panel needs BOTH** — it cannot show a real score until there are real features *from Deloitte* **and** a deployed model *from us*. It is therefore the last thing to become real, gated on two dependencies, not one. (Our model consumes Deloitte's data as input, so **Deloitte data correctness is upstream of our model's quality** — see `dis-repos-deloitte/DIS_CONFORM_TO_SPEC.md`.)

---

## OV-owned (our side)

| # | Blocker | Demo state | Required for production |
|---|---------|-----------|--------------------------|
| **LB-1** | **PNC check (Police National Computer)** | **OV-synthesised mock** — the criminal-record evidence shows a PNC "CLEAR" card produced by the AMS read layer; **DIS does not emit it.** Shown so the Home-Office demo's criminal-records section is complete. | A **real PNC integration** must exist, OR the card is removed. Decision still open: (a) Deloitte adds PNC as a real check in DIS, or (b) OV integrates PNC directly. **Until then, the PNC card must never display a mocked result on a live applicant.** |
| **LB-2** | **Dashboard authentication** | Open (no login) — deferred per build plan (after task 2.15). | Admin login + RBAC before any real applicant data is shown. |
| **LB-3** | **GCS signed URLs** | `signUrl.ts` is a stub — document links are placeholders. | Real GCS signed-URL minting so document evidence opens securely. |
| **LB-4** | **`deloitte` provider not wired** | Running on `mock` / `replica` providers (local Postgres replica of Deloitte's DDL). | The live `deloitte` provider must be built and pointed at the real DIS read API in the production environment. |
| **LB-5** | **Advisory per-case scores** | Deferred / opt-in; officer view is status-led (no numeric DIS grades). | Confirm the final per-case scoring-display policy before production. |
| **LB-6** | **OV Assessment panel (Rootedness/Intent model)** | **Mocked** — the OV trained risk models are not yet deployed; the panel shows synthetic scores. This is the deliberate scores-shown exception (V5 §7a). | Deploy the OV models for inference on **Azure** (compute-once → store → read); point the OV read path at real stored assessments. **A synthesised risk score must never be shown on a live applicant.** |
| **LB-7** | **SLA policy / operational clocks (Policy Manager)** | **Placeholder copy** — the officer gateway "SLA policy" tile reads "Defined in Policy Manager" (`c4562eb`, 8 Jul). No operational SLA is computed: the earlier calendar-day derivation drifted into "everything overdue" as real time passed the curated corpus dates, so it was replaced with honest illustrative copy. Derivation helpers (`src/lib/officerGatewayStats.ts`) exist + tested but are unwired. | A first-class **Policy Manager** module for client-configured SLA rules: visa route / product type, workflow stage, SLA duration, **working-day calendar**, public holidays, RFI pause/resume, escalation thresholds, overdue definitions, effective-date versioning, audit trail. Replace the calendar-day helper (`slaDaysRemaining`) with **true working-day maths** once it exists. **No SLA figure may be presented as the client's operational policy until configured through Policy Manager.** Spec: `docs/cc-notes/2026-07-06-sla-policy-module.md`. |

---

## Deloitte-owned (DIS) — see `dis-repos-deloitte/DIS_CONFORM_TO_SPEC.md` for the full, evidence-backed list

| # | Blocker | Demo state | Required for production |
|---|---------|-----------|--------------------------|
| **LB-D1** | **External checks are mocks** (all except World-Check) | Interpol, passport-verify, border-control, device/IP-risk, email/phone-reputation, CoS — all return canned results in Phase 1. | Real integrations for each before production (Phase 2). |
| **LB-D2** | **Doc AI models untrained** | Custom classifier/extractors are empty shells → no real extraction. | Trained, deployed processor versions (DIS_CONFORM_TO_SPEC **A8**). |
| **LB-D3** | **Conformance items** | `main` diverges from spec on vocab, schema, thresholds, fail-closed behaviour. | All P0/P1/P2 items in `DIS_CONFORM_TO_SPEC.md` fixed + contract tests green. **Do not duplicate here — that doc is the source of truth.** |

---

## Sequencing note
Per the conformance doc's timeline, the **3-week UAT cannot start** until Deloitte confirm the conformance items are fixed and the external checks are real (not mocks). The OV-owned blockers above run in parallel and are our responsibility to close.

---

*This register is the demo↔production honesty gate: anything mocked for a demo is acceptable only while it appears here with a clear "make-real-before-launch" action.*
