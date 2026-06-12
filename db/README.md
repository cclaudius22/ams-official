# DIS Schema Replica (Phase 2F.1)

Local Postgres replica of the **actual DIS schema**, for building and demoing
the OV read layer (V5 §1b) without any Deloitte dependency.

## Provenance

`ddl/*.sql` is vendored **verbatim** from Deloitte's repo:

- Repo: `Open-Visa/dis-data-layer` (local clone `../dis-repos-deloitte/dis-data-layer`)
- Branch: `feature/psqltable`
- Commit: `ecd23b9805a330a581870287c19b6249ddb18d09` (5 June 2026)

Do not edit `ddl/` by hand — re-vendor from the source branch when it moves
and re-diff (the schema has drifted three times in one week; see V5 §1a).

## ⚠️ Known upstream defect (reported to Deloitte)

`03_applications.sql:34` declares a foreign key referencing
`application_payload(submission_id)`, but `02_submission_payload.sql` creates
the table as `submission_payload` (the old `application_payload` definition is
left commented out in the same file). **Their create-set fails on a fresh
database.** `build-initdb.sh` applies a one-line patch (rewrites the FK target
to `submission_payload`) when staging files into `.initdb/` — the vendored
files stay verbatim.

## Usage

```bash
cd db
./build-initdb.sh          # stage ddl/ -> .initdb/ (applies the FK patch)
docker compose up -d       # postgres:16 on localhost:5499, db openvisa_pg_db
npx tsx ../scripts/seedReplica.ts   # seed from the synthetic corpus (100 apps)
```

Connection string: `postgres://dis:dis@localhost:5499/openvisa_pg_db`
(local dev credentials only — nothing sensitive).

Reset: `docker compose down -v && ./build-initdb.sh && docker compose up -d`.

## Seed data

`../scripts/seedReplica.ts` is **deterministic** (seeded per application id)
and sources from `../../openvisa-synthetic-data/output/json_payloads/`:
100 payloads (50 visakey / 50 govdirect) + `expected_outcomes.json`
(42 APPROVED / 38 REJECTED / 20 MANUAL_REVIEW, with per-application
`rules_triggered` ground truth used to generate the Glass Box trace).
Phase 1 mapping applies: expected REJECTED → recommendation `MANUAL_REVIEW`
with `hard_fail_rules` populated (REJECT is disabled as-built, V5 §5).
