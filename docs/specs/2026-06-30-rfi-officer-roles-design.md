# RFI Lifecycle + Officer/Executive Roles — Design Note (decisions lock)

**Date:** 2026-06-30 · **Owners:** Sam (design), Chris (decisions), Lenny (audit) · **Status:** Draft for Lenny audit — *no JWT/officer/RFI coding starts until this is audited & approved.*

## 0. Purpose, scope, how to read

This note **locks the decisions** for three intertwined pieces of work before we build them:
1. A **two-login model** (Executive vs Officer) for the AMS demo.
2. The **officer gateway** (home) + **RFI lane** (where officers track requests for information).
3. The **RFI lifecycle** state model surfaced across queue → deep review.

**Authority split (unchanged):** `docs/specs/2026-06-11-dis-integration-spec-v5.md` (**V5**) governs **data contracts**; the V4 spec governs **UX**. Most of what follows is **UX + access architecture**, so it is *not* a V5 rewrite. The single genuine V5 touchpoint is the **RFI queue-state** (`AWAITING_INFO` and the return to `READY_FOR_REVIEW`), and even that is **Home-Office-pending** — see §8.

**Guiding constraint (Chris):** RFI deep plumbing is **Phase 2**. This phase builds a *credible, demo-able* scaffold and **defers** the production guts to consultation with the Home Office. Every section below separates **scaffold-now** from **Phase-2 / needs-HO-input**. The canonical run shape stays:
```bash
DATA_PROVIDER=ams-demo AMS_DEMO_CORPUS_PATH=data/demo-corpus PORT=3000 bun run dev
```

---

## 1. Two-login model (Executive vs Officer)

**Decision:** exactly **two demo logins** — one **Admin/Executive**, one **Officer**. **No full RBAC system this phase.** Any RBAC already scaffolded in the repo is left as-is, untouched.

| | **Executive / Admin** | **Officer** |
|---|---|---|
| Purpose | Oversight of the whole AMS | Do the casework on their assigned applications |
| Surfaces | Live Queue (`/dashboard/livequeue`), queue allocations (process-intake / auto-allocate), live reporting (`/dashboard/live-intelligence`), reports, charts | Gateway (`/dashboard/reviewer`), My Queue (`/dashboard/reviewer/queue`), per-case review (`/dashboard/reviewer/[applicationId]`), My RFIs (`/dashboard/reviewer/rfis`) |
| Applicant PII | **No** per-case drill-in (aggregate only) | **Yes**, for their assigned cases |
| Scores shown | Aggregate analytics (numbers OK) | Status-led per-case (no numeric grades) — except the OV-IP panel's deliberate exception |
| Landing on login | `/dashboard/livequeue` | `/dashboard/reviewer` (gateway) |

**Why two roles (the pitch, not just plumbing):**
- **Data minimisation / least privilege** — executives don't open individual passports/bank statements; officers do. This is exactly what a Home Office security review expects, and it's structural here, not a convention.
- **It makes the scoring-display policy structural** — exec = aggregate scores/charts; officer = status-led case. The login boundary *is* the policy boundary (ref: `dis-scoring-display-policy`, `dis-phase1-human-in-loop`).

**Scaffold-now:** the two roles, two landings, and route-gating below.
**Phase-2 / needs-HO:** real IdP/SSO, multi-tenant org structure, fine-grained RBAC (per-permission), team hierarchies, audit logging of access.

---

## 2. JWT / session shape

**Decision:** **JWT** issued at login, stored in an **httpOnly, Secure, SameSite=Lax cookie**, verified in **Next.js middleware** for `/dashboard/**`. Two **seeded** demo accounts. No user DB / signup / password reset this phase.

**Login entry:** reuse/extend the existing sign-in route if present (the old auth stub redirected to `/signin`); otherwise add `/signin`. A POST credential route (e.g. `/api/auth/login`) validates against the two seeded accounts and sets the cookie; `/api/auth/logout` clears it.

**Token claims (locked shape):**
```jsonc
{
  "sub": "user-exec-1" | "user-officer-1", // demo account id
  "role": "admin" | "officer",             // the ONLY access dimension this phase
  "name": "…",                             // display
  "officerId": "officer-demo" | null,      // links an officer login → ConsulateOfficial (queue scoping); null for admin
  "iat": <issued>, "exp": <issued + session TTL>
}
```
- **Secret:** server-side `AUTH_JWT_SECRET` (dev value committed-free; real secret = deploy config). HS256 for the scaffold.
- **Session:** single short-lived token (e.g. 8–12h demo TTL). **No refresh tokens** this phase — expiry = re-login.
- **Identity wiring:** the officer login's `officerId` claim **seeds `OfficerContext`** (today driven by `localStorage['demo-selected-officer-id']` + `OfficerSwitcher`). So "who am I" flows from the token, not a manual pick.
- **OfficerSwitcher:** retained as a **demo-only impersonation** affordance (present an officer's queue without re-logging-in). Available to the Executive/demo role; **not** an officer-facing privilege.

**Scaffold-now:** JWT issue/verify, httpOnly cookie, middleware gate, two seeded accounts, role-based landing.
**Phase-2 / needs-HO:** real credential store + hashing, SSO/OIDC, refresh/rotation, MFA, per-session audit, secret management.

---

## 3. Officer gateway route behavior

**Decision:** **upgrade the existing `/dashboard/reviewer/page.tsx`** (today a hardcoded `mockDashboardStats` page that is already the officer's de-facto landing) into the **officer gateway**. No new gateway route.

**Behavior:**
- **Doorway tiles:** **My Queue** → `/dashboard/reviewer/queue`; **My RFIs** → `/dashboard/reviewer/rfis`; **SLA / today's progress**. Tiles link to real routes. (Org-wide live intelligence stays **executive-only** per §1, so it is *not* an officer tile.)
- **Notifications strip:** derived counts — "RFIs: N awaiting · M overdue · nearest due `<date>`" — computed from the officer's RFI cases (corpus-derived), not a live engine.
- **Identity:** reads the current officer from the JWT/`OfficerContext` (`useOfficer()`); tiles + counts scope to that officer.
- **Nav:** add a **"My RFIs"** item to `SidebarNavigation.tsx` "Visa Processing" (replacing a `href="#"` placeholder); fix "My Queue" to land on the gateway (it already does) with the worklist one tile away.

**Route gating (middleware, by `role` claim):**
| Route | admin | officer |
|---|---|---|
| `/dashboard/livequeue`, `/dashboard/live-intelligence` | ✅ | redirect → `/dashboard/reviewer` |
| `/dashboard/reviewer`, `/reviewer/queue`, `/reviewer/rfis`, `/reviewer/[id]` | redirect → `/dashboard/livequeue` | ✅ |
| unauthenticated | → `/signin` | → `/signin` |

**Scaffold-now:** the gateway tiles, derived strip, "My RFIs" nav, middleware redirects.
**Phase-2:** real per-officer stats (accuracy, throughput), real notification feed, personalisation.

---

## 4. Applicant vs officer RFI permissions

There is **no applicant login this phase** (two logins = admin + officer). The applicant side is **defined here for design clarity** and implemented in Phase 2 (applicant portal). In the demo, the applicant's response is **simulated by the officer's demo control**.

| Action | **Applicant** (Phase-2 portal) | **Officer** (assigned case only) | **Executive** |
|---|---|---|---|
| See the DIS recommendation / scores / officer notes | ❌ never | ✅ | aggregate only |
| Raise / issue an RFI | ❌ | ✅ | ❌ |
| See the RFI request + deadline | ✅ (own case) | ✅ | aggregate count |
| Respond / upload the requested doc | ✅ (own case) | ❌ (officer doesn't upload for them) | ❌ |
| Re-review the response & decide | ❌ | ✅ | ❌ |
| See aggregate RFI volume / SLA health | ❌ | own cases | ✅ |

**Locks:**
- Officers act **only on their assigned cases** (queue scoped by `officerId`).
- Applicants see/respond to **only their own** RFI; never see assessment internals.
- Executives **view** RFI aggregates but **cannot act** on individual RFIs (separation of duties).

**Scaffold-now:** officer permissions (raise/view/re-review/decide on assigned cases) — the existing 3b panel. Applicant response = simulated.
**Phase-2 / needs-HO:** the applicant portal + its authn, applicant notifications, upload handling, the applicant-facing permission enforcement.

---

## 5. Queue / deep-review / RFI state transitions

**Decision (Chris): NO re-ingestion.** When the applicant supplies the missing doc, it is **attached** to the case and the **officer manually assesses** it against DIS's existing (pre-RFI) assessment. **DIS does not re-run or re-score.** The new evidence is labelled "officer-reviewed; DIS re-scoring = Phase 2."

**State model** (uses the existing `QueueState` union in `src/api-contracts/dis.ts` + the `'Awaiting Info'` lifecycle status):

```
READY_FOR_REVIEW                         ← case ready to decide
      │  officer issues RFI
      ▼
AWAITING_INFO   (clock-stop: elapsed SLA PAUSES; not officer touch-time)
      │  applicant responds (supplies doc)        │  deadline passes, no response
      ▼                                           ▼
READY_FOR_REVIEW  (flagged "returned —      OVERDUE  (still AWAITING_INFO + past due_at)
   new evidence; re-review")                  action: chase · decide on available · refuse (non-compliance)
      │  officer decides
      ▼
DECIDED  (Approved / Rejected / or → AWAITING_INFO again if more info needed)
```

**Locks:**
- **Clock-stop:** while `AWAITING_INFO`, the **elapsed SLA clock pauses** (don't penalise the department for applicant delay). Officer **touch-time/capacity** is unaffected (an awaiting case is not the officer's active work). This is the two-clocks model (ref: `officer-capacity-model`).
- **Returned ≠ silent:** a returned case re-enters `READY_FOR_REVIEW` **flagged as a re-review with a diff** ("new: Feb payslip — gap resolved") so the officer doesn't re-read from scratch.
- **Ownership on return:** returns to the **same officer** (they raised it / hold context), with mild priority.
- **No DIS re-run:** the recommendation + component scores remain the pre-RFI ones; only the new doc is added to evidence.

**Scaffold-now:** transitions are **page-local / in-memory**; the RFI lane **derives** state from the corpus (`rfi_lifecycle`, `request.json`, `response.json`, `due_at` vs demo-today); the per-case RFI panel walks GAP → AWAITING → RESPONDED (the existing 3b scaffold). "Overdue" is computed (`slaDaysRemaining`/`due_at`).
**Phase-2 / needs-HO:** real persistence of state, the deadline length (working vs calendar days), the non-response policy (proceed-to-decide vs auto-refuse), real SLA timers, and whether `AWAITING_INFO` should be a first-class V5 queue-state addition.

---

## 6. Demo acceptance path

The demo is **green** only when this click-path works end-to-end (with `DATA_PROVIDER=ams-demo`):

1. Visit `/signin` → log in as **Officer** → JWT cookie set → redirected to **`/dashboard/reviewer`** (gateway).
2. Gateway shows doorway tiles + a derived **"RFIs: N awaiting · M overdue"** strip for that officer.
3. Click **My RFIs** → `/dashboard/reviewer/rfis` → the officer's RFI cases grouped **Awaiting · Returned · Overdue**, each with the gap + due date.
4. Open the RFI hero (`HO-SW-DEEP-2026-00012`) → per-case review renders **all 4 DIS/OV panels per-case** (no mock/synthetic) **+** the RFI panel walks **GAP → AWAITING → RESPONDED** (supplied `PAYSLIPS_002.pdf`, "gap resolved · ready to decide"). **0 console errors.**
5. **Log out** → `/signin`. Log in as **Admin** → redirected to **`/dashboard/livequeue`** → live queue · process-intake · auto-allocate · charts. Attempting `/dashboard/reviewer/HO-SW-DEEP-2026-00012` **redirects** (no per-case PII for admin).
6. Existing 3a/3b acceptance still holds: deep_set cases render Recommendation · Glass Box · Evidence · OV Intelligence per-case; queue allocation respects capacity.

**Evidence required (per Marshall charter):** vitest green + `tsc` 76 baseline + Playwright screenshots of (a) officer gateway, (b) RFI lane, (c) the role-gated redirect, tied to the commit SHA.

---

## 7. Mock / scaffold vs production-ish

| Area | Scaffold-now (built credibly) | Mock / deliberately fake | Phase-2 / needs-HO |
|---|---|---|---|
| Auth | JWT + httpOnly cookie + middleware gate + role landing | **2 fixed seeded accounts**, dev secret, no signup | SSO/OIDC, credential store + hashing, MFA, refresh/rotation, audit |
| Roles | admin \| officer claim check | — | full RBAC, per-permission, org/teams |
| Gateway | real route, tiles, role redirects | derived counts (not live engine); some stats mock | real per-officer stats, notification feed |
| RFI lane | real route, grouped Awaiting/Returned/Overdue, click-through | state **derived from corpus**, in-memory | persistence, real SLA timers, live deadlines |
| RFI lifecycle | per-case panel walkthrough (3 states) | applicant response **simulated**; **no DIS re-ingestion** | applicant portal, notifications, re-ingestion (ruled out), non-response auto-actions |
| Deep review (3a) | **real** per-case DISApplicationView + OVAssessment from enriched corpus | — | live DIS/Azure wiring (LB-6 etc.) |
| Live intelligence | route exists | hardcoded numbers | real analytics |

---

## 8. Open questions for Home Office consultation

1. **RFI deadline:** length, working vs calendar days, reminders cadence.
2. **Non-response policy:** proceed-to-decide on available evidence vs auto-refuse for non-compliance.
3. **Clock-stop:** confirm the elapsed SLA pauses during `AWAITING_INFO` (we assume yes — standard practice).
4. **Re-evaluation:** confirm officers manually assess responses (no DIS re-run) — or do they want re-ingestion later?
5. **`AWAITING_INFO` as a V5 queue-state:** promote to a first-class contract state, or keep derived?
6. **Access model:** is admin/officer enough, or do they need senior-officer / team-lead / read-only auditor tiers (→ real RBAC)?

---

## 9. Decisions locked (checklist)

- [x] Two demo logins only: **admin** + **officer**; no full RBAC this phase.
- [x] Auth = **JWT** in **httpOnly cookie**, verified in **Next middleware**; claims `{sub, role, name, officerId, iat, exp}`; 2 seeded accounts; no refresh.
- [x] **Officer login landing = `/dashboard/reviewer`** (upgrade existing page into the gateway); **admin landing = `/dashboard/livequeue`**.
- [x] Officer identity flows from the **JWT `officerId`** → seeds `OfficerContext`; `OfficerSwitcher` = demo impersonation only.
- [x] **RFI lane** at `/dashboard/reviewer/rfis`, grouped **Awaiting / Returned / Overdue**, corpus-derived.
- [x] Applicant portal = **Phase 2**; officers act only on assigned cases; execs view aggregates, don't act.
- [x] **No DIS re-ingestion** on RFI response; officer manually assesses; **clock-stop** while `AWAITING_INFO`.
- [x] State transitions are **in-memory/derived** for the demo; persistence + real timers = Phase 2.
- [x] Demo acceptance path = §6.

**Next after Lenny audit + approval:** writing-plans → build in order **JWT two-login → officer gateway → RFI lane**. No coding until this note is approved.
