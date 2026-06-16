# Reply draft — Read API Endpoints (to Nishit, cc Neeraj) — 16 June 2026

Vetted against V5 §6 + the as-built schema findings. Posture: building in
parallel against the published schema (not blocked); response schemas are the
gating ask; queue-endpoint defect added.

---

**Subject:** RE: Read API Endpoints — Two Asks for the 17th

Hi Nishit,

Thanks — good to see the five endpoints taken as discrete reads; that granular shape is the right call and maps cleanly to how the dashboard loads. Appreciate Neeraj's input.

We're building the integration layer in parallel against the published schema, so the dashboard build isn't waiting — but to wire it to your endpoints and confirm a clean cutover, a few things need to land:

**1. Response schemas (the priority).** The table covers requests but not responses. We need the response payload shape for each endpoint — field names, types, nesting — or we can't map them to the UI. Two specifics that will bite if missed:
- **Glass Box trail:** must include `opa_evaluations.denial_reasons`. The decision-callback payload omits this field (it lives only in the `opa_evaluations` table), and it's the text the caseworker reads to understand a flag — so the trail endpoint has to read from the table, not the callback.
- **Documents:** must return a retrievable image reference (GCS signed URL), not just `gcs_path` — the viewer renders the original alongside the extracted fields.

**2. The queue endpoint won't return the review queue as specced.** `GET /applications/status?startDateTime=&endDateTime=` filters on date only. Two problems:
- `applications.status` carries the document-completeness verdict (`COMPLETE` / `INCOMPLETE_PENDING` / `DOCUMENTS_REQUIRED`), set by document processing — it is never updated to the recommendation outcome. A query over `applications` can't identify the caseworker queue.
- The review queue is "applications whose recommendation is `MANUAL_REVIEW`" — which means joining `recommendations` and filtering on `outcome`. The list endpoint needs that filter, plus pagination (cursor or offset) and a `visa_type` filter. A date-range-only, unpaginated query won't drive the primary screen.

**3. Delivery dates.** Still need completion dates per endpoint for dev availability, for Tuesday's WBS review. Since these wrap queries over tables the pipeline already populates — and the consolidated status endpoint already touches all of them — 3–5 days for the set looks realistic. Please confirm against the engagement timeline.

**4. On the single consolidated endpoint.** Understood, and the performance rationale is fair for a single application's detail. But two things keep us on the granular reads: the consolidated `/{id}/status` is per-application, so it can't serve the list/queue regardless — a separate paginated queue endpoint is required either way; and folding documents + evidence into every detail call pulls heavy image/GCS payloads into fetches that often only need the summary. Keep the five granular reads as the integration surface; the consolidated call is welcome to remain as a convenience alongside them.

**5. Spec tidy-ups:**
- **Request body on GET:** the application id appears in the path (`{id}`), the `X-RequestID` header, and a request body (`{dis_application_id}`) — three times. A GET with a body is unreliable (proxies/clients drop it). Drop the body; the path id is enough.
- **X-RequestID:** conventionally a unique per-request tracing id, not the resource id. Either drop it (the path id suffices) or repurpose it as a genuine correlation id.
- **Date format:** suggest ISO 8601 (`2026-06-10`) over `DD-MM-YYYY` — it matches your own storage (`TIMESTAMPTZ`) and callback output, and removes ambiguity.
- **Error contract:** expected 4xx/5xx responses and the error body shape.

Happy to walk through on a call — the response schemas are the gating item; the rest we can iterate.

Thanks,
Chris
