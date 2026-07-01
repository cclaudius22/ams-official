# DIS estate — leadership escalation email (draft) — 20 June 2026

Drawn from `dis-repos-deloitte/DIS_REPO_AUDIT_REPORT.md` §1 (state), §5 (schedule), §7 (asks).
**Schedule facts are grounded in Deloitte's own *Consolidated WBS With Risks* (19 June)** — the disputed WBS in `docs/wbs_disputed/` — so every date/figure below is theirs, not ours. Verified against the workbook: Integration testing 22–24 Jun; Final Stabilization 29–30 Jun; E2E/Regression/Performance 23–29 Jun; 10 open RED / 26 open YELLOW; Production App 17–24 Jul; rebuild dates removed per Assumption A4 (Doc Processor portability); the 5 read APIs are "next sprint / migration pending" and excluded from the 29–30 Jun E2E per Assumption A7.

Recipients: OV leadership. Sender: Christopher. Tighten/cut as needed before sending.

---

**Subject:** DIS readiness — where the build actually stands, and why the schedule doesn't close against 31 July

Team,

Short version: the DIS code is an **active, in-flight sprint — not abandoned work — but it is not handover-ready, and on Deloitte's own schedule it does not land in time for the 31 July deadline.** Two things need a decision from us this week: how we respond to the timeline, and which defects we hold as blocking. Detail below; full evidence in the consolidated audit report.

**1. Where the code stands (9 repos audited, evidence-backed, read-only)**

- **None of the nine repos is handover-ready** on the branch that actually deploys (`main`). The live work sits on `release/dev`, unmerged — `main` trails it by 19–124 commits. So this is a release/branch-discipline gap, not a stalled team.
- **There is real, verifiable progress on `release/dev`** — several hard defects are genuinely fixed there (a schema-creation crash, two database-column crashes, the recommendation vocabulary, a deploy test-gate). Credit where due.
- **But the most dangerous defect is not being fixed — and got worse.** Across five services, failure handlers acknowledge failed work as success with no dead-letter queue (a failed document/check is silently marked "processed"). In document-processing this **regressed** on the work branch: a commit titled *"fix: ack pubsub 200"* changed the failure path from HTTP 500 to 200, so failed documents are now explicitly acknowledged. This is a data-integrity and compliance exposure, and it survives on every branch we checked.
- Other branch-independent issues that a merge will **not** fix: over-privileged deployment identity (owner-equivalent), scoring thresholds that can't reach their own bands, PII (DLP) inspection that fails open, and Document AI custom models that are **untrained shells on every branch** — meaning the pipeline produces no useful output until the models are restored.

**2. The schedule does not close against 31 July — by Deloitte's own WBS (19 June)**

- **Production deployment is dated 24 July**, and the **entire production track is RED** (IAM, network, app, CI/CD). The risk register carries **10 open RED and 26 open YELLOW** items.
- **Their rebuild plan has no firm start.** Assumption A4 states dates were **removed from the rebuild plan because of the Document AI / "Doc Processor portability" dependency** — the same untrained-model blocker our audit found. Everything downstream (staging, production) is gated on a rebuild whose dates Deloitte have themselves withdrawn.
- **The maths doesn't work.** Production lands 24 July; a three-week UAT cannot complete before 31 July when the thing under test isn't deployed until the 24th. Even staging (7–13 July) leaves under three weeks — and staging isn't production.
- **It also doesn't cover us directly.** The five read APIs our AMS dashboard depends on (application list, recommendation, glass-box trail, documents, external checks) are scheduled as **"next sprint," code-ready but "migration pending to OV env,"** and Assumption A7 says the 29–30 June E2E run we're being given **explicitly excludes** that updated API spec. So our integration dependency isn't testable inside this engagement window.

**3. What we're asking / decisions needed**

1. **Decision on the 31 July deadline.** On Deloitte's own plan it is not achievable; we should reconcile this with them in writing and decide whether to move the date, de-scope, or restructure the variation — before we commit anything downstream of it.
2. **Ask Deloitte to merge `release/dev` → `main` and protect it**, so the deployable branch is the real work and our audit/sign-off is meaningful.
3. **Hold the branch-independent defects as blocking** for handover — chiefly fail-closed Pub/Sub + dead-letter queues (and reverting the "ack 200" change), DLP fail-closed, threshold fixes, and least-privilege on the deploy identity. A merge does not resolve these.
4. **Get a firm answer on Document AI model restoration** — date and owner. It gates a working rebuild and is why their own rebuild dates were pulled.
5. **Get the five read APIs migrated to the OV environment and into the E2E run**, so our dashboard's dependency is actually validated this cycle rather than deferred.

Full evidence, per-repo scores, the `main`-vs-`release/dev` verification, and the branch-by-branch defect status are in the consolidated audit report (`DIS_REPO_AUDIT_REPORT.md`). Happy to walk anyone through it.

Best,
Christopher

---

*Drafting notes (not part of the email):*
- *Every schedule figure is from the Consolidated WBS (19 Jun); the only non-WBS inputs are the contract variation's 31 Jul deadline and three-week UAT (OV-side) — flagged as ours, not theirs.*
- *Kept balanced on purpose (acknowledges the real `release/dev` fixes) so it survives Deloitte pushback if forwarded.*
- *The "ack 200" regression and Assumption A4 (rebuild dates removed for Doc AI) are the two sharpest, least-disputable points — both are their own commits/words.*
- *If this goes only to internal OV leadership (not Deloitte), §3 items 2/4/5 can be reframed as "asks we will put to Deloitte"; if it's the basis for a message to Deloitte, soften the opening line.*
