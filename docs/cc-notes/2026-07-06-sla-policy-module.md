# SLA Policy Module - Product Note

**Date:** 2026-07-06  
**Context:** AMS executive demo, officer gateway SLA framing

## Current State

The current AMS demo SLA signal is illustrative platform logic, not a client-government-configured policy model.

Today the gateway derives SLA status from hard-coded demo assumptions:

- `SLA_WORKING_DAYS = 15`
- case `submittedAt` dates
- current runtime date
- gateway summary copy such as "N cases overdue"

This is enough to show the platform capability: surfacing queue age, overdue risk, officer workload pressure, and operational prioritisation. It should not be represented as the client's actual SLA policy.

## Demo Framing

Use this framing in executive demos:

> These SLA indicators are configurable operational signals. For the demo, we are using an illustrative SLA model so you can see how the platform would surface ageing, overdue cases, and queue risk once the client's actual policy thresholds are configured.

## Product Direction

AMS needs a proper SLA Policy module so client governments can configure how operational clocks work.

Expected policy dimensions:

- visa route or product type
- application stage or workflow state
- SLA duration per stage
- working-day calendar
- public holidays and regional calendars
- pause/resume rules, including RFI and applicant-response waiting time
- escalation thresholds
- overdue definitions
- officer/team/region overrides where permitted
- versioned effective dates
- audit trail for policy changes

## Product Decision

For now, SLA should be treated as demo capability, not a fixed client policy.

Demo-ready should be blocked if the current gateway accidentally implies a real SLA breach pattern, for example all Rachel deep-review cases showing overdue only because the real date has drifted beyond the curated corpus dates.

Preferred short-term demo fix: use a fixed AMS demo-today anchor so curated case timing remains stable.

Preferred product fix: build SLA Policy configuration as a first-class module rather than continuing to encode policy inside utility functions.

## Demo-ready blockers — concrete tickets (Sam, 6 Jul; per Marshall's RC direction these do NOT block the merge)

1. **Fixed demo-today anchor.** Introduce a single `AMS_DEMO_TODAY` source (env or config, e.g. `2026-06-30`) consumed by every date-relative derivation on the demo path — gateway SLA tile (`officerGatewayStats`), worklist `slaDaysRemaining` display, RFI lane overdue derivation (`getRfiQueue(nowISO)` already parameterised). Acceptance: gateway does NOT show "18 cases overdue" for Rachel on any real calendar date; RFI hero due-dates stay in their designed states.
2. **`slaDaysRemaining` working-day math.** `src/lib/officerQueue.ts` does calendar-day subtraction under a `SLA_WORKING_DAYS` name, and Task 6 made it a headline stat. Either implement real working-day math (weekends at minimum; holidays = SLA-module scope) or relabel the UI copy until the module exists. Acceptance: displayed "working days" figures are actually working days.
3. **Copy guard.** Wherever SLA numbers render, the caption must not imply client policy — "illustrative SLA model" framing per §Demo Framing above.

Owner note: item 1 is cross-cutting demo infrastructure (Sam's lane, small); item 2 is a focused util fix + test retarget (Sam's lane); corpus date refresh is the alternative lever (Lenny's lane) if the anchor is rejected.

## Decision (Chris, 8 Jul) — fix with COPY, not maths

For the demo we are **not** building the anchor or the working-day maths. The corpus made a clean anchor impossible anyway: deep_set is uniformly submitted 2026-06-04 (≈15-working-day deadline 25 Jun), while bulk runs to 24 Jun and the RFI heroes respond 27 Jun — so no single fixed "today" keeps deep_set not-overdue *and* the other date-relative states coherent. Building the maths now "but not integrating it is the worst middle ground: more code, more tests, more drift, no demo value" (Chris).

**Shipped instead:** the officer-gateway "SLA position" tile (`src/app/dashboard/reviewer/page.tsx`) no longer derives an SLA headline from corpus dates. It now reads:

- Title: **SLA policy**
- Headline: **Defined in Policy Manager**
- Subtext: **Client SLA rules, working calendars, and escalation thresholds are configured centrally.**

The derivation helpers (`src/lib/officerGatewayStats.ts`) and their tests are kept intact but **unwired** from the page — they are the seed for the post-demo work below. The demo-today anchor is deferred to *optional* status (only if we later need date-relative demo states elsewhere, e.g. the RFI lane — which today is stable because heroes are `returned`).

Acceptance met: `/dashboard/reviewer` no longer headlines "18 overdue"/"everything overdue"; SLA copy is honest and points to future Policy Manager configuration.

## Post-demo ticket — Policy Manager / SLA configuration (OPEN)

Build a first-class Policy Manager module for client-configured SLA rules:

- visa route / product type
- workflow stage
- SLA duration
- working-day calendar
- public holidays
- RFI pause/resume
- escalation thresholds
- overdue definitions
- effective dates / versioning
- audit trail

Also replace the current calendar-day helper (`slaDaysRemaining` in `src/lib/officerQueue.ts`) with a **true working-day calculation** once Policy Manager exists. Working-day maths and the demo-today anchor both remain open, tracked here — deferred, not dropped.

