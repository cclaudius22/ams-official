# Read-layer correction — outcome vocab, human-in-the-loop, status-led (17 Jun 2026)

Design record for the correction triggered by the v3.0 *Component Scoring & Recommendation* spec (Confluence DD/63799317) + Chris's clarifications. Approved by Chris (Option 1 + the queue-state table below). Applied before the Phase-5 review so the review runs against correct code.

## 1. Outcome vocabulary

The pipeline emits **`RECOMMEND_APPROVE` / `RECOMMEND_REJECT` / `MANUAL_REVIEW`** — the only values produced (NOT `APPROVE`/`REJECT`, NOT `APPROVED`/`REJECTED`). All three are LIVE; `RECOMMEND_REJECT` is **not** disabled. Our earlier `APPROVE`/`MANUAL_REVIEW` reading came from a stale DDL snapshot vendored into the replica.

## 2. Phase-1 = human-in-the-loop

Every processed application goes to a caseworker. The recommendation is advisory.

| DIS outcome | queue_state | What the caseworker sees |
|---|---|---|
| `RECOMMEND_APPROVE` | `READY_FOR_REVIEW` | "DIS recommends approval" — review and confirm |
| `RECOMMEND_REJECT` | `READY_FOR_REVIEW` | "DIS recommends refusal" — review and confirm |
| `MANUAL_REVIEW` | `READY_FOR_REVIEW` | "DIS flags for attention" — review soft flags |
| pipeline still running | `IN_PIPELINE` | not ready yet |

`AUTO_RECOMMENDED` / `CALLBACK_SENT` = **Phase-2 only** (programmatic decisioning, with VisaKey). Not produced in Phase 1.

## 3. Status-led officer view (no numbers)

Scores are background-only (routing/fast-tracking, audit, BigQuery). The officer sees component **STATUS** labels (VALID / SUFFICIENT / VERIFIED / MET / COMPLIANT / CLEAR / HIGH_QUALITY / LOW_RISK) + the Glass Box rule trace + flags + evidence. Remove Panel 1's `Score: N/100` aggregate. No numeric/aggregate score in the officer UI. (Matches the spec: rule-driven, not score-driven; no `overall_score`.)

## Code impact

`dis.ts` (RecommendationOutcome union + QueueState Phase-2 notes) · `normalizeOutcome` (RECOMMEND_* cases) · `deriveQueueState` (all outcomes → READY_FOR_REVIEW; drop callback dependence) · replica DDL CHECK + seed mapping (RECOMMEND_*; `REJECTED → RECOMMEND_REJECT` so all three outcomes are seeded — new split ~42/38/20) · query modules (drop callback_delivered) · `DISQueueRow` · `RecommendationSummaryPanel` (remove score badge + recommendation phrasing) · tests. Then re-seed + Phase-5 review.
