What Happened:
The model that worked on the 12th was Fable 5 which is no longer available. we have a use a different model and below is the context from the last session:

Phase 2F.1 + 2F.2 done — committed (2f725b1), pushed. The read layer now has a real
  database under it:

  What exists now:
  - db/ — Deloitte's own DDL, vendored verbatim with provenance (commit ecd23b9), a
  one-command Postgres replica (docker compose up → :5499), and a staging script that
  applies the single documented patch their broken create-set needs
  - scripts/seedReplica.ts — deterministic and idempotent: same 100 applications, same
  UUIDs, same scores, every run. 42 APPROVE / 58 MANUAL_REVIEW exactly matching the corpus
  ground truth, with the corpus's own failure-detail strings as the Glass Box reasoning — so
  when an officer opens a refused-on-going-rate case, the trace reads like a real one
  - A populated replica: 2,000 rule rows, 1,200 OPA rows, 700 external checks, 845
  extractions (with confidence bands matching Satyarth's real processor metrics — employment
  letters seed lower, as they should), full callback payloads, delivery events

  And the replica earned its keep before the first query — standing it up surfaced four
  schema facts no document review would have caught:
  1. Their DDL can't deploy on a fresh database (FK references a table the set renames) —
  that's OPEN-11, a free finding to hand Deloitte
  2. REVIEW_REQUIRED physically can't exist in opa_evaluations — the column is VARCHAR(10);
  the soft-flag value is FLAG. OPEN-4 closed by constraint, types and mock updated
  3. The 7th external check is SPONSOR_VERIFICATION — OPEN-8 closed, sponsor checking
  un-deleted under its third spelling this week
  4. The V5 §4 queue derivation got refined by actually running it: recommendation states
  now take precedence over completeness

  The V5 §4 derived-queue query runs against the replica and returns a working caseworker
  queue: 35 ready for review, 32 auto-recommended, 33 awaiting docs.

  What this unlocks: 2F.3 — the five read endpoints as route handlers over this database,
  which makes the dashboard demo run on real SQL against Deloitte's real schema with
  realistic data. After that, the provider flip and Panel 3 complete the picture.

  It's been a monster day, fam — two panels, a strategy pivot, a replica, and five schema
  corrections, all pushed. Want me to keep rolling into 2F.3, or wrap with a session-log
  update and pick it up fresh?

✻ Baked for 16m 41s

※ recap: Building the officer dashboard without waiting on Deloitte: Panels 1-2 plus a 
  seeded local replica of their real schema are done and pushed. Next action: build the five
  read-endpoint route handlers over that replica (Task 2F.3).

❯ yeah wrap up with the session log and lets get back fresh, you also said some serious     
  findings we need to report?                                                               
  
⏺ Wrapping up properly — session log first:

⏺ Update(SESSION_LOG.md)
  ⎿  Added 15 lines, removed 4 lines
      16  
      17  Nishit's reply: 17 June = timelines published, not endpoints; substantive a
          nswer Monday 15 June. With WBS ending 30 June, endpoints can't be assumed i
          n-window. **Pivot: OV builds the read layer (new Phase 2F)** — local Postgr
          es replica from their own DDL + synthetic seed data + V5 §6 endpoints as Ne
          xt route handlers behind the provider seam. Deloitte endpoints become a swa
          p option, not a dependency. Access asks (IAM DB user, KMS, GCS) to be sent 
          now. Chris's counter-email sent pinning delivery dates vs the 30 June WBS e
          nd and the owed 3-week UAT window.
      18  
      19 +### Afternoon (same day)                                                   
      20 +                                                                           
      21 +1. **Task 2.1 DONE** — `RecommendationSummaryPanel` (Panel 1): badge, deriv
         +ed score, statutory note, rules_summary tiles, flag chips, AI-generated cas
         +e summary + disclaimer, evaluation breakdown. Browser-verified. (`e83ac38`)
      22 +2. **Task 2.2 DONE** — `GlassBoxTracePanel` (Panel 2): 5-stage trace on as-
         +built vocab, denial_reasons rendered, N/A greyed, "Other checks" bucket so 
         +the audit trail never drops a result. Browser-verified. (`68a1142`)        
      23 +3. **Housekeeping** — V1/V2/V3 specs + DB proposal + June 7 brief archived 
         +to `docs/specs/historical/` with superseded banners; build-log refreshed; `
         +.playwright-mcp/` gitignored. (`11d16a3`, `f102e81`, `4cf8c3f`)            
      24 +4. **Demo env + identity** — `prj-demo-dis-6549` is the demo/dashboard host
         +; `sa-ov-dis-read@prj-demo-dis-6549.iam.gserviceaccount.com` created (uniqu
         +eId 118218356534822839751); 5-item access ask sent to Deloitte DevOps (Clou
         +d SQL IAM user + in-DB SELECT grants + KMS decrypt + GCS objectViewer + net
         +work path). (`586c1b1`)                                                    
      25 +5. **Phase 2F.1+2F.2 DONE** — `db/` schema replica (Deloitte DDL @ ecd23b9,
         + docker :5499) + `scripts/seedReplica.ts` (deterministic, 100 apps, 42 APPR
         +OVE / 58 MANUAL_REVIEW, corpus ground-truth reasoning). Findings: DDL creat
         +e-set defect (OPEN-11), OPA outcome VARCHAR(10) → soft flag is `FLAG` (OPEN
         +-4 resolved), 7th check = SPONSOR_VERIFICATION (OPEN-8 resolved), passport_
         +number_raw code/DDL drift (OPEN-12). (`2f725b1`)                           
      26 +6. Confluence page 113410081 (Doc AI processor metrics) reviewed → OPEN-9/1
         +0; added to Hermes watch list.                                             
      27 +                                                                           
      28  ### What's next
      29  
      21 -1. **Task 2.1 — RecommendationSummaryPanel** (mocks current as of this morn
         -ing)                                                                       
      22 -2. **Phase 2F.1–2F.3 — OV read layer** over local schema replica (V5 §1b)  
      23 -3. Monday 15th: Nishit's substantive answer; 17th: their published timeline
         -s → V5 §10                                                                 
      24 -4. Hermes-sibling repo-diff agent — priority rising (3 renames in a week)  
      30 +1. **2F.3** — the five read endpoints (V5 §6) as Next route handlers over t
         +he replica, behind the provider seam; then **2F.4** provider flip          
      31 +2. **Tasks 2.3/2.4 — Panel 3 (Evidence)**: external check cards + document 
         +extraction cards (replica now provides the data)                           
      32 +3. **Monday 15th:** Nishit's substantive answer (ask for endpoint *contract
         +s* alongside dates); **17th:** published timelines → V5 §10 contingency    
      33 +4. **Report to Deloitte:** OPEN-11 (broken DDL create-set), OPEN-12 (passpo
         +rt_number_raw drift), OPEN-9 (classifier label vocab), plus chase the acces
         +s asks                                                                     
      34 +5. Hermes-sibling repo-diff agent — priority rising (4 schema-affecting cha
         +nges in 8 days)                                                            
      35 +6. Replica note: `cd db && ./build-initdb.sh && docker compose up -d && npx
         + tsx ../scripts/seedReplica.ts --reset`                                    
      36  
      37  ---
      38  

⏺ Update(docs/specs/build-log.md)
  ⎿  Added 5 lines
      237  
      238  | Commit | Date | Tasks | Summary |
      239  |--------|------|-------|---------|
      240 +| `2f725b1` | 2026-06-12 | 2F.1, 2F.2 | **DIS schema replica + determinist
          +ic corpus seed** — OPEN-4/8 resolved by DDL constraints, OPEN-11/12 raised
          + |                                                                        
      241 +| `586c1b1` | 2026-06-12 | — | prj-demo-dis-6549 = demo/dashboard host (2F
          + deploy target) |                                                         
      242 +| `68a1142` | 2026-06-12 | 2.2 | **GlassBoxTracePanel (Panel 2)** — 5-stag
          +e trace, denial_reasons, browser-verified |                               
      243 +| `4cf8c3f` | 2026-06-12 | — | Fix .playwright-mcp gitignore location |   
      244 +| `f102e81` | 2026-06-12 | — | Housekeeping: V1/V2/V3 + DB proposal archiv
          +ed to historical/, build log refreshed |                                  
      245  | `11d16a3` | 2026-06-12 | — | Archive June 7 build brief to historical/ (
           superseded by V5 §6) |
      246  | `e83ac38` | 2026-06-12 | 2.1 | **RecommendationSummaryPanel (Panel 1)**
           — verified in browser |
      247  | `11b969b` | 2026-06-12 | — | V5 §1b strategy pivot — OV builds the read
           layer (Phase 2F) |

⏺ Bash(git add SESSION_LOG.md docs/specs/build-log.md && git commit -m "docs: session log +
      build log — 12 June wrap (panels 1-2, pivot, replica, access asks)" && git…)
  ⎿  [feat/dis-integration-v3 e554228] docs: session log + build log — 12 June wrap (pa
     nels 1-2, pivot, replica, access asks)
      2 files changed, 20 insertions(+), 4 deletions(-)
     … +15 lines (ctrl+o to expand)
  ⎿  Allowed by auto mode classifier
     
⏺ Wrapped — e554228 pushed, replica container stopped (data persists in the volume; the 
  one-liner to bring it back is in the session log). Fourteen commits on the branch since
  yesterday morning. The session log now tells the whole story for whoever opens it next —
  including us, fresh.

  The findings to report to Deloitte

  Yes — two genuine defects plus two discrepancies, all with receipts. Worth a short email
  or raising Monday with Nishit:

  Defects (report as bugs):

  1. Their DDL create-set fails on a fresh database (OPEN-11). 03_applications.sql declares
  a foreign key referencing application_payload, but 02_submission_payload.sql renames the
  table to submission_payload — the old definition is literally still in the file, commented
  out. Anyone standing up a clean environment from dis-data-layer feature/psqltable hits a
  hard error. We found it because we did stand one up; they evidently haven't. One-line fix
  on their side.
  2. Intake code and DDL disagree on passport_number_raw (OPEN-12). The intake service
  inserts a passport_number_raw column that doesn't exist in the new applicants DDL (hashed
  BYTEA only). Either intake crashes against the new schema, or the deployed schema still
  differs from the DDL — and if raw passport numbers are being stored where the schema says
  hashed-only, that's a data-protection question, not just a code bug. Phrase it carefully
  but do ask which is authoritative.

  Discrepancies (report as questions):

  3. opa_evaluations.outcome is VARCHAR(10) — REVIEW_REQUIRED physically can't be stored. If
  their OPA orchestrator ever emits it, the insert fails. What's the intended outcome
  vocabulary? (We've adopted FLAG from the constraint.)
  4. Classifier labels vs document_type vocabulary (OPEN-9):
  BIOMETRIC-RESIDENCE-PERMIT/EDUCATION-CERTIFICATE/MEDICAL-CERTIFICATE from the Doc AI page
  vs the schema's expected values — and no PASSPORT classifier class at all. Which
  vocabulary lands in documents.document_type?

  And the meta-point that ties them together, worth saying once: four schema-affecting
  vocabulary? (We've adopted FLAG from the constraint.)
  4. Classifier labels vs document_type vocabulary (OPEN-9):
  BIOMETRIC-RESIDENCE-PERMIT/EDUCATION-CERTIFICATE/MEDICAL-CERTIFICATE from the Doc AI page
  vs the schema's expected values — and no PASSPORT classifier class at all. Which
  vocabulary lands in documents.document_type?

  And the meta-point that ties them together, worth saying once: four schema-affecting
  protocol (and our Hermes agent internally). Every one of these we caught by audit, not by
  being told.

  being told.

  Where we pick up fresh

  Where we pick up fresh
  Where we pick up fresh


  vs the schema's expected values — and no PASSPORT classifier class at all. Which
  vocabulary lands in documents.document_type?

  And the meta-point that ties them together, worth saying once: four schema-affecting
  changes in eight days, none announced — this is the argument for a change-notification
  protocol (and our Hermes agent internally). Every one of these we caught by audit, not by
  being told.

  Where we pick up fresh

  2F.3 (the five read endpoints over the replica) → 2F.4 (provider flip) → Panel 3. Monday
  brings Nishit's answer — ask for contracts with the dates — and the access-ask chase.
  Everything's committed, pushed, and documented.

  Hell of a day's work, fam. Two panels live, the read layer's foundation running on their
  own schema, five open questions closed, four new ones armed with evidence. Sleep well 🚀

✻ Churned for 1m 25s

※ recap: Building the AMS officer dashboard on V5 contracts: Panels 1-2 and the seeded DIS
  schema replica are done and pushed, session wrapped at commit e554228. Next: build the
  five read endpoints over the replica (2F.3).