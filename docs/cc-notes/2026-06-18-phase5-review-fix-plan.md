# Phase 5 review — fix plan (resume artifact) — 18 Jun 2026

Adversarial review of the DIS read layer + wiring (workflow `review-2f3-read-layer`, run `wf_bf84374b-7ff`; 4 dimensions × find → adversarially-verify). **29 confirmed / 1 refuted**, de-duplicated to ~15 distinct issues. **No high-severity** after adversarial downgrade — mostly latent bugs masked by the current seed + cleanups. Apply the FIX-NOW set, re-verify, commit. This file is the durable resume point (the workflow output lives in the ephemeral session transcript).

## FIX NOW

### Correctness / crash
1. **rules_summary can be undefined → Panel 2 crash.** `recommendation.ts:134` `payload.rules_summary as RulesSummary` → default to a zeroed `EMPTY_RULES_SUMMARY`. Same file: `component_scores ?? {}` (~152) is not a valid `ComponentScores` → build a 9-key all-null default; `completeness_status` fallback `row.status as CompletenessStatus` (122-124) can be `'CREATED'` (not a CompletenessStatus) → guard to a defined value.
2. **Reviewer page: no fetch cancellation + silently keeps the previous applicant's DIS view** if a new id's `/view` fetch fails. `page.tsx` effect (72-175): add an `active`/AbortController guard, ignore post-await setState when stale, and reset `disView` at the start of each non-demo run so a failed `/view` falls back to mock (not applicant A's data). Also fold in: don't present mock as real for a failed real id (track a dis-error/empty state) — minimal version: reset to mock + only treat demo ids as the mock path.
3. **Pagination unvalidated → `?page=-1` returns real tail rows via negative `slice`.** `route.ts:24-27` clamp `page=Math.max(1, …||1)`, `page_size=Math.min(MAX, Math.max(1, …||20))`; guard `start=Math.max(0,(page-1)*pageSize)` in `queue.ts:~114` and `mock-provider.ts:52-53`. NaN must never reach `.slice`.

### Type fidelity
4. **PHOTO not in `DocumentType`** (100 real rows). `dis.ts:429-441` → add `'PHOTO'`.
5. **`extraction_method` `CUSTOM_EXTRACTOR` not in `ExtractionMethod`.** `documents.ts:151` → normalize at the boundary (`CUSTOM_EXTRACTOR`→`DOC_AI_CUSTOM_EXTRACTOR`, `ID_PARSER`/`FORM_PARSER`→`DOC_AI_*`) rather than the bare `as` cast over a free VARCHAR.
6. **`documents` `::text` non-ISO timestamps** (`'… +00'`, no `T`/`Z`). `documents.ts:132,166-167` → drop `::text`, route `created_at`/`updated_at` through `toIso()` like the other four modules.

### Cleanup / consistency
7. **Dead callback plumbing** (left by the Phase-1 change). `queue.ts:72-76,95` + `recommendation.ts:102-106,147` → remove the `EXISTS(callback_events … 'DELIVERED')` subquery + `callback_delivered` column + the `callbackDelivered` arg (deriveQueueState ignores it). Keep `QueueStateInput.callbackDelivered` as a Phase-2-reserved optional. Fix the now-false header/inline comments (`queue.ts:5-6,60-62`; `recommendation.ts:28-29`).
8. **Dead `applicants` JOIN.** `recommendation.ts:108` — `JOIN applicants ap` but no `ap.*` used → remove.
9. **E1 envelope inconsistency.** `route.ts:31` `{success, ...result}` (pagination at top level) → `{success, data: result}` to match the other 5 DIS routes. No consumer yet → safe.
10. **externalChecks ISO string-branch.** `externalChecks.ts:78` `String(r.created_at)` → `new Date(r.created_at).toISOString()` (the unreached defensive branch).
11. **`documents` `ORDER BY criticality DESC`** is a lexical sort → ranks `SUPPORTING` above `CRITICAL`. `documents.ts:103,137` → `ORDER BY CASE criticality WHEN 'CRITICAL' THEN 0 WHEN 'SUPPORTING' THEN 1 ELSE 2 END, document_type`.
12. **`disQuery` error embeds DB creds** (`postgres://dis:dis@…`) into logs. `disDb.ts:52-55` → redact userinfo (log `host:port/db` only).
13. **Panel 1 Completeness tile still uses a red/amber/green score band** (a score-driven cue the status-led correction removed elsewhere). `RecommendationSummaryPanel.tsx:55-57,162-167` → render neutral (drop `scoreColorClass`) or drive a cue from `completeness_status`; fix the stale `// Same bands the component scores use` comment (line 55, component scores no longer shown here).

## DEFER (noted, not this pit stop)
- **Broad runtime union-validation** over free-VARCHAR columns (`rule_id`/`policy_id`/drools+opa `outcome`/`processing_status`/`fraud_status`) — needs a validator (zod/`assertIn`) framework; all current seed values are in-union, so latent. Harden later.
- **Demo-coherence** error banner / legacy `/api/applications` 404 for replica ids (known item d) — out of 2F scope. Longer-term: derive header identity from the DIS view (add `applicant_name` to the core), or proxy the legacy route to the replica.
- **E2/E1 `INNER` vs `LEFT JOIN`:** a 404 for a *no-recommendation* app is defensible (there is no recommendation to show); the real harm is the page's silent-mock, addressed by fix #2. Leave E2 rec-gated + add a one-line comment documenting the decision.

## Verify after applying
- `DIS_REPLICA_URL=postgres://dis:dis@localhost:5499/openvisa_pg_db npx vitest run src/__tests__/dis-*.test.ts` — expect green; **revisit the queue test** if the envelope (#9) or dead-callback (#7) change touches its assertions.
- `npx tsc --noEmit` — expect 76 baseline (0 in our files).
- Browser spot-check Panel 1 (`DIS_DATA_PROVIDER=replica`): no Score badge, "DIS recommends refusal" on a `RECOMMEND_REJECT` id (e.g. `02f16d3d-…`), neutral completeness tile.

→ then **commit + push** = the Phase-5 pit stop.
