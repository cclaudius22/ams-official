# Reply draft — Application list / Review Queue API (to Neeraj) — 17 June 2026

Vetted against the as-built replica (the E1 queue we built) + `DISStatusResponse`
(`src/api-contracts/dis.ts`). Decision folded in: **reuse Neeraj's Process Status
Check response shape for the row, but TRIMMED to a list row + `applicant_name` /
`visa_type` added.** Channel model (clarified 17 Jun): DIS is deployed **per single-channel environment** (VisaKey DIS, GovDirect DIS) — a deployment holds only its own channel's data, so the per-deployment `X-Source-Channel` header is correct as-is. Any cross-channel aggregation is an AMS-side concern, **not Deloitte's** — so the draft asks only for the same contract per deployment, with NO merge/body-filter ask.

Grounding (shared as-built data): `completeness_score` INTEGER 0–100 (corpus 72–99);
`status` ∈ COMPLETE / INCOMPLETE_PENDING; `visa_type` stored `skilled-worker`;
`outcome`: the pipeline emits `RECOMMEND_APPROVE` / `RECOMMEND_REJECT` / `MANUAL_REVIEW` (⚠️ our replica DDL/seed still has the stale `APPROVE` / `MANUAL_REVIEW` — to be fixed in the build; see below).

---

**Subject:** RE: Application list / Review Queue API

Hi Neeraj,

Good progress — and yes, reusing the Process Status Check response shape is a sensible move. It already carries the IDs and channel we need (`dis_application_id`, `source_application_id`, `source_channel`), a numeric `completeness_score` in range (87), and real ISO timestamps. Let's base the queue row on it, with a couple of adjustments so it works as a **list**:

**1. The row — reuse the Status shape, trimmed, plus two fields.**
- **Keep:** `dis_application_id`, `source_application_id`, `source_channel`, `completeness_score` (numeric — as in the Status sample, not the `"191"` string from the first draft), `created_at` / `updated_at`, and `decision` (the outcome).
- **Drop for the list:** `pipeline_progress`, `documents`, `estimated_completion`. Those are per-application detail — exactly what the Status Check call already serves — and carrying them on every row is a lot of payload the queue screen doesn't render (for the review queue they're all `COMPLETED` anyway).
- **Add:** `applicant_name` (the queue is a list of people — an officer can't triage rows of UUIDs) and `visa_type` (the queue both filters and displays it; the Status shape drops it).

**2. List mechanics — pagination + envelope.** Add `page` + `page_size` (or a cursor) to the request, and return a list envelope with a **total count**, e.g.:
```json
{ "results": [ { …row… }, … ], "total": 128, "page": 1, "page_size": 25 }
```
"No filter → all applications" won't drive the screen at volume.

**3. Vocabulary — three values to pin so filters don't silently miss:**
- **visa_type:** one canonical value in both filter and response — storage is `skilled-worker` (lower/hyphen); the filter example used `SKILLED_WORKER`.
- **outcome:** the three valid values are `RECOMMEND_APPROVE`, `RECOMMEND_REJECT`, and `MANUAL_REVIEW` — these are the only values the pipeline produces (not `APPROVE`, not `REJECT`). Please align filters accordingly.
- **status:** there are two different "status" fields in play — the completeness verdict (`COMPLETE` / `INCOMPLETE_PENDING`) and the pipeline status (`PROCESSING` / `PROCESSED`). The filter's `status: ["COMPLETED"]` is ambiguous (and `COMPLETED` matches neither). Which one does the filter target, and what's its value set?

**4. Channel / deployments — just a confirmation.** We understand each environment is a **single-channel deployment** (the VisaKey DIS holds only VisaKey applications; the GovDirect DIS only GovDirect), so the per-deployment `X-Source-Channel` header is exactly right — no change needed there. Two small confirmations: (a) the **same contract / response shape** is what's deployed to each environment, so we can point the dashboard at either with one client; and (b) keep `source_channel` on each row (your Status shape already does) for display/attribution. Anything cross-channel sits on our side, not yours.

**5. Quick clarifications:**
- Which timestamp do `startDateTime` / `endDateTime` filter on — `created_at`, submission, or recommendation time?
- How does an application with no recommendation yet appear — `decision: null` / `PENDING`, or omitted? (The queue needs to handle in-flight cases.)
- `Bearer <Identity Token>` — what token type (GCP identity token for service-to-service?), and is it the same auth as the other read endpoints?

Gating for the screen to work: the row (1), pagination (2), and the vocab pinning (3). (4) and (5) are quick confirmations. Happy to hop on a call — once these are settled, the document should be in great shape.

Thanks,
Chris
