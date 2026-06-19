# Reply draft — Deloitte 2-Cloud-Run split (to Neeraj) — 19 June 2026

Neeraj proposed splitting the read API into two Cloud Run services:
- **App_Review_Status** — bulk / specific app review status (for the dashboard) → maps to our E1 (queue list) + E2 (recommendation detail).
- **Module_status** — all APIs for the per-Application-ID status → our E3 (rule trail) + E4 (documents) + E5 (external-checks).

**Position:** fine — service count is Deloitte's deployment call and our provider seam absorbs it (one more base-URL per service in config). What matters is that the split doesn't fragment the contract. Does NOT block Panel 3 (we build that against the replica; the split only matters at the 2F.4 live-provider flip).

---

**Subject:** RE: 2 Cloud Run services for the read API

Hi Neeraj,

Yes, two Cloud Run services works for us — the split (review-status vs per-application detail) is a sensible boundary and the dashboard consumes it fine. A few things to lock so the split stays clean:

1. **Endpoint→service map** — please confirm which reads sit on each service (in particular, does the recommendation detail live on App_Review_Status, as we'd expect?).
2. **Identical contract across both** — same auth (`Authorization` bearer + `X-Source-Channel`), same response/error envelope, same vocabulary (`RECOMMEND_APPROVE` / `RECOMMEND_REJECT` / `MANUAL_REVIEW`), ISO-8601 dates. Two services must not drift into two dialects.
3. **Deployed per channel** — VisaKey and GovDirect each get their own pair, consistent with the single-channel deployments.
4. **App_Review_Status carries the review-queue contract** we discussed (pagination + list envelope + `applicant_name` + `visa_type`).

One naming note: "Module_status" overlaps with the existing Process Status Check API — could we clarify what "status" covers in each, so we don't conflate pipeline status with review status?

Otherwise — green light from our side.

Thanks,
Chris
