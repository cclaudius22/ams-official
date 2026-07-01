# AMS Demo Corpus 2026-06-24

Generated from the DIS-aligned GovDirect v4 Skilled Worker corpus for the multi-visa queue, throughput, and RFI demo.

## Layout

- `bulk/` — 1,000 GovDirect-shaped applications for queue/allocation/distribution/throughput.
- `deep_set/` — 18 Skilled Worker review cases sourced from `output/govdirect_v4_batch100`, with DIS/OV review fields and 3 RFI lifecycle hero cases.

## Locked Mix

Bulk visa types:

- skilled-worker: 300
- student: 300
- senior-specialist-worker: 120
- spouse-partner: 120
- global-talent: 100
- innovator-founder: 60

Bulk recommendations:

- RECOMMEND_APPROVE: 600
- RECOMMEND_REJECT: 250
- MANUAL_REVIEW: 150

Recommendation is deterministic from `anomaly_type`:

- `clean` -> `RECOMMEND_APPROVE`
- `fail_rules` -> `RECOMMEND_REJECT`
- `suspicious` / `edge_case` -> `MANUAL_REVIEW`

## Notes

The non-Skilled Worker routes are queue/allocation depth only, matching the spec's Phase 1/Phase 2 decision. Skilled Worker is the Phase 1 deep route.
