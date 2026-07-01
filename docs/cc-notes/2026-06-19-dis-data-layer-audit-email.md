# dis-data-layer audit email (to Deloitte) — 19 June 2026

Repo-review email to Siddharth, Nishit, Ranita, Fairoze re: `dis-data-layer` on current `main`. 4 issues + 1 confirm. Vetted by CC; **issue 1 (SCRUM-265 FK) independently confirmed** by our replica work — `db/build-initdb.sh` sed-patches the same FK (our OPEN-11). **Point 5 (outcome CHECK vocab)** added from our `RECOMMEND_*` finding (we left ourselves a "confirm vs Deloitte's current DDL" note when patching the replica).

---

**Subject:** dis-data-layer review — issues to close before rebuild-ready

Hi Siddharth, Nishit, Ranita, Fairoze,

Continuing the repo review, I've now checked dis-data-layer on current main.

Clear progress first: the schema work is merged to main, the active DDL includes the key tables we expected — recommendations, callback_events, opa_evaluations, drools_evaluations — the old decisions table issue is corrected in the live DDL, and confidence is present and nullable on recommendations. Good to see.

A few issues remain to close before this is rebuild-ready:

**1. Schema creation fails — broken FK in 03_applications.sql (SCRUM-265)**
02_submission_payload.sql:25 creates submission_payload, but 03_applications.sql:34 references application_payload(submission_id) — a table that is never created (it exists only as a commented-out block at 02:1). So schema creation fails when building applications. This is the SCRUM-265 DDL FK bug, still present in live main. We hit this independently building our own read-layer replica — it only builds because we patch the FK locally (a sed rewrite of the reference), so the break is real and reproducible.
Fix: point the FK in 03 at the table that actually exists — submission_payload — and confirm submission_payload is the final canonical name so we're not carrying two names.

**2. Cloud Build still hardcoded to dev**
cloudbuild-schema.yml has dev-specific values hardcoded — DB host 10.0.78.14, DB name psql-dev-dis, DB user sa-dev-dis-psql@prj-dev-dis-9666.iam, and a private worker pool under prj-dev-dis-9666. This needs parameterising for the SCRUM-263 rebuild path so it can target prj-val-dis / validation config without editing the repo.

**3. Schema deployment is not migration-safe**
The current approach runs ordered CREATE TABLE IF NOT EXISTS scripts. That's fine for a clean bootstrap once the FK is fixed, but it doesn't safely handle schema evolution, column/constraint changes, indexes, rollbacks, or drift. At minimum we need a clear migration/versioning approach and a pre-merge validation step that catches table/FK mismatches like the one above.

**4. Stale commented blocks to remove**
Old-name references remain in comments: application_payload at 02_submission_payload.sql:1 and drop_tables.sql:9, and an old submission_payload JSONB block at 11_recommendations.sql:15. Please remove these so they can't be copied back or create ambiguity later.

**5. Confirm recommendations.outcome CHECK matches the pipeline vocabulary**
The recommendations.outcome CHECK constraint should accept the values the recommendation pipeline actually emits — RECOMMEND_APPROVE / RECOMMEND_REJECT / MANUAL_REVIEW. An earlier snapshot we worked from carried the imperative APPROVE / REJECT / MANUAL_REVIEW; if live main still has that, every pipeline insert would fail the CHECK — the same class of DDL-vs-reality mismatch as #1. Quick to confirm on current main; if it already reads RECOMMEND_*, please disregard.

Could the data-layer team come back with a date for addressing the above, ideally as part of the SCRUM-263 rebuild readiness work?

Best,
Christopher
