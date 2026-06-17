# AMS Officer Dashboard — what we're building (TL;DR for Nishit)

*Prepared 17 June 2026. A short overview of the AMS officer dashboard and how it consumes the DIS read endpoints.*

The AMS dashboard is the **caseworker-facing review surface** for visa applications processed by DIS. Guiding principle: **AI extracts, rules decide, the officer determines** — DIS produces a deterministic recommendation (Drools + OPA), the dashboard presents it transparently, and the human caseworker makes the final decision. It is **read-only** against DIS.

## Screens / components

- **Review Queue** — paginated list of applications awaiting a caseworker, filtered to those DIS refers for manual review, with visa-type filtering.
- **Application Review** — three panels:
  1. **Recommendation Summary** — the DIS outcome (approve / refer to manual review), the nine component scores, a rules-and-policies summary, hard-fail / soft-flag chips, and a plain-English case summary (clearly labelled AI-generated and non-binding).
  2. **Glass Box Rule Trace** — full explainability: every Drools rule and OPA policy with its outcome, reasoning, and **denial reasons**, so the officer can see exactly why the system landed where it did.
  3. **Evidence** — per-document extraction cards (extracted fields + fraud signals) and external-check results, with the original document viewable alongside.

## DIS data it consumes (maps to the read endpoints)

| Dashboard need | Read endpoint |
|---|---|
| Review queue / list — outcome + completeness, paginated | applications list |
| Recommendation detail — recommendation + component scores | application detail |
| Glass Box trail — incl. `opa_evaluations.denial_reasons` (the callback omits these) | rules / policy trail |
| Document evidence — with a retrievable image reference | documents |
| External-check evidence — incl. response detail | external checks |

## Not in this build

Role-based access control and rules-management admin — later phases.
